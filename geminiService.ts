
import { GoogleGenAI } from "@google/genai";

export const generateObjectives = async (title: string): Promise<string> => {
  if (!title) return "Sila isi tajuk program terlebih dahulu.";
  
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Kunci API tidak dijumpai. Sila pastikan sistem telah dikonfigurasikan.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Bertindak sebagai guru SSEMJ. Berikan 3 objektif program yang ringkas dan profesional dalam Bahasa Melayu untuk program: "${title}". 
      Format:
      1) [Objektif]
      2) [Objektif]
      3) [Objektif]`,
    });
    
    return response.text?.trim() || "Tiada respon dari AI.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `Ralat AI: ${error.message || "Gagal menyambung ke pelayan AI."}`;
  }
};

export const generateSummary = async (title: string): Promise<string> => {
  if (!title) return "Sila isi tajuk program terlebih dahulu.";

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Kunci API tidak dijumpai.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Bertindak sebagai guru SSEMJ. Berikan 3 impak atau rumusan positif yang ringkas bagi program: "${title}".
      Format:
      1) [Impak]
      2) [Impak]
      3) [Impak]`,
    });
    
    return response.text?.trim() || "Tiada respon dari AI.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `Ralat AI: ${error.message || "Gagal menjana rumusan."}`;
  }
};
