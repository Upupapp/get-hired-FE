export interface Job {
  id: any;
  banner_thumbnail: string;  
  title: string;
  company: string;  
  category: string;  
  badge: string[];  
  job_type: string;
  work_setup: string;  
  salary_min: number;
  salary_max: number;  
  tags: string[];
  address: string;
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
 
const jobLists: Job[] = [
  {
    id: 3001,
    banner_thumbnail: "/assets/images/placeholder/job-post-thumb-1.png",  
    title: "Administrative Assistant",
    company: "Software Wev Inc.",  
    category: "",  
    badge: ["badge-1", "badge-2", "badge-3"],  
    job_type: "Full-Time",
    work_setup: "Hybrid",  
    salary_min: 25000,
    salary_max: 50000,  
    tags: ["Marketing", "Professionalism", "Time Management"],
    address: "Ranchview, California ",
  },

  {
    id: 3002,
    banner_thumbnail: "/assets/images/placeholder/job-post-thumb-2.png",  
    title: "Angular Developer",
    company: "Moveup Wev Inc.",  
    category: "",  
    badge: ["badge-1", "badge-2"],  
    job_type: "Part-Time",
    work_setup: "Remote",  
    salary_min: 26000,
    salary_max: 55000,  
    tags: ["Development", "Professionalism", "Marketing"],
    address: "Ranchview, California ",
  },

  {
    id: 3002,
    banner_thumbnail: "/assets/images/placeholder/job-post-thumb-3.png",  
    title: "SQL Developer",
    company: "Moveup Wev Inc.",  
    category: "",  
    badge: ["badge-1", "badge-2"],  
    job_type: "Part-Time",
    work_setup: "Remote",  
    salary_min: 36000,
    salary_max: 65000,  
    tags: ["Business", "Development", "Time Management"],
    address: "123 Street Office, Singapore ",
  },

  {
    id: 3002,
    banner_thumbnail: "/assets/images/placeholder/job-post-thumb-4.png",  
    title: "Data Analyst",
    company: "Moveup Wev Inc.",  
    category: "",  
    badge: ["badge-1", "badge-2"],  
    job_type: "Part-Time",
    work_setup: "Remote",  
    salary_min: 20000,
    salary_max: 50000,  
    tags: ["Data Science", "Professionalism", "Time Management"],
    address: "Soutville, USA ",
  },

];




export {
  displayedColumns,
  selectedColumns,
  jobLists
}