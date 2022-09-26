import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-applicant-details',
  animations: [mainAnimations],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
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
      title: "Master Degree",  
      job_type: "Full-Time",
      school: "De La Salle-College of Saint Benilde",
      start_date: new Date("June 11, 2021"),
      end_date: new Date("April 12, 2022")
    },
    {
      id: 2,  
      title: "BS Computer Science",  
      job_type: "Full-Time",
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

  public skills: string[] = ["Marketing", "Angular", "JavaScript", "TypeScript", "HTML", "CSS", "Bootstrap", "MongoDB", "Node", "Web Development", "Frontend"];

  constructor() { }

  ngOnInit(): void {
  }

}
