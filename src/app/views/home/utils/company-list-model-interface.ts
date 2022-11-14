export interface Badge {
  title: string;
  logo: string;
}

export interface Company {
  id: any;
  banner_thumbnail: string;  
  logo: string;
  name: string;  
  type: string;
  description: string;
  number_of_employee: string;
  rating: number;  
  location: string;  
}

export interface TableHeader {
  col_name: string;
  title: string;
  type?: string;
}

const displayedColumns: TableHeader[] = [
  { col_name: 'profile_image', title: '' , type: 'profile_image' },
];

const selectedColumns: string[] =  [
  
  //'status'
];
 
const companyLists: Company[] = [
  {
    id: 12001,
    banner_thumbnail: "/assets/images/placeholder/company-1.png",  
    logo: "/assets/images/placeholder/company-1.png",  
    name: "Software Wev Inc.",  
    type: "Technology/Professional",
    description: "A company profile describes what makes your company unique. It automatically differentiates your brand because no other company has the exact same founding story and reason for existing that your business does.",
    number_of_employee: "25-55",
    rating: 4.7,    
    location: "Ranchview, California ",  
  },

  {
    id: 12002,
    banner_thumbnail: "/assets/images/placeholder/company-2.png",  
    logo: "/assets/images/placeholder/company-2.png",  
    name: "Moveup Wev Inc.",  
    type: "Web Development",
    description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur ",
    number_of_employee: "25-55",
    rating: 4.7,    
    location: "Manila, Philippines ", 
  },

  {
    id: 12003,
    banner_thumbnail: "/assets/images/placeholder/company-3.png",  
    logo: "/assets/images/placeholder/company-3.png",  
    name: "Software Wev Inc.",  
    type: "Technology/Professional",
    description: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est",
    number_of_employee: "25-55",
    rating: 4.7,    
    location: "Ranchview, California ",  
  },

  {
    id: 12004,
    banner_thumbnail: "/assets/images/placeholder/company-4.png",  
    logo: "/assets/images/placeholder/company-4.png",  
    name: "Software Wev Inc.",  
    type: "Technology/Professional",
    description: "A company profile describes what makes your company unique. It automatically differentiates your brand because no other company has the exact same founding story and reason for existing that your business does.",
    number_of_employee: "25-55",
    rating: 4.7,    
    location: "Ranchview, California ",  
  },


  {
    id: 12005,
    banner_thumbnail: "/assets/images/placeholder/slack.png",  
    logo: "/assets/images/placeholder/slack-logo.png",  
    name: "Slack",  
    type: "Technology/Professional",
    description: "A company profile describes what makes your company unique. It automatically differentiates your brand because no other company has the exact same founding story and reason for existing that your business does.",
    number_of_employee: "25-55",
    rating: 4.7,    
    location: "Ranchview, California ",  
  },

  {
    id: 12006,
    banner_thumbnail: "/assets/images/placeholder/microsoft.png",  
    logo: "/assets/images/placeholder/microsoft-logo.png",  
    name: "Microsoft",  
    type: "Technology",
    description: "A company profile describes what makes your company unique. It automatically differentiates your brand because no other company has the exact same founding story and reason for existing that your business does.",
    number_of_employee: "25-55",
    rating: 4.7,    
    location: "Ranchview, California ",  
  },

  {
    id: 12007,
    banner_thumbnail: "/assets/images/placeholder/google.png",  
    logo: "/assets/images/placeholder/google-logo.png",  
    name: "Google",  
    type: "Technology",
    description: "A company profile describes what makes your company unique. It automatically differentiates your brand because no other company has the exact same founding story and reason for existing that your business does.",
    number_of_employee: "25-55",
    rating: 4.7,    
    location: "Ranchview, California ",  
  },

  {
    id: 12010,
    banner_thumbnail: "/assets/images/placeholder/airbnb.png",  
    logo: "/assets/images/placeholder/airbnb-logo.png",  
    name: "Airbnb",  
    type: "Rental",
    description: "A company profile describes what makes your company unique. It automatically differentiates your brand because no other company has the exact same founding story and reason for existing that your business does.",
    number_of_employee: "25-55",
    rating: 4.7,    
    location: "Ranchview, California ",  
  },

  {
    id: 12008,
    banner_thumbnail: "/assets/images/placeholder/linkedin.png",  
    logo: "/assets/images/placeholder/linkedin-logo.png",  
    name: "Linkedin",  
    type: "Careers",
    description: "A company profile describes what makes your company unique. It automatically differentiates your brand because no other company has the exact same founding story and reason for existing that your business does.",
    number_of_employee: "25-55",
    rating: 4.7,    
    location: "Ranchview, California ",  
  },

  {
    id: 12009,
    banner_thumbnail: "/assets/images/placeholder/paymaya.png",  
    logo: "/assets/images/placeholder/paymaya-logo.png",  
    name: "Maya",  
    type: "Mobile Banking",
    description: "A company profile describes what makes your company unique. It automatically differentiates your brand because no other company has the exact same founding story and reason for existing that your business does.",
    number_of_employee: "25-55",
    rating: 4.7,    
    location: "Ranchview, California ",  
  },
];




export {
  displayedColumns,
  selectedColumns,
  companyLists
}