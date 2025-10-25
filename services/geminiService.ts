// FIX: Corrected imports. `StreamPart` is defined locally, so its import is removed.
// `GroundingChunk` is a local type and should be imported from `../types`.
import { GoogleGenAI, Chat, Modality } from "@google/genai";
import type { GroundingChunk } from '../types';

const SYSTEM_INSTRUCTION = `You are Autonex AI — an advanced conversational and automation assistant developed by Autonex Agency.

Your purpose is to help users with intelligent automation, content creation, data analysis, and AI-powered business tools. 
You must think logically, respond clearly, and act like a professional AI partner.

Your core traits are:
- Fast, reliable, and professional.
- You are a multilingual assistant. Your initial greeting must be in English. For all subsequent turns, you MUST automatically detect the user's language and reply in that same language. If the user switches languages, you must switch your response language accordingly.
- Your tone is confident, helpful, and modern — like a human tech expert. Maintain a polite, clear, and natural tone in every language.

Your main functions are:
1. Automate — Help users design chatbots, workflows, and process automation.
2. Create — Generate creative content (posts, blogs, marketing messages, etc.)
3. Analyze — Understand data or text and explain insights simply.
4. Assist — Solve business or daily productivity problems through AI suggestions.

Your identity:
- Name: Autonex AI
- Developer: Autonex Agency
- Motto: “Smarter Automation. Better Results.”

Always respond like a professional AI product built by Autonex.
Keep answers neat, structured, and helpful. Use markdown for formatting when appropriate (e.g., lists, bold text).`;

let ai: GoogleGenAI;
const chatInstances = new Map<string, Chat>();

function getAiInstance(): GoogleGenAI {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

function getChat(sessionId: string): Chat {
  if (chatInstances.has(sessionId)) {
    return chatInstances.get(sessionId)!;
  }

  const genAI = getAiInstance();
  const newChat = genAI.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{googleSearch: {}}],
    },
  });
  chatInstances.set(sessionId, newChat);
  return newChat;
}


export interface StreamPart {
  text?: string;
  sources?: GroundingChunk[];
  editedImageUrl?: string;
  generatedImageUrl?: string;
}

async function fileToGenerativePart(file: File) {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

export async function generateSpeech(text: string): Promise<string | null> {
  const genAI = getAiInstance();
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say: ${text}` }] }],
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
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
}

export async function transcribeAudio(audioFile: File): Promise<string> {
  const genAI = getAiInstance();
  try {
    const audioPart = await fileToGenerativePart(audioFile);
    const textPart = { text: "Transcribe the following audio." };
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [audioPart, textPart] },
    });
    return response.text;
  } catch (error) {
    console.error("Error with audio transcription:", error);
    return "Sorry, I couldn't transcribe the audio. Please try again.";
  }
}

export async function* sendMessageStream(
  message: string, 
  sessionId: string, 
  videoFile?: File,
  imageFile?: File,
  isImageGeneration?: boolean,
  aspectRatio?: '16:9' | '9:16',
  isThinkingMode?: boolean,
): AsyncGenerator<StreamPart> {
  const genAI = getAiInstance();

  if (isImageGeneration) {
    try {
      yield { text: `Generating an image of "${message}"...` };
      const response = await genAI.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: message,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio || '16:9',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        yield { generatedImageUrl: imageUrl, text: "Here is the image I generated for you:" };
      } else {
        yield { text: "Sorry, I couldn't generate an image from that prompt." };
      }
    } catch (error) {
      console.error("Error with image generation:", error);
      yield { text: "Sorry, an error occurred during image generation. Please try again." };
    }
    return;
  }

  if (imageFile) {
    try {
      const imagePart = await fileToGenerativePart(imageFile);
      const textPart = { text: message };
      
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          yield { editedImageUrl: imageUrl, text: "Here is the edited image:" };
          return;
        }
      }
      yield { text: "Sorry, I couldn't generate an edited image from that." };

    } catch (error) {
      console.error("Error with image editing:", error);
      yield { text: "Sorry, I couldn't edit the image. Please try again." };
    }
    return;
  }

  if (videoFile) {
    try {
      const videoPart = await fileToGenerativePart(videoFile);
      const textPart = { text: message };
      
      const response = await genAI.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: { parts: [videoPart, textPart] },
      });

      for await (const chunk of response) {
        if (chunk.text) {
          yield { text: chunk.text };
        }
      }
    } catch (error) {
      console.error("Error with video analysis:", error);
      yield { text: "Sorry, I couldn't analyze the video. Please try again." };
    }
    return;
  }

  if (isThinkingMode) {
    try {
      const response = await genAI.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: message,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingBudget: 32768 },
        },
      });

      for await (const chunk of response) {
        if (chunk.text) {
          yield { text: chunk.text };
        }
      }
    } catch (error) {
      console.error("Error with thinking mode:", error);
      yield { text: "Sorry, an error occurred while processing your complex query. Please try again." };
    }
    return;
  }

  const chat = getChat(sessionId);

  try {
    const result = await chat.sendMessageStream({ message });
    let finalChunks: GroundingChunk[] | undefined;

    for await (const chunk of result) {
      if (chunk.text) {
        yield { text: chunk.text };
      }
      if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        finalChunks = chunk.candidates[0].groundingMetadata.groundingChunks;
      }
    }

    if (finalChunks) {
      yield { sources: finalChunks };
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    yield { text: "I'm sorry, I encountered an error. Please try again." };
  }
}