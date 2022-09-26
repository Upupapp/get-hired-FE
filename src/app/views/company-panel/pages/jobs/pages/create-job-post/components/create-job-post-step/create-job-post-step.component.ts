import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-create-job-post-step',
  animations: [mainAnimations],
  templateUrl: './create-job-post-step.component.html',
  styleUrls: ['./create-job-post-step.component.scss']
})
export class CreateJobPostStepComponent implements OnInit {
  @Input() jobPostCategory: any;
  @Output() jobPostCategoryEvent: EventEmitter<any> = new EventEmitter<any>();

  public search: string = "";
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
  public rates: any[] = [
    {
      title: "Monthly",  
      rate: "month",
      icon: '/rate-monthly'
    },

    {
      title: "Daily",  
      rate: "day",
      icon: '/rate-daily'
    },

    {
      title: "Hourly",  
      rate: "hour",
      icon: '/rate-24'
    },
  ];
  public categoriesFiltered: any[] = [...this.categories];
  public skill_requirements: string[] = [];
  public tags: string[] = [];
  public selectedCategory: any = "";
  public selectedRates: any = "";
  public budget: any = {
    min: 0,  
    max: 0
  }
  public project_duration = {
    start_date: new Date(),
    end_date: new Date()
  }

  public skillModel: string = "";  
  public tagModel: string = "";
  public months: string[] = [
    "January",  
    "February",  
    "March",
    "April",
    "May",
    "June",  
    "July",  
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  public days: number[] = new Array(31).fill(1).map((el,i) => i + 1);

  constructor() { }

  ngOnInit(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    console.log(this.jobPostCategory)
  }


  generateProjectDuration(date){

  }





  selectCategory(item){
    this.selectedCategory = item;
    this.rebuildObject('category', item)
  }

  addItem(event, arrayItem, field){
    let value = event?.target?.value;
    let index = arrayItem.findIndex(el => el === value);

    if(index === -1){
      arrayItem.push(value);
    }

    // rebuild request body
    this.rebuildObject(`${field}`, arrayItem);
  }

  removeItem(item, arrayItem, field){
    let index = arrayItem?.findIndex(el => el?.id === item?.id);
    arrayItem.splice(index, 1);
    
    // rebuild request body
    this.rebuildObject(`${field}`, arrayItem);
  }


  rebuildObject(field, data){
    this.jobPostCategory[`${field}`] = data;
    this.jobPostCategoryEvent.emit(this.jobPostCategory);
    this.skillModel = undefined;
    this.tagModel = undefined;
  }

  searchCategory(){
    const listDataSource = [...this.categories]
    .filter(el => {
      return JSON.stringify(el).toLowerCase().includes(this.search.toLowerCase());
    });

    this.categoriesFiltered = listDataSource;

  }

}
