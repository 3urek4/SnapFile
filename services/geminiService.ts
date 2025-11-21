import { GoogleGenAI } from "@google/genai";
import { SnapFile } from "../types";

// We use the Gemini 2.5 Flash model for fast, efficient summarization
const MODEL_NAME = "gemini-2.5-flash";

export const analyzeFiles = async (files: SnapFile[]): Promise<string | undefined> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("Gemini API Key not found. Skipping AI analysis.");
    return undefined;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Filter for text-readable files (mock logic for demo, assumes text content is in base64 or simple string)
    // In a real app, we'd decode the base64 and check mime types carefully.
    const textFiles = files.filter(f => f.type.startsWith('text/') || f.name.endsWith('.txt') || f.name.endsWith('.md') || f.name.endsWith('.json'));

    if (textFiles.length === 0) return undefined;

    // Prepare content for Gemini
    // We will take the first text file to summarize for this demo to save tokens/complexity
    const targetFile = textFiles[0];
    
    // Decode base64 data
    const decodedContent = atob(targetFile.data.split(',')[1]);
    // Truncate if too huge to avoid token limits in this simple demo
    const truncatedContent = decodedContent.substring(0, 10000);

    const prompt = `Analyze the following file content named "${targetFile.name}". Provide a concise, one-sentence summary of what this file contains. Content: ${truncatedContent}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return undefined; // Fail gracefully
  }
};