
export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: GroundingChunk[];
  videoUrl?: string;
  imageUrl?: string;
  editedImageUrl?: string;
  generatedImageUrl?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}