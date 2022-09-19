import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-preview-job-post-step',
  animations: [mainAnimations],
  templateUrl: './preview-job-post-step.component.html',
  styleUrls: ['./preview-job-post-step.component.scss']
})
export class PreviewJobPostStepComponent implements OnInit {
  public workSetup: string[] = ["Hybrid", "Remote", "Onsite"];
  public workSetupSelected: string = "";

  public jobType: string[] = ["Full-time", "Part-time"];
  public jobTypeSelected: string = "";


  public badges: any[] = [
    {
      id: "career-growth",
      name: "Career Growth",  
      badge_logo: "badge-1.png"
    }, 
    {
      id: "performance-incentive",
      name: "Performance Incentive",  
      badge_logo: "badge-1.png"
    },
    {
      id: "benefit-package", 
      name: "Benefit Package", 
      badge_logo: "badge-2.png"
    },
    {
      id: "gender-equality", 
      name: "Gender Equality", 
      badge_logo: "badge-3.png"
    },
    {
      id:"work-life-balance", 
      name: "Work-life Balance", 
      badge_logo: "badge-2.png"
    },
    {
      id:"friendly-environment", 
      name: "Friendly Environment", 
      badge_logo: "badge-3.png"
    },
    {
      id:"flexitime",
      name: "Flexitime",
      badge_logo: "badge-2.png"
    },
    
  ];

  public categories: any[] = [
    {
      id: 1,
      title: 'Development & IT',  
      skills: 100,  
      rating: 4.2,
      banner_thumbnail: '/assets/images/placeholder/category-1.png'
    },
    {
      id: 2,
      title: 'Sales & Marketing',  
      skills: 154,  
      rating: 4.6,
      banner_thumbnail: '/assets/images/placeholder/category-2.png'
    },

    {
      id: 3,
      title: 'Development & Marketing',  
      skills: 98,  
      rating: 4.1,
      banner_thumbnail: '/assets/images/placeholder/category-1.png'
    },

    {
      id: 4,
      title: 'Architecture',  
      skills: 144,  
      rating: 4.7,
      banner_thumbnail: '/assets/images/placeholder/category-1.png'
    },

    {
      id: 5,
      title: 'Software Engineering',  
      skills: 255,  
      rating: 4.7,
      banner_thumbnail: '/assets/images/placeholder/category-2.png'
    },

    {
      id: 6,
      title: 'Database Architecture',  
      skills: 117,  
      rating: 4.4,
      banner_thumbnail: '/assets/images/placeholder/category-1.png'
    },

    {
      id: 7,
      title: 'Civil Engineering',  
      skills: 224,  
      rating: 4.5,
      banner_thumbnail: '/assets/images/placeholder/category-2.png'
    },

    {
      id: 8,
      title: 'Virtual Assistant',  
      skills: 89,  
      rating: 4.1,
      banner_thumbnail: '/assets/images/placeholder/category-2.png'
    },
  ];

  public categoriesSelected: any[] = [
    {
          id: 1,
          title: 'Development & IT',  
          skills: 100,  
          rating: 4.2,
          banner_thumbnail: '/assets/images/placeholder/category-1.png'
        },
    {
          id: 3,
          title: 'Development & Marketing',  
          skills: 98,  
          rating: 4.1,
          banner_thumbnail: '/assets/images/placeholder/category-1.png'
        },
    {
          id: 5,
          title: 'Software Engineering',  
          skills: 255,  
          rating: 4.7,
          banner_thumbnail: '/assets/images/placeholder/category-2.png'
        },
  ];

  public badgeSelected: any[] = [];
  public requirements: any[] = [
    "Looking to add a pricing calculator",
    "Website Search no more",
    "User-based pricing calculator for you", 
    "Is your business operating in multiple countries",
  ];

  public educationalBackground: any[] = [
    "Bachelor’s degree in Economics, Marketing, Business, or a related discipline is highly desired", 
    "2+ years of relevant work experience in buying", 
    "An equivalent combination of education, training and experience may be accepted."
  ];

  public goodToHave: string[] =  ["Graduated from a top university", "Proven success in school or at work", "Professional experience with native English speakers", "Experience working from home", "Professional presentation on resume and online"];
  

  constructor() { }

  ngOnInit(): void {
  }

  addBadge(item){
    let index = this.badgeSelected?.findIndex(el => el?.id === item?.id);

    console.log(index)

    if(index === -1){
      this.badgeSelected.push(item);
    }

    //else this.badgeSelected.splice(index, 1);
  }

  addItem(event, arrayItem){
    let value = event?.target?.value;
    let index = arrayItem.findIndex(el => el === value);

    if(index === -1){
      arrayItem.push(value);
    }
  }

  removeItem(item, arrayItem){
    let index = arrayItem?.findIndex(el => el?.id === item?.id);
    arrayItem.splice(index, 1);
  }
}
