export interface GroupInterview {
  groupInterviewId?: string;
  groupInterviewName: string;
  interviewTemplateQuestionId: string;
  interviewTemplateQuestionName?: string;
  jobId?: string;
  jobName?: string;
  externalJobLink?: string;
  recipients: string[];
  groupIds: string[];
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  companyId: string;
  groups?: any[];
  recipientOpened?: string[];
  recipientAnswered?: string[];
  numberOfRecipient?: number;
}

export interface InterviewQuestion {
  questionId?: string;
  question: string;
  answerDuration: number;
  retakes: number;
  sequence: number;
}

export interface QuestionTemplate {
  interviewQuestions: InterviewQuestion[];
  interviewTemplateId?: string;
  templateName: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  companyId: string;
}

export interface InterviewQuestionTemplate {
  jobInterviewTemplateId: string;
  jobInterviewTemplateName: string;
  createdAt: Date;
  updatedAt: Date;
  jobId?: string;
  numberOfQuestions: number;
  jobTitle?: string;
}

export interface InterviewRecipients {
  groupContact: any[];
  emailByJobPost: any[];
  individualEmails: any[];
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
