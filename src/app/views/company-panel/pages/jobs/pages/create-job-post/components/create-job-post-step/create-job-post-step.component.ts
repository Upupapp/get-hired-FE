import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-create-job-post-step',
  animations: [mainAnimations],
  templateUrl: './create-job-post-step.component.html',
  styleUrls: ['./create-job-post-step.component.scss']
})
export class CreateJobPostStepComponent implements OnInit {
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

  public talents: string[] = ["Designer", "UI Designer", "Full-time", "UI/UX"];

  constructor() { }

  ngOnInit(): void {
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
