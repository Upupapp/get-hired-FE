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
    description: "Looking to add a pricing calculator to your website? Search no more, we created this user-based pricing calculator for you. Is your business operating in multiple countries? Show different pricing plans depending on their currency with our Multi Currency Pricing Table",
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
    location: "Ranchview, California ",  
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
    description: "Looking to add a pricing calculator to your website? Search no more, we created this user-based pricing calculator for you. Is your business operating in multiple countries? Show different pricing plans depending on their currency with our Multi Currency Pricing Table",
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