export interface Application {
  applicationId?: string;
  jobId: string;
  applicantId?: string;
  candidateId: string;
  profileDocs?: ProfileDocuments
}

export interface ProfileDocuments {
  coverLetter: []
  resume: []
  governmentFiles: []
}
