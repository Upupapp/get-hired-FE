
export interface Applicant {
  id: any;
  job_id: any;
  profile_image: string;  
  first_name: string;
  last_name: string;
  company: string;  
  industry: string;  
  job_type: string;
  work_setup: string;  
  expected_salary_min: number;
  expected_salary_max: number;  
  address: string;
  date_applied: Date;  
  company_id: number;
  status: string;
}

export interface TableHeader {
  col_name: string;
  title: string;
  type?: string;
  button_title?: string;
  button_class?: string;
  button_logo?: string;
}

const displayedColumns: TableHeader[] = [
  { col_name: 'job_id', title: 'Job Id' },
  { col_name: 'full_name', title: 'Full Name'  },
  { col_name: 'date_applied', title: 'Date Applied', type: 'date'  },
  { col_name: 'address', title: 'Location'  },
  { col_name: 'work_setup', title: 'Work Setup'  },
  { col_name: 'job_type', title: 'Type'  },
  { col_name: 'salary', title: 'Expected Salary', type: 'salary'  },
  { 
    col_name: 'cv_link', 
    title: 'CV', 
    button_title: 'View CV', 
    button_class: 'cv-link', 
    button_logo: '/assets/images/placeholder/icons/cv.png',
    type:'action_button'  
  },
  { col_name: 'status', title: 'Status'  },
  { col_name: 'action', title: 'Action' , type: 'menu' },
];

const selectedColumns: string[] =  [
  'job_id',
  'full_name',
  'date_applied',
  'address',
  'salary',
  'cv_link',
  'status',
  'action'
];
 
const applicantLists: Applicant[] = [
  {
    id: 10011,
    company_id: 12001,
    job_id: 3001,
    profile_image: "/assets/images/face-1.jpg",  
    first_name: "Jordan",
    last_name: "Clark",
    company: "Software Wev Inc.",  
    industry: "", 
    status: "Initial Interview", 
    job_type: "Full-Time",
    work_setup: "Hybrid",  
    expected_salary_min: 25000,
    expected_salary_max: 50000,  
    address: "Ranchview, California ",
    date_applied: new Date(),  
  },

  {
    id: 10012,
    company_id: 12002,
    job_id: 3002,
    profile_image: "/assets/images/face-2.jpg",  
    first_name: "Samuel",
    last_name: "Solomon",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Technical Interview",  
    job_type: "Full-Time",
    work_setup: "Remote",  
    expected_salary_min: 56000,
    expected_salary_max: 85000,  
    address: "Manila, Philippines ",
    date_applied: new Date(),  
  },

  {
    id: 10013,
    company_id: 12003,
    job_id: 3003,
    profile_image: "/assets/images/face-3.jpg",  
    first_name: "Michael",
    last_name: "Yemeni",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Initial Interview", 
    job_type: "Part-Time",
    work_setup: "Remote",  
    expected_salary_min: 36000,
    expected_salary_max: 65000,  
    address: "123 Street Office, Singapore ",
    date_applied: new Date(),  
  },

  {
    id: 10014,
    company_id: 12004,
    job_id: 3004,
    profile_image: "/assets/images/face-4.jpg",  
    first_name: "Brian",
    last_name: "Mitchelle",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Contract Signing",   
    job_type: "Part-Time",
    work_setup: "Remote",  
    expected_salary_min: 20000,
    expected_salary_max: 50000,  
    address: "Soutville, USA ",
    date_applied: new Date(),   
  },

];




export {
  displayedColumns,
  selectedColumns,
  applicantLists
}