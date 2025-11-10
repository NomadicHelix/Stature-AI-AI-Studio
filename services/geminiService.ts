import { GoogleGenerativeAI } from "@google/generative-ai";
import { STYLES } from "../constants";
import type { HeadshotStyle } from "../types";

export class GenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenerationError";
  }
}

// Use the consistent VITE_ prefix for environment variables
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const suggestStyle = async (
  profession: string,
): Promise<HeadshotStyle | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Using a text model for text task

    const prompt = `Based on the following profession or description, which of these headshot styles would be most appropriate? Profession: "${profession}". Available styles: Corporate, Creative, Casual, Dramatic. Respond with only the name of the best style.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestedStyleName = response.text().trim().toLowerCase();

    const foundStyle = STYLES.find(
      (style) => style.name.toLowerCase() === suggestedStyleName,
    );
    return foundStyle || null;
  } catch (error) {
    console.error("Error suggesting style:", error);
    return null;
  }
};

export const generateHeadshots = async (
  files: File[],
  style: HeadshotStyle,
  count: number,
  removePiercings: boolean,
): Promise<string[]> => {
  const imageParts = await Promise.all(files.map(fileToGenerativePart));

  const generateSingleImage = async (removePiercingsFlag: boolean): Promise<string | null> => {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image", // The correct, working model name
    });

    const basePrompt = style.prompt;

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
    
    const fullPrompt = `${basePrompt} ${qualityEnhancers} ${negativePrompt}`;
    
    try {
      const result = await model.generateContent([fullPrompt, ...imageParts]);
      const response = await result.response;

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0 || !candidates[0].content || !candidates[0].content.parts) {
        console.error("Invalid response structure from API");
        return null;
      }
      
      for (const part of candidates[0].content.parts) {
          if (part.fileData) {
              const imageUrl = `data:${part.fileData.mimeType};base64,${part.fileData.fileUri}`;
              return imageUrl; // Return the first and only image
          }
      }
      return null;
    } catch (error) {
      console.error("A single image generation failed:", error);
      return null;
    }
  };
  
  const generationPromises = Array(count).fill(null).map(() => generateSingleImage(removePiercings));

  try {
    const results = await Promise.all(generationPromises);
    const successfulImages = results.filter((img): img is string => img !== null);

    if (successfulImages.length === 0 && count > 0) {
      throw new GenerationError('The AI failed to generate any images. This could be due to a content policy issue or a problem with the uploaded photos.');
    }
    return successfulImages;
  } catch (error) {
    console.error("Error generating headshots batch:", error);
    if (error instanceof GenerationError) {
      throw error;
    }
    throw new GenerationError('An unexpected error occurred while generating headshots. Please check your connection and try again.');
  }
};
