export interface Application {
  applicationId?: string;
  jobId: string;
  profileDocs?: ProfileDocuments
}

export interface ProfileDocuments {
  coverLetter: []
  resume: []
  governmentFiles: []
}
