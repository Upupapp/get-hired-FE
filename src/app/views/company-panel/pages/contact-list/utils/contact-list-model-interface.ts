
export interface Contact {
  id: any;
  profile_image: string;  
  first_name: string;
  last_name: string;
  email: string;  
  mobile_number: string;
  company: string;  
  industry: string;  
  job_type: string;
  work_setup: string;  
  expected_salary_min: number;
  expected_salary_max: number;  
  address: string;
  date_created: any;  
  number_of_group: number;
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
  { col_name: 'email', title: 'Email Address'  },
  { col_name: 'company', title: 'Company'  },
  { col_name: 'address', title: 'Address'  },
  { col_name: 'mobile_number', title: 'Mobile Number'  },
  { col_name: 'date_created', title: 'Date Created'  },
  { col_name: 'status', title: 'Status'  },
  { col_name: 'view_group', title: 'Groups', type: 'action_button', button_title: 'View Group', button_class: 'view-group'  },
  { col_name: 'action', title: 'Action' , type: 'menu' },
];

const selectedColumns: string[] =  [
  'full_name',
  'email',
  'company',
  'mobile_number',
  'address',
  'date_created',
  'view_group',
  'action'
];
 
const contactLists: Contact[] = [
  {
    id: 10011,
    profile_image: "/assets/images/face-1.jpg",  
    first_name: "Jordan",
    last_name: "Clark",
    email: "clark.jordan@gmail.com",
    mobile_number: "495-4587-455",
    company: "Software Wev Inc.",  
    industry: "", 
    status: "Active", 
    job_type: "Full-Time",
    work_setup: "Hybrid",  
    expected_salary_min: 25000,
    expected_salary_max: 50000,  
    address: "Ranchview, California ",
    date_created: "02-12-2022",  
    number_of_group: 5
  },

  {
    id: 10012,
    profile_image: "/assets/images/face-2.jpg",  
    first_name: "Samuel",
    last_name: "Solomon",
    email: "solomon.samuel@gmail.com",
    mobile_number: "495-4587-455",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Active",  
    job_type: "Full-Time",
    work_setup: "Remote",  
    expected_salary_min: 56000,
    expected_salary_max: 85000,  
    address: "Manila, Philippines ",
    date_created: "02-12-2022",  
    number_of_group: 2
  },

  {
    id: 10013,
    profile_image: "/assets/images/face-3.jpg",  
    first_name: "Michael",
    last_name: "Yemeni",
    email: "yemeni.michael@gmail.com",
    mobile_number: "441-4234-155",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Active", 
    job_type: "Part-Time",
    work_setup: "Remote",  
    expected_salary_min: 36000,
    expected_salary_max: 65000,  
    address: "123 Street Office, Singapore ",
    date_created: "02-12-2022",  
    number_of_group: 5
  },

  {
    id: 10014,
    profile_image: "/assets/images/face-4.jpg",  
    first_name: "Brian",
    last_name: "Mitchelle",
    email: "b.mitchelle@gmail.com",
    mobile_number: "114-4566-253",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Active",   
    job_type: "Part-Time",
    work_setup: "Remote",  
    expected_salary_min: 20000,
    expected_salary_max: 50000,  
    address: "Soutville, USA ",
    date_created: "02-12-2022",  
    number_of_group: 3 
  },

];




export {
  displayedColumns,
  selectedColumns,
  contactLists
}