import { Request, Response } from "express";
import User from "../models/auth.model";
import { uploadFile, generateContent } from "../lib/geminiService";
import axios from "axios";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import PDFDocument from "pdfkit"; // Import PDFKit
import cloudinary from "../lib/cloudinary";

const writeFileAsync = promisify(fs.writeFile);
const unlinkFileAsync = promisify(fs.unlink);

type AuthenticatedRequest = Request & {
  user?: typeof User.prototype;
};

// Helper function to generate PDF from text content
const generatePDF = (content: string, outputPath: string) => {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(outputPath);

    writeStream.on("finish", () => {
      resolve(); // Resolve the promise when the PDF is written
    });

    writeStream.on("error", (error) => {
      console.error("PDF write error:", error);
      reject(error); // Reject the promise on error
    });

    doc.pipe(writeStream);

    // Add content to PDF
    doc.fontSize(12).text(content, { align: "left" });

    doc.end(); // Finalize the PDF and end the stream
  });
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

    // Define path to save the PDF
    const pdfPath = path.join(__dirname, "tailoredResume.pdf");

    // Generate the PDF from the tailored resume content
    await generatePDF(tailoredResume, pdfPath);

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
