import { GoogleGenAI, Modality } from "@google/genai";
import { STYLES } from '../constants';
import type { HeadshotStyle } from '../types';

// Custom error for more specific feedback to the user.
export class GenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GenerationError';
  }
}

// Fix: Adhere to Gemini API initialization guideline.
// The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const suggestStyle = async (profession: string): Promise<HeadshotStyle | null> => {
  // Fix: Removed unnecessary API_KEY check. The app should handle missing keys at a higher level or assume it's set.
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following profession or description, which of these headshot styles would be most appropriate? Profession: "${profession}". Available styles: Corporate, Creative, Casual, Dramatic. Respond with only the name of the best style.`,
    });
    const suggestedStyleName = response.text.trim().toLowerCase();
    const foundStyle = STYLES.find(style => style.name.toLowerCase() === suggestedStyleName);
    return foundStyle || null;
  } catch (error) {
    console.error("Error suggesting style:", error);
    return null;
  }
};


export const generateHeadshots = async (files: File[], style: HeadshotStyle, count: number, removePiercings: boolean): Promise<string[]> => {
    const imageParts = await Promise.all(files.map(fileToGenerativePart));
    const basePrompt = style.prompt;

    const generateSingleImage = async (removePiercingsFlag: boolean): Promise<string | null> => {
        const qualityEnhancers = `
          **Critical Quality Requirements:**
          - The final output should be a breathtaking, professional, and ultra-realistic photograph with a unique composition.
          - The environment must be elegant and elevate the subject's stature, complementing the chosen style.
          - Be creative with the outfit and background to ensure a distinct look.

          **Facial Expression & Digital Retouching:**
          - Ensure the subject has a confident, professional, and approachable expression.
          - Subtly correct for minor issues like squinting due to bright light.
          - Ensure any smile appears natural and engaging, not forced or awkward. The final expression should be the subject's best look.
        `;

        let negativePrompt = `
          **CRITICAL Negative Constraints (ABSOLUTELY AVOID):**
          - **TOP PRIORITY / NON-NEGOTIABLE:** The output MUST be a single, complete, full-frame photograph. DO NOT generate grids, collages, tiled images, diptychs, triptychs, or any form of split-panel or multi-part image.
          - **CRITICAL:** The output MUST contain only one person. DO NOT generate multiple faces, multiple people, or duplicate figures in one image.
          - AVOID cliché or repetitive poses, outfits, and backgrounds.
          - AVOID deformed hands, limbs, or facial features.
          - AVOID blurry, low-resolution, or grainy results.
          - AVOID unrealistic or distorted backgrounds.
          - AVOID watermarks, text, logos, or any other artifacts.
        `;

        if (removePiercingsFlag) {
            negativePrompt += "\n- AVOID nose rings or other facial piercings. Earrings are acceptable.";
        }
        
        const fullPrompt = `
        ${basePrompt} 
        ${qualityEnhancers} 
        ${negativePrompt}`;
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        ...imageParts,
                        { text: fullPrompt }
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            // Fix: Added optional chaining for safer access to response properties.
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                    return imageUrl; // Return the first and only image
                }
            }
             return null; // No image returned from a successful call
        } catch (error) {
            console.error("A single image generation failed:", error);
            // In case of a single failure, we return null and let the calling context handle it.
            return null;
        }
    };
    
    // Create an array of promises, one for each requested image.
    const generationPromises: Promise<string | null>[] = [];
    for (let i = 0; i < count; i++) {
        generationPromises.push(generateSingleImage(removePiercings));
    }

    // Execute all promises in parallel.
    try {
        const results = await Promise.all(generationPromises);
        
        // Filter out any null results from failed generations.
        const successfulImages = results.filter((img): img is string => img !== null);

        if (successfulImages.length === 0 && count > 0) {
            throw new GenerationError('The AI failed to generate any images. This could be due to a content policy issue or a problem with the uploaded photos.');
        }

        return successfulImages;

    } catch (error) {
        console.error("Error generating headshots batch:", error);

        if (error instanceof GenerationError) {
            throw error; // Re-throw custom errors
        }
        
        throw new GenerationError('An unexpected error occurred while generating headshots. Please check your connection and try again.');
    }
};