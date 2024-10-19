import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiApiKey);
const fileManager = new GoogleAIFileManager(geminiApiKey);

export const uploadFile = async (filePath: string) => {
  try {
    const response = await fileManager.uploadFile(filePath, {
      mimeType: "application/pdf",
      displayName: "Resume PDF",
    });
    return response;
  } catch (error: any) {
    console.error(
      "Error uploading file to Gemini:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to upload file to Gemini");
  }
};

export const generateContent = async (
  fileUri: string,
  jobDescription: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const requests = [
      "Can you please restructure the Experience and Projects sections to align with the provided job description.",
      "Please tailor the Experience and Projects sections to match the following job description.",
      "Can you revise only the Experience and Projects sections based on this job description.",
      "Kindly modify the Experience and Projects sections to suit this job description.",
    ];
    const randomRequest = requests[Math.floor(Math.random() * requests.length)];

    const response = await model.generateContent([
      {
        fileData: {
          mimeType: "application/pdf",
          fileUri: fileUri,
        },
      },
      {
        text: `${randomRequest} ${jobDescription}`,
      },
    ]);

    if (!response || !response.response) {
      throw new Error("Blocked content due to recitation restriction.");
    }

    const tailoredContent = response.response.text();
    return tailoredContent;
  } catch (error) {
    console.error("Content blocked due to recitation restriction.", error);
    throw new Error(
      "Restructuring failed: Recitation restriction by Gemini API."
    );
  }
};
