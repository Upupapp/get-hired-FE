export interface Badge {
  title: string;
  logo: string;
}

export interface Job {
  id: any;
  banner_thumbnail: string;  
  title: string;
  company: string;  
  industry: string;  
  badge: Badge[];  
  job_type: string;
  job_description: string;
  job_duties: string;  
  skill_requirements: string[];
  skill_experience: string[];
  education_requirements: string[];
  other_requirements: string[];
  work_setup: string;  
  salary_min: number;
  salary_max: number;  
  tags: string[];
  address: string;
  date_posted: Date;  
  expiration_date: Date;  
  company_id: number;
  status: string;
}

export interface TableHeader {
  col_name: string;
  title: string;
  type?: string;
}

const displayedColumns: TableHeader[] = [
  { col_name: 'id', title: 'Job Id' },
  { col_name: 'title', title: 'Title'  },
  { col_name: 'date_posted', title: 'Date Posted', type: 'date'  },
  { col_name: 'address', title: 'Location'  },
  { col_name: 'work_setup', title: 'Work Setup'  },
  { col_name: 'job_type', title: 'Type'  },
  { col_name: 'salary', title: 'Salary', type: 'salary'  },
  { col_name: 'status', title: 'Status'  },
  { col_name: 'action', title: 'Action' , type: 'menu' },
];

const selectedColumns: string[] =  [
  'id',
  'title',
  'date_posted',
  'address',
  'work_setup',
  'job_type',
  'salary',
  'status',
  'action'
];
 
