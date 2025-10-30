import { GoogleGenerativeAI } from "@google/generative-ai";
import { STYLES } from "../constants";
import type { HeadshotStyle } from "../types";

export class GenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenerationError";
  }
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

export const suggestStyle = async (
  profession: string,
): Promise<HeadshotStyle | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
  const generateSingleImage = async (): Promise<string | null> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Convert files to base64
      const imageParts = await Promise.all(
        files.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () =>
              resolve((reader.result as string).split(",")[1]);
            reader.readAsDataURL(file);
          });

          return {
            inlineData: {
              data: base64,
              mimeType: file.type,
            },
          };
        }),
      );

      let prompt = style.prompt;
      if (removePiercings) {
        prompt +=
          "\n- IMPORTANT: Remove any nose rings or facial piercings from the image. Earrings are acceptable.";
      }

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;

      // Note: Gemini doesn't generate images directly via this API
      // You'll need to use Imagen or another image generation service
      // This is a placeholder - actual implementation depends on your image generation service

      return null; // Placeholder
    } catch (error) {
      console.error("Image generation error:", error);
      return null;
    }
  };

  const promises = Array(count)
    .fill(null)
    .map(() => generateSingleImage());
  const results = await Promise.all(promises);
  const successfulImages = results.filter((img): img is string => img !== null);

  if (successfulImages.length === 0) {
    throw new GenerationError(
      "Failed to generate any images. Please try again.",
    );
  }

  return successfulImages;
};
