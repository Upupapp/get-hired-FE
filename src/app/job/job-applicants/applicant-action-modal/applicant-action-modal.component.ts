import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-applicant-action-modal',
  templateUrl: './applicant-action-modal.component.html',
  styleUrls: ['./applicant-action-modal.component.scss']
})
export class ApplicantActionModalComponent implements OnInit {

  public tableControls: any[] = [
    {
      id: "Video-cv",
      title: "Video CV",
      icon: "/assets/images/icons/client-menu/about-me.png",
      background: "#FEF1FC"
    },
    // {
    //   id: "download-cv",
    //   title: "Download CV",
    //   icon: "/assets/images/icons/client-menu/service-history.png",
    //   background: "#dce8fa"
    // },
    // {
    //   id: "change-status",
    //   title: "Change Status",
    //   icon: "/assets/images/icons/client-menu/individual-intake.png",
    //   background: "#D7F4F8"
    // },
    {
      id: "view-applicant",
      title: "Applicant Details",
      icon: "/assets/images/icons/client-menu/service-templates.png",
      background: "#f7f2e4"
    },
  ];

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ApplicantActionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private snackBar: MatSnackBar
  ) {
    console.log(data)
  }

  ngOnInit(): void {

  }

  close() {
    this.dialogRef.close(null);
  }

  viewCv(){
    this.dialogRef.close({
      cancel: false,
      data: this.data,
      view: true
    });
  }

  openControlMenu(menu: any) {
    if (menu?.route) {
      this.dialogRef.close()
      this.router.navigate([`${menu?.route}`])
    }

    if (menu?.id === 'Video-cv') {
      this.viewCv();
    }

    if (menu?.id === 'view-applicant') {
      this.dialogRef.close({
        cancel: false,
        data: this.data,
        profile: true
      });
      // this.router.navigate([`/company/jobs/${this.data?.job_id}/applicants/details/${this.data?.data?.id}`])
    }
  }
}