const jobLists: Job[] = [
  {
    company_id: 12001,
    id: 3001,
    banner_thumbnail: "/assets/images/placeholder/job-post-thumb-1.png",  
    title: "Administrative Assistant",
    company: "Software Wev Inc.",  
    industry: "", 
    status: "Expired", 
    badge: [
      {
        title: "Gender Equality",  
        logo: 'badge-1'
      },  

      {
        title: "Worklife Balance",  
        logo: 'badge-2'
      },  

      {
        title: "Gym and Health Membership",  
        logo: 'badge-3'
      },  

      {
        title: "Friendly Team Members",  
        logo: 'badge-2'
      },  

      {
        title: "Competetive Salary",  
        logo: 'badge-1'
      },  
    ],  
    job_type: "Full-Time",
    work_setup: "Hybrid",  
    salary_min: 25000,
    salary_max: 50000,  
    tags: ["Marketing",  "Time Management"],
    address: "Ranchview, California ",
    job_description: "Looking to add a pricing calculator to your website? Search no more, we created this user-based pricing calculator for you. Is your business operating in multiple countries? Show different pricing plans depending on their currency with our Multi Currency Pricing Table. This is an ideal opportunity for any technical Architectural Assistants and Technicians/ Technologists looking to work for a growing practice.",
    job_duties: "Looking to add a pricing calculator to your website? Search no more, we created this user-based pricing calculator for you.  young and dynamic company in Frankfurt am Main, Germany, with the mission to provide patients with a contemporary.", 
    skill_requirements: [
      "Looking to add a pricing calculator",
      "Website Search no more",
      "User-based pricing calculator for you", 
      "Is your business operating in multiple countries",
    ],
    skill_experience: ["Advanced degree or equivalent experience in graphic and web design3 or more years of professional design experience", "Direct response email experience", "Ecommerce website design experience", "Familiarity with mobile and web apps preferred", "Excellent communication skills, most notably a demonstrated ability to solicit and address creative and design feedback", "Must be able to work under pressure and meet deadlines while maintaining a positive attitude and providing exemplary customer service", "Ability to work independently and to carry out assignments"],
    education_requirements: ["Bachelor’s degree in Economics, Marketing, Business, or a related discipline is highly desired", "2+ years of relevant work experience in buying", "An equivalent combination of education, training and experience may be accepted."],
    other_requirements: ["Graduated from a top university", "Proven success in school or at work", "Professional experience with native English speakers", "Experience working from home", "Professional presentation on resume and online"],
    date_posted: new Date(),  
    expiration_date: new Date(), 
  },

  {
    company_id: 12002,
    id: 3002,
    banner_thumbnail: "/assets/images/placeholder/job-post-thumb-2.png",  
    title: "Angular Developer",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Expired", 
    badge: [
      {
        title: "Gender Equality",  
        logo: 'badge-1'
      },  

      {
        title: "Worklife Balance",  
        logo: 'badge-2'
      },   
    ],  
    job_type: "Full-Time",
    work_setup: "Remote",  
    salary_min: 56000,
    salary_max: 85000,  
    tags: ["Development", "Professionalism", "Marketing"],
    address: "Manila, Philippines ",
    job_description: "Looking to add a pricing calculator to your website? Search no more, we created this user-based pricing calculator for you. Is your business operating in multiple countries? Show different pricing plans depending on their currency with our Multi Currency Pricing Table. This is an ideal opportunity for any technical Architectural Assistants and Technicians/ Technologists looking to work for a growing practice.",
    job_duties: "Looking to add a pricing calculator to your website? Search no more, we created this user-based pricing calculator for you.  young and dynamiccompany in Frankfurt am Main, Germany, with the mission to provide patients with a contemporary.", 
    skill_requirements: [
      "Looking to add a pricing calculator",
      "Website Search no more",
      "User-based pricing calculator for you", 
      "Is your business operating in multiple countries",
    ],
    skill_experience: ["Experience with API Integration (Google Maps API, Stripe API, WordPress API, etc)", "Experience using Chart.js and Domo Phoenix API (Charts and Graphs)", "Experience with ES5/ES6, JavaScript, and Node", "Experience with creating CRUD operations to connect the Frontend to Backend via RxJS, REST, and HTTP protocols", "Experience with NPM, GitHub, Bitbucket, Trello", "Experience in working with Angular 9 | 10+", "Experience in working with TypeScript, HTML5, SASS, and JSON", "Experience with integrating Bootstrap, Angular Materials and Primeng to the Frontend", "Experience in maintaining and creating readable codes using MVC/MVVW design pattern", "Experience with transforming design mockups/wireframes into functional web applications", "Experience in creating a proper database schema using Mongoose for MongoDB", "Experience with Selenium Web Drivers integration using Node JS", "Deployment of Node and Angular Applications to the cloud such as Heroku and Amazon EC2"],
    education_requirements: ["Bachelor’s degree in Computer Science, Engineering, Information Technology, or any related discipline is highly desired", "5+ years of relevant work experience in Web Development", "An equivalent combination of education, training and experience may be accepted."],
    other_requirements: ["Graduated from a top university", "Proven success in school or at work", "Professional experience with native English speakers", "Experience working from home", "Professional presentation on resume and online"],
    date_posted: new Date(),  
    expiration_date: new Date(), 
  },

  {
    company_id: 12003,
    id: 3003,
    banner_thumbnail: "/assets/images/placeholder/job-post-thumb-3.png",  
    title: "SQL Developer",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Expired", 
    badge: [
      {
        title: "Worklife Balance",  
        logo: 'badge-2'
      },  

      {
        title: "Gym and Health Membership",  
        logo: 'badge-3'
      },
    ],  
    job_type: "Part-Time",
    work_setup: "Remote",  
    salary_min: 36000,
    salary_max: 65000,  
    tags: ["Business", "Development", "Time Management"],
    address: "123 Street Office, Singapore ",
    job_description: "Looking to add a pricing calculator to your website? Search no more, we created this user-based pricing calculator for you. Is your business operating in multiple countries? Show different pricing plans depending on their currency with our Multi Currency Pricing Table. This is an ideal opportunity for any technical Architectural Assistants and Technicians/ Technologists looking to work for a growing practice.",
    job_duties: "Looking to add a pricing calculator to your website? Search no more, we created this user-based pricing calculator for you.  young and dynamiccompany in Frankfurt am Main, Germany, with the mission to provide patients with a contemporary.", 
    skill_requirements: [
      "Looking to add a pricing calculator",
      "Website Search no more",
      "User-based pricing calculator for you", 
      "Is your business operating in multiple countries",
    ],
    skill_experience: ["Advanced degree or equivalent experience in graphic and web design3 or more years of professional design experience", "Direct response email experience", "Ecommerce website design experience", "Familiarity with mobile and web apps preferred", "Excellent communication skills, most notably a demonstrated ability to solicit and address creative and design feedback", "Must be able to work under pressure and meet deadlines while maintaining a positive attitude and providing exemplary customer service", "Ability to work independently and to carry out assignments"],
    education_requirements: ["Bachelor’s degree in Economics, Marketing, Business, or a related discipline is highly desired", "2+ years of relevant work experience in buying", "An equivalent combination of education, training and experience may be accepted."],
    other_requirements: ["Graduated from a top university", "Proven success in school or at work", "Professional experience with native English speakers", "Experience working from home", "Professional presentation on resume and online"],
    date_posted: new Date(),  
    expiration_date: new Date(), 
  },

  {
    company_id: 12004,
    id: 3004,
    banner_thumbnail: "/assets/images/placeholder/job-post-thumb-4.png",  
    title: "Data Analyst",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Expired", 
    badge: [
      {
        title: "Gender Equality",  
        logo: 'badge-1'
      },  

      {
        title: "Worklife Balance",  
        logo: 'badge-2'
      },  

      {
        title: "Gym and Health Membership",  
        logo: 'badge-3'
      },
    ],   
    job_type: "Part-Time",
    work_setup: "Remote",  
    salary_min: 20000,
    salary_max: 50000,  
    tags: ["Data Science", "Professionalism", "Time Management"],
    address: "Soutville, USA ",
    job_description: "Looking to add a pricing calculator to your website? Search no more, we created this user-based pricing calculator for you. Is your business operating in multiple countries? Show different pricing plans depending on their currency with our Multi Currency Pricing Table. This is an ideal opportunity for any technical Architectural Assistants and Technicians/ Technologists looking to work for a growing practice.",
    job_duties: "Looking to add a pricing calculator to your website? Search no more, we created this user-based pricing calculator for you.  young and dynamiccompany in Frankfurt am Main, Germany, with the mission to provide patients with a contemporary.", 
    skill_requirements: [
      "Looking to add a pricing calculator",
      "Website Search no more",
      "User-based pricing calculator for you", 
      "Is your business operating in multiple countries",
    ],
    skill_experience: ["Advanced degree or equivalent experience in graphic and web design3 or more years of professional design experience", "Direct response email experience", "Ecommerce website design experience", "Familiarity with mobile and web apps preferred", "Excellent communication skills, most notably a demonstrated ability to solicit and address creative and design feedback", "Must be able to work under pressure and meet deadlines while maintaining a positive attitude and providing exemplary customer service", "Ability to work independently and to carry out assignments"],
    education_requirements: ["Bachelor’s degree in Economics, Marketing, Business, or a related discipline is highly desired", "2+ years of relevant work experience in buying", "An equivalent combination of education, training and experience may be accepted."],
    other_requirements: ["Graduated from a top university", "Proven success in school or at work", "Professional experience with native English speakers", "Experience working from home", "Professional presentation on resume and online"],
    date_posted: new Date(),  
    expiration_date: new Date(),  
  },

];




export {
  displayedColumns,
  selectedColumns,
  jobLists
}