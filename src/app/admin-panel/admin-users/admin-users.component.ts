import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { catchError, of, Subscription } from 'rxjs';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  animations: [mainAnimations]
})
export class AdminUsersComponent implements OnInit {
  public records: any;
  public document: any = null;
  public fileData: any;
  uploadedFile: any;
  emails: string[] = [];
  subscriptions = new Subscription();
  verified = 0;

  constructor(
    public adminService: AdminService
  ) { }

  ngOnInit(): void {
  }

  uploadFile() {
    this.records.forEach((element) => {
      this.emails.push(element);
    });

    // console.log(this.records, "added userId")
  }

  manualVerifyEmails() {
    this.emails.forEach((email, index) => setTimeout(() => this.verifyEmails(email), 2000 * (index + 1)))
  }

  verifyEmails(email: string) {
    let url = '';

    const req$ = this.adminService.getVerificationLink(email)
      .pipe(
        catchError(err => of(err))
      ).subscribe(res => {
        console.log(res);
        if(res.data) {
          this.verified++;
          url = `${res.data}&manual=true`;
        }
        window.open(url, "_blank")


      });

      this.subscriptions.add(req$);
  }

  removeDocument() {
    this.document = null;
  }

  onUpload(file) {
    this.uploadedFile = file;
  }

  uploadListener($event: any): void {
    let text = [];
    let files = $event.srcElement.files;

    if (this.isValidCSVFile(files[0])) {
      this.document = files[0].name;
      this.fileData = files[0];

      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {
        let csvData = reader.result;
        let csvRecordsArray = (csvData as string).split(/\r\n|\n/);

        let headersRow = this.getHeaderArray(csvRecordsArray);

        this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
        // console.log(this.records, "records")
      };

      reader.onerror = function () {
        // console.log('error is occured while reading file!');
      };

    } else {
      alert("Please import valid .csv file.");

    }
  }

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (csvRecordsArr[0]).split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    let csvArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = (csvRecordsArray[i]).split(',');
      if (curruntRecord.length == headerLength) {
        const email = curruntRecord[0].trim();
        csvArr.push(email);
      }
    }
    return csvArr;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe()
  }
}
