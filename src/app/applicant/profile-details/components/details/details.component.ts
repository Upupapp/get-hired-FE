import { Component, Input, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router } from '@angular/router';
import * as Model from '@main/applicant/applicant.model';
import { month } from '@app-shared/mock.data';

@Component({
  selector: 'app-applicant-details',
  animations: [mainAnimations],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  @Input() user: Model.Applicant;

  months = month;

  public work_experience: any[] = [
    {
      id: 1,
      title: "Website Design Senior Level",
      job_type: "Full-Time",
      details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
      location: "Los Angeles, USA",
      company: "Apple Inc",
      start_date: new Date("June 11, 2021"),
      end_date: new Date("April 12, 2022")
    },
    {
      id: 2,
      title: "Frontend Engineer",
      job_type: "Full-Time",
      details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
      location: "Los Angeles, USA",
      company: "Microsoft LTD",
      start_date: new Date("April 11, 2020"),
      end_date: new Date("March 12, 2021")
    }
  ];

  public education_background: any[] = [
    {
      id: 1,
      field_of_study: "Master Degree",
      school_address: "Manila, Philippines",
      school: "De La Salle-College of Saint Benilde",
      start_date: new Date("June 11, 2021"),
      end_date: new Date("April 12, 2022")
    },
    {
      id: 2,
      field_of_study: "BS Computer Science",
      school_address: "Manila, Philippines",
      school: "Ateneo de Naga University",
      start_date: new Date("April 09, 2009"),
      end_date: new Date("March 12, 2015")
    }
  ];

  public awards: any[] = [
    {
      id: 1,
      title: "Team Leader",
      job_type: "Full-Time",
      company: "Microsoft LTD",
      location: "Ateneo de Naga University",
      details: "Experience with the responsive and adaptive design is strongly preferred. Also, an understanding of the entire web development process, including design, development, and deployment is preferred.",
      start_date: new Date("June 11, 2021"),
      end_date: new Date("April 12, 2022")
    },
  ];

  constructor(public router: Router) { }

  ngOnInit(): void {
  }



  navigateToEdit(){
    sessionStorage.setItem('profile-update', '3');
    this.router.navigate(['/user/profile/edit'])
  }

}
