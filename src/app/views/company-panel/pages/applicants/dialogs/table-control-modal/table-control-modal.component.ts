import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table-control-modal',
  templateUrl: './table-control-modal.component.html',
  styleUrls: ['./table-control-modal.component.scss']
})
export class TableControlModalComponent implements OnInit {
  loading: boolean = false;

  public tableControls: any[] = [
    {
      id: "Video-cv",
      title: "Video CV",
      icon: "/assets/images/icons/client-menu/about-me.png",  
      background: "#FEF1FC"
    },

    {
      id: "download-cv",
      title: "Download CV",
      icon: "/assets/images/icons/client-menu/service-history.png",  
      background: "#dce8fa"
    },

    {
      id: "change-status",
      title: "Change Status",
      icon: "/assets/images/icons/client-menu/individual-intake.png",  
      background: "#D7F4F8"
    },

    {
      id: "view-applicant",
      title: "Applicant Details",
      icon: "/assets/images/icons/client-menu/service-templates.png",  
      background: "#f7f2e4"
    },

    /*{
      id: "create-interview",
      title: "Create Interview",
      icon: "/assets/images/icons/client-menu/medical-history.png",  
      background: "#f2f0fa"
    },*/

    {
      id: "view-interview",
      title: "Recorded Interview",
      icon: "/assets/images/icons/client-menu/medical-history.png",  
      background: "#f2f0fa"
    },

    {
      id: "delete",
      title: "Archive Applicant",
      icon: "/assets/images/icons/client-menu/incidents.png",  
      background: "#ffe6e6"
    },

    /*{
      id: "service-templates",
      title: "Service Templates",
      icon: "/assets/images/icons/client-menu/service-templates.png",  
      background: "#FEF1FC"
    },

    {
      id: "service-schedule",
      title: "Service Schedule",
      icon: "/assets/images/icons/client-menu/service-schedule.png",  
      background: "#FCF3EE"
    },

    {
      id: "client-funding",
      title: "Client-funding",
      icon: "/assets/images/icons/client-menu/client-funding.png",  
      background: "#D7F4F8"
    },*/
  ];
  
  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<TableControlModalComponent>,
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

  closeSave(){
    this.dialogRef.close({
      cancel: false,
      data: this.data
    });
  }

  openControlMenu(menu: any){
    if(menu?.route){
      this.dialogRef.close()
      this.router.navigate([`${menu?.route}`])
    }

    if(menu?.id === 'view-applicant'){
      this.dialogRef.close();
      this.router.navigate([`/company/jobs/${this.data?.job_id}/applicants/details/${this.data?.data?.id}`])
    }
  }


}
