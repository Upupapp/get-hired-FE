import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, of, Subscription } from 'rxjs';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-email-verify',
  templateUrl: './admin-email-verify.component.html',
  styleUrls: ['./admin-email-verify.component.scss']
})
export class AdminEmailVerifyComponent implements OnInit, OnDestroy {
  public records: any;
  public document: any = null;
  public fileData: any;
  uploadedFile: any;
  emails: string[] = [];
  subscriptions = new Subscription();
  verified = 0;
  error = '';
  private verifyTimers: number[] = [];

  constructor(
    public adminService: AdminService
  ) { }

  ngOnInit(): void {
  }

  uploadFile() {
    this.emails = [];
    this.verified = 0;
    (this.records || []).forEach((element) => {
      this.emails.push(element);
    });
  }

  manualVerifyEmails() {
    this.clearTimers();
    this.emails.forEach((email, index) => {
      const timer = window.setTimeout(() => this.verifyEmails(email), 2000 * (index + 1));
      this.verifyTimers.push(timer);
    });
  }

  verifyEmails(email: string) {
    const req$ = this.adminService.getVerificationLink(email)
      .pipe(
        catchError(err => of(err))
      ).subscribe(res => {
        if (res && res.data) {
          this.verified++;
          const url = `${res.data}&manual=true`;
          window.open(url, '_blank');
        }
      });

    this.subscriptions.add(req$);
  }

  removeDocument() {
    this.document = null;
    this.fileData = null;
    this.records = null;
    this.emails = [];
    this.error = '';
  }

  onUpload(file) {
    this.uploadedFile = file;
  }

  uploadListener($event: any): void {
    const files = $event.srcElement.files;
    this.error = '';

    if (this.isValidCSVFile(files[0])) {
      this.document = files[0].name;
      this.fileData = files[0];

      const input = $event.target;
      const reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {
        const csvData = reader.result;
        const csvRecordsArray = (csvData as string).split(/\r\n|\n/);
        const headersRow = this.getHeaderArray(csvRecordsArray);
        this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow);
        if (!this.records || !this.records.length) {
          this.error = 'No email addresses found. Use an Email column or a single email column.';
        }
      };

      reader.onerror = () => {
        this.error = 'Could not read that CSV file.';
      };

    } else {
      this.error = 'Please import a valid .csv file.';
    }
  }

  isValidCSVFile(file: any) {
    return file.name.endsWith('.csv');
  }

  getHeaderArray(csvRecordsArr: any) {
    const headers = (csvRecordsArr[0] || '').split(',');
    const headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headersRow: string[]) {
    const csvArr = [];
    const emailIndex = this.emailColumnIndex(headersRow);

    for (let i = 1; i < csvRecordsArray.length; i++) {
      const currentRecord = (csvRecordsArray[i] || '').split(',');
      if (currentRecord.length === headersRow.length) {
        const email = (currentRecord[emailIndex] || '').trim();
        if (email) {
          csvArr.push(email);
        }
      }
    }
    return csvArr;
  }

  ngOnDestroy() {
    this.clearTimers();
    this.subscriptions.unsubscribe();
  }

  private emailColumnIndex(headers: string[]): number {
    const index = headers.findIndex(header => header.trim().toLowerCase() === 'email');
    return index >= 0 ? index : 0;
  }

  private clearTimers(): void {
    this.verifyTimers.forEach(id => clearTimeout(id));
    this.verifyTimers = [];
  }
}
