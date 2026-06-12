export interface Memory {
  id: string;
  userId: string;
  title: string;
  location: string;
  date: string; 
  story: string; // was quote
  specialDetail?: string; // Optional what makes it special
  imageUri: string | null;
  images?: { uri: string; title: string }[]; // Support for multiple images
  createdAt: any;
  updatedAt?: any;
  isFavorite: boolean;
  collectionName?: string; // Optional collection categorization
  isTimeCapsule?: boolean; // New field for time capsule feature
  unlockDate?: string; // ISO date string when capsule unlocks
  aiSummary?: string | boolean; // New field for AI summary
  backgroundColor?: string; // Hex color for the ticket background
  titleColor?: string; // Hex color for the title
  storyColor?: string; // Hex color for the description
  themePreset?: string; // Glassmorphic or minimal theme variations
  creatorName?: string; // Original creator's name
  creatorPhotoURL?: string; // Original creator's photo URL
  originalCreatorId?: string; // Original creator's user ID
}

export type ImageStatus = 'idle' | 'loading' | 'success' | 'error';
