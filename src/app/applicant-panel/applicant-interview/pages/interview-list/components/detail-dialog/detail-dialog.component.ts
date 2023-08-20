import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail-dialog',
  templateUrl: './detail-dialog.component.html',
  styleUrls: ['./detail-dialog.component.scss']
})
export class DetailDialogComponent implements OnInit {

  loading: boolean = false;

  public tableControls: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<DetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    console.log(data)
  }

  ngOnInit(): void {
    console.log(this.data.status);

    if(this.data?.status !== 'Answered' && this.data?.status !== 'Declined'){
      this.tableControls = [
        /*{
          id: "view-interview",
          title: "View Interview",
          icon: "/assets/images/icons/client-menu/about-me.png",
          background: "#FEF1FC"
        },
*/
        {
          id: "answer-interview",
          title: "Answer Interview",
          icon: "/assets/images/icons/client-menu/service-history.png",
          background: "#dce8fa"
        },

        {
          id: "decline-interview",
          title: "Decline Interview",
          icon: "/assets/images/icons/client-menu/incidents.png",
          background: "#ffe6e6"
        },
      ]
    }

    else if(this.data?.status == 'Answered' ){
      this.tableControls = [
        {
          id: "view-interview",
          title: "View Interview",
          icon: "/assets/images/icons/client-menu/about-me.png",
          background: "#FEF1FC"
        },

        /*{
          id: "view-answer",
          title: "Interview Answers",
          icon: "/assets/images/icons/client-menu/service-history.png",
          background: "#dce8fa"
        },*/
      ]
      
    }

    else if(this.data?.status == 'Declined' ){
      this.tableControls = [
        {
          id: "view-interview",
          title: "View Interview",
          icon: "/assets/images/icons/client-menu/about-me.png",
          background: "#FEF1FC"
        },
      ]
      
    }
  }

  close() {
    this.dialogRef.close(null);
  }

  closeSave(){
    this.dialogRef.close({
      cancel: false,
      data: this.data
    });
  }

  public decline: boolean = false;

  openControlMenu(menu: any){
    if(menu?.id === 'view-interview'){
      this.dialogRef.close();
      this.router.navigate([`/user/interview/details/${this.data?.id}`], {
        queryParams: {
          id: this.data?.jobId
        }
      });
    }

    else if(menu?.id === 'answer-interview'){
      this.dialogRef.close();
      this.router.navigate([`user/interview/details/${this.data?.id}`], {
        queryParams: {
          id: this.data?.jobId
        }
      })
    }

    else if(menu?.id === 'decline-interview'){
      this.decline = true;
      //this.dialogRef.close(this.data);
    }


  }

}
