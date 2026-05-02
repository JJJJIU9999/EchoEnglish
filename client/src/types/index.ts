export interface User {
  id: number;
  email: string;
  nickname: string;
  created_at?: string;
}

export interface Corpus {
  id: number;
  title: string;
  description: string;
  scenario: string;
  difficulty: number;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  sentence_count?: number;
  created_at: string;
}

export interface Sentence {
  id: number;
  corpus_id: number;
  sentence_index: number;
  start_time: number;
  end_time: number;
  english_text: string;
  chinese_text: string;
}

export interface LearningRecord {
  id: number;
  user_id: number;
  corpus_id: number;
  corpus_title?: string;
  total_sentences: number;
  correct_sentences: number;
  accuracy: number;
  duration_seconds: number;
  created_at: string;
}

export interface LearningStats {
  total_sessions: number;
  total_duration_seconds: number | string;
  average_accuracy: number | string;
  total_sentences_attempted: number | string;
  total_sentences_correct: number | string;
}

export interface Vocabulary {
  id: number;
  user_id: number;
  word: string;
  definition: string;
  sentence_id: number | null;
  mastery_level: number;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DictationResult {
  userInput: string;
  accuracy: number;
  wordResults: WordResult[];
}

export interface WordResult {
  word: string;
  userWord: string | null;
  status: 'correct' | 'incorrect' | 'missing' | 'extra';
}
