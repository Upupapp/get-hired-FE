export interface InterviewQuestion {
  questionId?: string;
  question: string;
  answerDuration: number;
  retakes: number;
  sequence: number;
  // BUGFIX (vanishing questions after a single-question edit): present only
  // on the response of PUT /interview/updatejobinterview -- the full,
  // current question list for this question's template, so the FE never has
  // to guess/reconstruct it from a possibly-stale store snapshot. See
  // job.reducer.ts's updateJobQuestionSuccess handler.
  interviewQuestions?: InterviewQuestion[];
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
