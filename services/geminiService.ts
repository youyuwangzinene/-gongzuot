import { GoogleGenAI } from "@google/genai";
import { ImageGenerationParams, VideoGenerationParams } from "../types";

// Helper to ensure we have a fresh instance with the potentially newly selected key
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const ensureApiKey = async (): Promise<boolean> => {
  // Use type assertion to access aistudio on window without declaring it globally in types.ts
  const aistudio = (window as any).aistudio;

  if (aistudio && aistudio.hasSelectedApiKey) {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
      // Assume success after modal closes/resolves, or let next call fail gracefully
      return true;
    }
    return true;
  }
  return true; // Fallback if not running in the specific environment
};

export const generateImage = async (params: ImageGenerationParams): Promise<string> => {
  await ensureApiKey();
  const ai = getAIClient();

  // Using gemini-3-pro-image-preview for high quality 'Dreamina' style results
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: params.prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: params.aspectRatio,
        imageSize: params.resolution,
      },
    },
  });

  // Extract image from response
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data found in response");
};

export const generateVideo = async (params: VideoGenerationParams): Promise<string> => {
  await ensureApiKey();
  const ai = getAIClient();

  // Using Veo fast for interactive speed, or standard for quality. 
  // Given 'Dreamina' usually implies high quality, we'll stick to fast-generate-preview for the 'tool' responsiveness,
  // but Veo is generally slow.
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: params.prompt,
    config: {
      numberOfVideos: 1,
      resolution: params.resolution,
      aspectRatio: params.aspectRatio,
    }
  });

  // Polling for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
    throw new Error("Video generation failed or returned no URI.");
  }

  // We must append the key to the download link as per documentation
  // Note: In a real app, you might proxy this to avoid exposing key in URL if shared, 
  // but for client-side consumption this is the documented pattern.
  return `${videoUri}&key=${process.env.API_KEY}`;
};