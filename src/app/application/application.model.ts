export interface Application {
  applicationId?: string;
  jobId: string;
  applicantId?: string;
  candidateId: string;
  profileDocs?: ProfileDocuments
  interviewAnswers?: InterviewAnswer[]
}

export interface ProfileDocuments {
  coverLetter: []
  resume: []
  governmentFiles: []
}

export interface InterviewAnswer {
  interviewAnswerId?: string;
  questionId: string;
  answerFile?: File;
  answerUrl: string;
  createdAt: Date;
  jobId: string;
  applicantId: string;
  answerBlob?: any;
}
