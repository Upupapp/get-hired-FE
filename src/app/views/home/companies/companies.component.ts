import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-companies',
  animations: [mainAnimations],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {
  public companies: any[] = [
    {
      title: "Slack",
      category: "Technology",
      image: "slack",
      job_opening: 17, 
    },

    {
      title: "Microsoft", 
      category: "Technology",
      image: "microsoft", 
      job_opening: 12, 
    },

    {
      title:"Google",
      category: "Technology",
      image: "google",
      job_opening: 54, 
    },

    {
      title: "Airbnb",
      category: "Rental",
      image:  "airbnb", 
      job_opening: 11, 
    },

    {
      title: "Linkedin",
      category: "Careers",
      image: "linkedin", 
      job_opening: 33, 
    },

    {
      title: "Maya",
      category: "Mobile Banking",
      image: "paymaya",
      job_opening: 25, 
    },
  ];  

  constructor() { }

  ngOnInit(): void {
  }

}
