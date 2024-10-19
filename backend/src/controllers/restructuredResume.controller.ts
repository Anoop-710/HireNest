import { Request, Response } from "express";
import User from "../models/auth.model";
import { uploadFile, generateContent } from "../lib/geminiService";
import axios from "axios";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import puppeteer from "puppeteer"; // Import Puppeteer for PDF generation
import cloudinary from "../lib/cloudinary";

const writeFileAsync = promisify(fs.writeFile);
const unlinkFileAsync = promisify(fs.unlink);

type AuthenticatedRequest = Request & {
  user?: typeof User.prototype;
};

// Helper function to generate PDF from HTML content
const generatePDF = async (htmlContent: string, outputPath: string) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1123, height: 1587 });
    await page.setContent(htmlContent);

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    await browser.close();
  } catch (error: string | any) {
    console.error("Puppeteer PDF generation error:", {
      message: error.message,
      stack: error.stack,
      details: error,
    });
    throw error; // Ensure the error bubbles up and gets handled in the catch block
  }
};

export const restructureResume = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { resumeUrl, jobDescription } = req.body;
    console.log("Resume URL:", resumeUrl);
    console.log("Job Description:", jobDescription);

    if (!resumeUrl || !jobDescription) {
      res
        .status(400)
        .json({ message: "Resume URL and job description are required" });
      return;
    }

    // Download resume PDF from Cloudinary
    const response = await axios.get(resumeUrl, {
      responseType: "arraybuffer",
    });
    const pdfBuffer = response.data;

    // Save the buffer to a temporary file
    const tempFilePath = path.join(__dirname, "tempResume.pdf");
    await writeFileAsync(tempFilePath, pdfBuffer);

    // Upload the temporary file to Gemini
    const uploadResponse = await uploadFile(tempFilePath);

    // Delete the temporary file
    await unlinkFileAsync(tempFilePath);

    // Generate tailored resume content
    const tailoredResume = await generateContent(
      uploadResponse.file.uri,
      jobDescription
    );

    // Parse the tailored resume content into a structured format
    const htmlContent = `
    <html>
    <head>
      <style>
        /* Add CSS styling here to format the resume */
      </style>
    </head>
    <body>
      <pre style="white-space: pre-wrap;">${tailoredResume}</pre>
      <!-- Add more sections based on tailoredResume data -->
    </body>
    </html>
  `;
    // Define path to save the PDF
    const pdfPath = path.join(__dirname, "tailoredResume.pdf");

    // Generate the PDF from HTML content
    await generatePDF(htmlContent, pdfPath);

    // Upload to Cloudinary
    cloudinary.uploader.upload(
      pdfPath,
      { resource_type: "raw" },
      async function (error, result) {
        if (error) {
          console.error("Cloudinary upload error:", {
            message: error.message,
            stack: error.stack,
            details: error,
          });
          res
            .status(500)
            .json({ message: "Error uploading file to Cloudinary", error });
        } else {
          // Respond with the Cloudinary URL
          res.status(200).json({
            message: "Resume restructured and saved as PDF",
            pdfUrl: result?.secure_url,
          });

          try {
            // Delete the temporary file after successful upload
            await unlinkFileAsync(pdfPath);
          } catch (deleteError) {
            console.error("Error deleting temporary PDF file:", deleteError);
          }
        }
      }
    );
  } catch (error: string | any) {
    console.error("Error restructuring resume:", {
      message: error.message,
      stack: error.stack,
      additionalInfo: error.response?.data || error,
    });
    if (process.env.NODE_ENV !== "production") {
      res.status(500).json({
        message: "Failed to restructure resume",
        error: error.message,
        stack: error.stack,
        additionalInfo: error.response?.data || error,
      });
    } else {
      res.status(500).json({ message: "Failed to restructure resume" });
    }
  }
};
