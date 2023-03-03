export interface InterviewQuestion {
  questionId?: string;
  question: string;
  answerDuration: number;
  retakes: number;
  sequence: number;
}

export interface InterviewAnswer {
  interviewAnswerId?: string;
  questionId: string;
  answerFile?: File;
  answerUrl: string;
  createdAt: Date;
  jobId: string;
  applicantId: string;
}
