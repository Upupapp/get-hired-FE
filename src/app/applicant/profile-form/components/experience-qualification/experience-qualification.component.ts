import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-experience-qualification',
  animations: [mainAnimations],
  templateUrl: './experience-qualification.component.html',
  styleUrls: ['./experience-qualification.component.scss']
})
export class ExperienceQualificationComponent implements OnInit {
  public skill_requirements: string[] = [];
  public skillModel: string = "";  
  
  public month: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  public year: number[] = new Array(18).fill(0).map((el, i) => 2005 + i)
  public jobType: string[] = ["Full-time", "Part-time"];
  public levelOfEducation: string[] = ["Primary education", "Upper Secondary Education", "Bachelor’s or equivalent level", "Master’s or equivalent level", "Doctoral or equivalent level"]

  // work experience form
  public workExperienceArr: {
    title: string,  
    job_type: string,
    details: string,
    location: string,
    company: string,
    start_date: any,
    end_date: any,
    currently_work_here: boolean
  }[] = [
    {
      title: "Angular Developer",  
      job_type: "Full-time",
      details: "Lorem Ipsum Sample Details",
      location: "123 Street Sampaloc Manila",
      company: "Microsoft Inc.",
      start_date: new Date("January 2021"),
      end_date: new Date("June 2022"),
      currently_work_here: false
    }
  ];

  // educational background
  public educationBackgroundArr: {
    level_of_education: string,
    field_of_study: string, 
    school_address: string, 
    school: string, 
    start_date: any,
    end_date: any,
  }[] = [
    {
      level_of_education: "Bachelor’s or equivalent level",
      field_of_study: "Computer Science",  
      school_address: "Manila, Philippines",
      school: "De La Salle-College of Saint Benilde",
      start_date: new Date("June 11, 2021"),
      end_date: new Date("April 12, 2022")
    }
  ];

  public awardsArr: {
      title: string,  
      job_type: string, 
      company: string, 
      location: string, 
      details: string, 
      start_date: any, 
      end_date: any, 
      does_not_expire: boolean
    }[] = [
    { 
      title: "Team Leader",  
      job_type: "Full-Time",
      company: "Microsoft LTD",
      location: "Ateneo de Naga University",
      details: "Experience with the responsive and adaptive design is strongly preferred. Also, an understanding of the entire web development process, including design, development, and deployment is preferred.",
      start_date: new Date("June 11, 2021"),
      end_date: new Date("April 12, 2022"),
      does_not_expire: true
    },
  ];  

  constructor() { }

  ngOnInit(): void {
  }

  addItem(event, arrayItem, field){
    let value = event?.target?.value;
    let index = arrayItem.findIndex(el => el === value);

    if(index === -1){
      arrayItem.push(value);
    }

    this.skillModel = undefined;
  }

  removeItem(item, arrayItem, field){
    let index = arrayItem?.findIndex(el => el?.id === item?.id);
    arrayItem.splice(index, 1);
  }

  // experience
  addMoreExperience(event){
    if(event && !event?.index) this.workExperienceArr.push({
      title: "",  
      job_type: "",
      details: "",
      location: "",
      company: "",
      start_date: null,
      end_date: null,
      currently_work_here: false
    });

    else {
      this.workExperienceArr.splice(event?.index - 1, 1);
    }
  }

  // education
  addMoreEducation(event){
    if(event && !event?.index) this.educationBackgroundArr.push({
      level_of_education: "",
      field_of_study: "",  
      school_address: "",
      school: "",
      start_date: null,
      end_date: null
    });

    else {
      this.educationBackgroundArr.splice(event?.index - 1, 1);
    }
  }

  // awards
  addMoreAwards(event){
    if(event && !event?.index) this.awardsArr.push({
      title: "",  
      job_type: "", 
      company: "", 
      location: "", 
      details: "", 
      start_date: null, 
      end_date: null, 
      does_not_expire: false
    });

    else {
      this.awardsArr.splice(event?.index - 1, 1);
    }
  }

}
