import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-job-create',
  templateUrl: './job-create.component.html',
  styleUrls: ['./job-create.component.scss']
})
export class JobCreateComponent implements OnInit {
  public jobPostData: any = {
    jobPostIndustry: {
      "industry": "Technology",
      "job_role": "Business Development",
      "skill_requirements": [
          "Web Development",
          "Angular 8/10/12",
          "Mongo",
          "TypeScript",
          "Advance JavaScript",
          "ES6 - Functional Programming"
      ],
      "tags": [
          "Web Development",
          "Angular Project",
          "Frontend"
      ],
      "rates": "Monthly",
      "salary_min": 45000,
      "salary_max": 55000
    },
    jobPostDetails: {
      "title": "Angular Developer Full-time",
      "job_type": "Full-time",
      "job_level": "Intermediate: 2-3 Years Experience",
      "work_setup": "Remote",
      "address": "Block 33, 123 Street Sampaloc Manila",
      "badge": [
          {
              "id": "career-growth",
              "title": "Career Growth",
              "logo": "badge-1.png"
          },
          {
              "id": "benefit-package",
              "title": "Benefit Package",
              "logo": "badge-2.png"
          },
          {
              "id": "performance-incentive",
              "title": "Performance Incentive",
              "logo": "badge-1.png"
          }
      ],
      "job_description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi u",
      "job_duties": "As a Product Designer, you will work within a Product Delivery Team fused with UX, engineering, product and data talent.",
      "skill_experience": [
          "Looking to add a pricing calculator",
          "Website Search no more",
          "User-based pricing calculator for you",
          "Is your business operating in multiple countries"
      ],
      "other_requirements": [
          "Graduated from a top university",
          "Proven success in school or at work"
      ],
      "education_requirements": [
          "Computer Science Graduate or related discipline is highly desired."
      ]
    },
    jobPostInterviewQuestions: {
      interview_questions: [
        "How long have you been using angular?",
        "Are You Available For Part-time or Full-time?"
      ]
    }
  }

  stepper: number = 1;

  stepperItems: any[] = [
    {
      id: 1,
      title: "Job Details"
    },

    {
      id: 2,
      title: "Job Requirements"
    },

    {
      id: 3,
      title: "Create Interview"
    },

    {
      id: 4,
      title: "Preview Job Post"
    },
  ];

  constructor() { }

  ngOnInit(): void {
  }

  saveAsDraft() {

  }

  cancel() {

  }

  changeStep(number: number){
    this.stepper = number;
  }

  updateObject(data: any, field: string){
    this.jobPostData[`${field}`] = data;
    console.log(data, field, this.jobPostData)
  }

  publishJobPost(){
    console.log(this.jobPostData)
  }
}
