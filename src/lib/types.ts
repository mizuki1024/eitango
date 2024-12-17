export interface DailyStudyData {
  date: string;
  minutes: number;
  wordsLearned: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export interface WeeklyStudyData {
  totalMinutes: number;
  totalWords: number;
  correctAnswers: number;
  wrongAnswers: number;
  dailyData: DailyStudyData[];
}