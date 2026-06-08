export interface Word {
  id: string;
  word: string;
  phonetic: string;
  pos: string; // Part of speech, e.g., "n.", "v.", "adj.", etc.
  definition: string;
  unit: number; // 1 to 8
  page: string; // e.g., "p.2"
  example: string; // English example sentence
  exampleCn: string; // Chinese translation of example sentence
}

export interface UserStats {
  masteredWords: string[]; // List of word IDs marked as mastered
  favoritedWords: string[]; // List of word IDs added to custom recite list
  wrongWords: {
    wordId: string;
    errorCount: number;
    lastTested: string; // Base64 or ISO string
  }[];
  checkInDates: string[]; // ISO Date strings "YYYY-MM-DD"
  dailyGoal: number; // Target words per day
  streak: number;
}

export interface ReviewItem {
  wordId: string;
  stage: number; // 1 to 8 stage corresponding to Ebbinghaus intervals
  nextReviewTime: string; // ISO String
  lastReviewed: string;
}
