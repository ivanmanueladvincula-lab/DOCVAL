// const { GoogleGenAI } = require("@google/genai");
import { GoogleGenAI } from "@google/genai";
import { baseSchema, docTypeSchema } from "./schema";
import { baseInstruction, docTypeInstruction } from "./instruction";

// Configure the SDK with your Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const normalizeDocumentType = (documentType) =>
  documentType?.trim().toLowerCase();

const buildGeminiConfig = (documentType) => {
  const normalizedType = normalizeDocumentType(documentType);
  const responseSchema = docTypeSchema[normalizedType] || baseSchema;
  const extraInstruction = docTypeInstruction[normalizedType] || "";

  return {
    responseMimeType: "application/json",
    systemInstruction: extraInstruction
      ? `${baseInstruction} ${extraInstruction}`
      : baseInstruction,
    responseSchema,
  };
};

async function generateAIReport(documentBase64, options = {}) {
  const { documentType } = options;
  const config = buildGeminiConfig(documentType);
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        text: documentType
          ? `Provide a detailed report on this ${documentType} document.`
          : "Provide a detailed report on this document.",
      },
      { inlineData: { mimeType: "application/pdf", data: documentBase64 } },
    ],
    config: config,
  });

  const text = result.text;
  const response = JSON.parse(text);

  return response;
}

export { generateAIReport };
