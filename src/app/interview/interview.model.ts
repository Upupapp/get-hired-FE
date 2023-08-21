export interface GroupInterview {
  groupInterviewId: string;
  groupInterviewName: string;
  interviewTemplateQuestionId: string;
  jobId?: string;
  jobName?:string;
  jobLink?: string;
  groupRecipientName?: string;
  recipients: string[];
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  companyId: string;
}

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

export interface TableHeader {
  col_name: string;
  title: string;
  type?: string;
  button_title?: string;
  button_class?: string;
  button_logo?: string;
}
