import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { AnalysisResult, MapResult, Language } from "../types";
import { languageNames } from "../translations";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    scientificName: { type: Type.STRING },
    severity: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
    description: { type: Type.STRING },
    affectedCrops: { type: Type.ARRAY, items: { type: Type.STRING } },
    symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
    treatments: { type: Type.ARRAY, items: { type: Type.STRING } },
    prevention: { type: Type.ARRAY, items: { type: Type.STRING } },
    confidence: { type: Type.NUMBER }
  },
  required: ["name", "severity", "description", "treatments", "prevention", "symptoms"],
};

// 1. Analyze Image (Gemini 3 Pro Preview)
// 8. Thinking Mode (Gemini 3 Pro Preview + Thinking)
export const analyzePestImage = async (file: File, useThinking = false, language: Language = 'en'): Promise<AnalysisResult> => {
  try {
    const ai = getClient();
    const base64Data = await fileToGenerativePart(file);
    const langName = languageNames[language];
    
    const prompt = `
      Act as an expert agricultural extension officer specializing in West African crop protection.
      Analyze this crop image. Identify the pest, disease, or deficiency.
      Provide structured advice for a farmer.
      
      IMPORTANT: Provide the response content in ${langName}. 
      However, for the 'severity' field, you MUST use the English enum values: "High", "Medium", or "Low".
      Translate pest names, symptoms, treatments, and prevention methods to ${langName}.
    `;

    const modelId = "gemini-3-pro-preview";
    const config: any = {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
    };

    if (useThinking) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: config
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

// 6. Fast AI Responses (Gemini 2.5 Flash Lite)
export const getQuickTip = async (language: Language = 'en'): Promise<string> => {
  try {
    const ai = getClient();
    const langName = languageNames[language];
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `Give me one short, practical tip for preventing pests in farming. Respond in ${langName}.`,
    });
    return response.text || "Keep your farm clean to prevent pests.";
  } catch (error) {
    console.error("Quick tip error:", error);
    return "Regularly scout your fields for early signs of damage.";
  }
};

// 4. AI Chatbot (Gemini 3 Pro Preview)
export const chatWithExpert = async (history: { role: string, parts: { text: string }[] }[], message: string, language: Language = 'en') => {
  const ai = getClient();
  const langName = languageNames[language];
  const chat = ai.chats.create({
    model: "gemini-3-pro-preview",
    history: history,
    config: {
      systemInstruction: `You are an expert agricultural consultant for African farmers. 
      You MUST strictly communicate in ${langName}. 
      If the user speaks another language, politely answer in ${langName} while acknowledging their query.
      Provide accurate, practical farming advice, pest control methods, and market tips suitable for the region.
      Keep responses concise and easy to understand for farmers.`,
    }
  });
  
  const result = await chat.sendMessage({ message });
  return result.text;
};

// 3. Google Maps Grounding (Gemini 2.5 Flash)
export const findAgroServices = async (query: string, lat: number, lng: number, language: Language = 'en'): Promise<MapResult> => {
  const ai = getClient();
  const langName = languageNames[language];
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find ${query} near the provided location. List the best options. Respond in ${langName}.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    }
  });

  const places = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((chunk: any) => chunk.maps)
    .map((chunk: any) => ({
      title: chunk.maps.title,
      uri: chunk.maps.uri 
    })) || [];

  const validPlaces = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((c: any) => c.maps || c.web)
    .filter((c: any) => c && c.title && c.uri) || [];

  return {
    text: response.text || "I found some locations for you.",
    places: validPlaces as any
  };
};

// 7. Generate Speech (Gemini 2.5 Flash Preview TTS)
export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getClient();
  // The text is already localized from the analysis result
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: { parts: [{ text }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  return base64Audio;
};

// 1. Nano Banana (Image Editing - Gemini 2.5 Flash Image)
export const editCropImage = async (file: File, prompt: string, language: Language = 'en'): Promise<string> => {
  const ai = getClient();
  const base64Data = await fileToGenerativePart(file);
  const langName = languageNames[language];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        },
        // Append language instruction to the prompt
        { text: `${prompt}. (Interpret the prompt in ${langName} context if applicable)` },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (part && part.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Image generation failed");
};