export type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  number: number;
  text: string;
  options: Option[];
  correctOptionId?: string;
  section: string;
}

export interface Section {
  name: string;
  questionCount: number;
  startId: number;
}

export interface ExamState {
  currentQuestionId: number;
  answers: Record<number, string>; // questionId -> optionId
  statuses: Record<number, QuestionStatus>;
  timeLeft: number; // in seconds
}
