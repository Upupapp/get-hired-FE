import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-table-control-modal',
  templateUrl: './table-control-modal.component.html',
  styleUrls: ['./table-control-modal.component.scss']
})
export class TableControlModalComponent implements OnInit {

  public tableControls: any[] = [
    {
      id: "view-details",
      title: "View Candidate Detail",
      icon: "/assets/images/icons/client-menu/service-templates.png",
      background: "#f7f2e4"
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<TableControlModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {}

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/images/placeholder/job-post-banner-person.png';
  }

  close() {
    this.dialogRef.close(null);
  }

  openControlMenu(menu: any) {
    if (menu?.route) {
      this.dialogRef.close()
      this.router.navigate([`${menu?.route}`])
    }

    if (menu?.id === 'view-details') {
      this.dialogRef.close({
        cancel: false,
        data: this.data,
        profile: true
      });
      // this.router.navigate([`/company/jobs/${this.data?.job_id}/applicants/details/${this.data?.data?.id}`])
    }
  }

}
