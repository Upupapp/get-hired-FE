
export interface Contact {
  id: any;
  profile_image: string;  
  first_name: string;
  last_name: string;
  email: string;  
  code_number: string;
  company: string;  
  industry: string;  
  job_type: string;
  work_setup: string;  
  expected_salary_min: number;
  expected_salary_max: number;  
  address: string;
  date_applied: Date;  
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
  { col_name: 'full_name', title: 'Full Name'  },
  { col_name: 'date_applied', title: 'Date Applied', type: 'date'  },
  { col_name: 'address', title: 'Location'  },
  { col_name: 'work_setup', title: 'Work Setup'  },
  { col_name: 'job_type', title: 'Type'  },
  { col_name: 'company', title: 'Company'  },
  { col_name: 'email', title: 'Email'  },
  { col_name: 'code_number', title: 'Code Number'  },
  { col_name: 'salary', title: 'Expected Salary', type: 'salary'  },
  /*{ 
    col_name: 'cv_link', 
    title: 'CV', 
    button_title: 'View CV', 
    button_class: 'cv-link', 
    button_logo: '/assets/images/placeholder/icons/cv.png',
    type:'action_button'  
  },*/
  { col_name: 'status', title: 'Status'  },
  { col_name: 'action', title: 'Action' , type: 'menu' },
];

const selectedColumns: string[] =  [
  'full_name',
  'date_applied',
  'email',
  'company',
  'code_number',
  'address',
  'action'
];
 
const contactLists: Contact[] = [
  {
    id: 10011,
    profile_image: "/assets/images/face-1.jpg",  
    first_name: "Jordan",
    last_name: "Clark",
    email: "clark.jordan@gmail.com",
    code_number: "A-55012334",
    company: "Software Wev Inc.",  
    industry: "", 
    status: "Active", 
    job_type: "Full-Time",
    work_setup: "Hybrid",  
    expected_salary_min: 25000,
    expected_salary_max: 50000,  
    address: "Ranchview, California ",
    date_applied: new Date(),  
  },

  {
    id: 10012,
    profile_image: "/assets/images/face-2.jpg",  
    first_name: "Samuel",
    last_name: "Solomon",
    email: "solomon.samuel@gmail.com",
    code_number: "A-55012334",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Active",  
    job_type: "Full-Time",
    work_setup: "Remote",  
    expected_salary_min: 56000,
    expected_salary_max: 85000,  
    address: "Manila, Philippines ",
    date_applied: new Date(),  
  },

  {
    id: 10013,
    profile_image: "/assets/images/face-3.jpg",  
    first_name: "Michael",
    last_name: "Yemeni",
    email: "yemeni.michael@gmail.com",
    code_number: "C-13356244",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Active", 
    job_type: "Part-Time",
    work_setup: "Remote",  
    expected_salary_min: 36000,
    expected_salary_max: 65000,  
    address: "123 Street Office, Singapore ",
    date_applied: new Date(),  
  },

  {
    id: 10014,
    profile_image: "/assets/images/face-4.jpg",  
    first_name: "Brian",
    last_name: "Mitchelle",
    email: "b.mitchelle@gmail.com",
    code_number: "B-612313461",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Active",   
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
  contactLists
}