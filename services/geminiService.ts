
import { GoogleGenAI } from "@google/genai";

export const generateObjectives = async (title: string): Promise<string> => {
  if (!title) return "Sila isi tajuk program terlebih dahulu.";
  
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key tidak dijumpai.");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Bertindak sebagai guru di Sekolah Seni Malaysia Johor (SSEMJ). Jana 3 objektif program yang profesional, ringkas dan padat dalam Bahasa Melayu untuk program: "${title}".
      
      Syarat:
      1. Berikan hasil dalam senarai bernombor 1), 2), 3).
      2. Jangan ada mukadimah.
      3. Mulakan setiap objektif dengan kata kerja (cth: Meningkatkan, Memupuk).`,
    });
    
    return response.text || "AI gagal menjana teks. Sila cuba lagi.";
  } catch (error: any) {
    console.error("Gemini Error (Objectives):", error);
    return `Ralat AI: Sila pastikan sambungan internet stabil. (${error.message})`;
  }
};

export const generateSummary = async (title: string): Promise<string> => {
  if (!title) return "Sila isi tajuk program terlebih dahulu.";

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key tidak dijumpai.");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Bertindak sebagai guru SSEMJ. Jana 3 impak atau rumusan positif yang ringkas dalam Bahasa Melayu bagi program: "${title}".
      
      Syarat:
      1. Format senarai bernombor 1), 2), 3).
      2. Jangan ada ayat pengenalan.
      3. Padat dan profesional.`,
    });
    
    return response.text || "AI gagal menjana rumusan. Sila cuba lagi.";
  } catch (error: any) {
    console.error("Gemini Error (Summary):", error);
    return `Ralat AI: Gagal menjana rumusan. (${error.message})`;
  }
};
