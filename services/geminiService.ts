
import { GoogleGenAI, Type } from "@google/genai";
import { fileToBase64 } from "../utils/fileUtils";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const textModel = 'gemini-2.5-flash';
const visionModel = 'gemini-2.5-flash';

const paletteSchema = {
  type: Type.OBJECT,
  properties: {
    palette: {
      type: Type.ARRAY,
      description: "An array of 5 hex color code strings representing the color palette.",
      items: {
        type: Type.STRING,
        description: "A hex color code string, e.g., '#RRGGBB'.",
      },
    },
  },
  required: ['palette'],
};

const parseAndValidatePalette = (responseText: string): string[] => {
    try {
        const result = JSON.parse(responseText);
        if (result.palette && Array.isArray(result.palette) && result.palette.every(c => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c))) {
            return result.palette;
        }
        throw new Error("Invalid palette format in AI response");
    } catch (e) {
        console.error("Failed to parse AI response:", responseText, e);
        throw new Error("The AI returned an unexpected response format. Please try again.");
    }
}

export const extractPaletteFromCss = async (css: string): Promise<string[]> => {
    const prompt = `Analyze the following CSS code and extract a cohesive 5-color palette. The palette should include primary, secondary, and accent colors that represent the overall theme. Return the result as a JSON object with a "palette" key containing an array of 5 hex color strings.
    
    CSS Code:
    \`\`\`css
    ${css}
    \`\`\``;

    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: paletteSchema,
            temperature: 0.2,
        }
    });

    return parseAndValidatePalette(response.text);
};

export const extractPaletteFromUrl = async (url: string): Promise<string[]> => {
    const prompt = `Imagine a brand and website for the URL: "${url}". Based on the domain name, potential industry, and target audience, generate a fitting 5-color palette. Return the result as a JSON object with a "palette" key containing an array of 5 hex color strings.`;

    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: paletteSchema,
            temperature: 0.7,
        }
    });

    return parseAndValidatePalette(response.text);
};

export const extractPaletteFromImage = async (imageFile: File): Promise<string[]> => {
    const base64Image = await fileToBase64(imageFile);
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: imageFile.type,
        },
    };
    const textPart = {
        text: `Analyze this image and extract the 5 most representative and harmonious colors from it. Return a JSON object with a "palette" key containing an array of 5 hex color strings.`,
    };

    const response = await ai.models.generateContent({
        model: visionModel,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: paletteSchema,
        }
    });

    return parseAndValidatePalette(response.text);
};

export const generateThemeName = async (colors: string[]): Promise<string> => {
    const prompt = `Based on this color palette [${colors.join(', ')}], generate a short, creative, and evocative name for a color theme. Examples: "Oceanic Sunset", "Forest Whisper", "Cyberpunk Neon". Return only the name as a plain string, with no quotes or extra text.`;

    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            temperature: 0.8,
        }
    });

    const name = response.text.trim().replace(/"/g, ''); // Trim and remove any quotes
    if (!name) {
        throw new Error("AI returned an empty name.");
    }
    return name;
};
