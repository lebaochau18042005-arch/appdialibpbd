import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

// Initialize with environment API key
const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY }); // Assuming you have this set locally or hardcode text

async function testGenAI() {
    try {
        const promptText = "Trích xuất câu hỏi từ file này thành JSON";
        
        // Mock a small inlineData object
        const inlineData = {
          data: Buffer.from("test").toString('base64'),
          mimeType: "text/plain"
        };
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [promptText, { inlineData }]
        });
        console.log("Success:", response.text);
    } catch (e) {
        console.error("Failed:", e);
    }
}

testGenAI();
