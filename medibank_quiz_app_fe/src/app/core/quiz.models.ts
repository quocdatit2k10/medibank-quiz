export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export interface Quiz {
  title: string;
  /** Percentage needed to pass, 0–100. */
  passMark: number;
  secondsPerQuestion: number;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: number;
  /** null when the timer ran out. */
  selectedIndex: number | null;
  correct: boolean;
  points: number;
}
