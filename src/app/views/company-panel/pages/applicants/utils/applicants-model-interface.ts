
export interface Applicant {
  id: any;
  job_id: any;
  profile_image: string;  
  first_name: string;
  last_name: string;
  email: string;  
  company: string;  
  industry: string;  
  job_type: string;
  work_setup: string;  
  expected_salary_min: number;
  expected_salary_max: number;  
  address: string;
  date_applied: Date;
  time_applied: string;  
  company_id: number;

  title?: string;
  short_bio?: string;  
  services_provided?: string;
  work_experience?: any;  
  education_background?: any;
  awards?: any;
  skills?: any;
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
  { col_name: 'id', title: 'Applicant Id' },
  { col_name: 'full_name', title: 'Full Name'  },
  { col_name: 'date_applied', title: 'Date Applied', type: 'date'  },
  { col_name: 'time_applied', title: 'Time'  },
  
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
  'id',
  'full_name',
  'date_applied',
  'time_applied',
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
    email: "clark.jordan@gmail.com",
    status: "Initial Interview", 
    job_type: "Full-Time",
    work_setup: "Hybrid",  
    expected_salary_min: 25000,
    expected_salary_max: 50000,  
    address: "Ranchview, California ",
    date_applied: new Date(),  
    time_applied: "8:00 AM",
    title: 'Fullstack Developer',
    short_bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu.',  
    services_provided: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    work_experience: [
      {
        id: 1,  
        title: "Website Design Senior Level",  
        job_type: "Full-Time",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
        location: "Los Angeles, USA",
        company: "Apple Inc",
        start_date: new Date("June 11, 2021"),
        end_date: new Date("April 12, 2022")
      },
      {
        id: 2,  
        title: "Frontend Engineer",  
        job_type: "Full-Time",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
        location: "Los Angeles, USA",
        company: "Microsoft LTD",
        start_date: new Date("April 11, 2020"),
        end_date: new Date("March 12, 2021")
      }
    ],  
    education_background: [
      {
        id: 1,  
        field_of_study: "Master Degree",  
        school_address: "Manila, Philippines",
        school: "De La Salle-College of Saint Benilde",
        start_date: new Date("June 11, 2021"),
        end_date: new Date("April 12, 2022")
      },
      {
        id: 2,  
        field_of_study: "BS Computer Science",  
        school_address: "Manila, Philippines",
        school: "Ateneo de Naga University",
        start_date: new Date("April 09, 2009"),
        end_date: new Date("March 12, 2015")
      }
    ],
    awards: [
      {
        id: 1,  
        title: "Team Leader",  
        job_type: "Full-Time",
        company: "Microsoft LTD",
        location: "Ateneo de Naga University",
        details: "Experience with the responsive and adaptive design is strongly preferred. Also, an understanding of the entire web development process, including design, development, and deployment is preferred.",
        start_date: new Date("June 11, 2021"),
        end_date: new Date("April 12, 2022")
      }
    ],
    skills: ["Marketing", "Angular", "JavaScript", "TypeScript", "HTML", "CSS", "Bootstrap", "MongoDB", "Node", "Web Development", "Frontend"],
  },

  {
    id: 10012,
    company_id: 12002,
    job_id: 3002,
    profile_image: "/assets/images/face-2.jpg",  
    first_name: "Samuel",
    last_name: "Solomon",
    email: "solomon.samuel@gmail.com",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Technical Interview",  
    job_type: "Full-Time",
    work_setup: "Remote",  
    expected_salary_min: 56000,
    expected_salary_max: 85000,  
    address: "Manila, Philippines ",
    date_applied: new Date(), 
    time_applied: "10:00 AM",
    title: 'Angular Developer',
    short_bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu.',  
    services_provided: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    work_experience: [
      {
        id: 1,  
        title: "Website Design Senior Level",  
        job_type: "Full-Time",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
        location: "Los Angeles, USA",
        company: "Apple Inc",
        start_date: new Date("June 11, 2021"),
        end_date: new Date("April 12, 2022")
      },
      {
        id: 2,  
        title: "Frontend Engineer",  
        job_type: "Full-Time",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
        location: "Los Angeles, USA",
        company: "Microsoft LTD",
        start_date: new Date("April 11, 2020"),
        end_date: new Date("March 12, 2021")
      }
    ],  
    education_background: [
      {
        id: 1,  
        field_of_study: "Master Degree",  
        school_address: "Manila, Philippines",
        school: "De La Salle-College of Saint Benilde",
        start_date: new Date("June 11, 2021"),
        end_date: new Date("April 12, 2022")
      },
      {
        id: 2,  
        field_of_study: "BS Computer Science",  
        school_address: "Manila, Philippines",
        school: "Ateneo de Naga University",
        start_date: new Date("April 09, 2009"),
        end_date: new Date("March 12, 2015")
      }
    ],
    awards: [
      {
        id: 1,  
        title: "Team Leader",  
        job_type: "Full-Time",
        company: "Microsoft LTD",
        location: "Ateneo de Naga University",
        details: "Experience with the responsive and adaptive design is strongly preferred. Also, an understanding of the entire web development process, including design, development, and deployment is preferred.",
        start_date: new Date("June 11, 2021"),
        end_date: new Date("April 12, 2022")
      }
    ],
    skills: ["Marketing", "Angular", "JavaScript", "TypeScript", "HTML", "CSS", "Bootstrap", "MongoDB", "Node", "Web Development", "Frontend"], 
  },

  {
    id: 10013,
    company_id: 12003,
    job_id: 3003,
    profile_image: "/assets/images/face-7.jpg",  
    first_name: "Michael",
    last_name: "Yemeni",
    email: "yemeni.michael@gmail.com",
    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Initial Interview", 
    job_type: "Part-Time",
    work_setup: "Remote",  
    expected_salary_min: 36000,
    expected_salary_max: 65000,  
    address: "123 Street Office, Singapore ",
    date_applied: new Date(), 
    time_applied: "8:15 AM",
    
    title: 'SQL Developer',
    short_bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu.',  
    services_provided: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    work_experience: [
      {
        id: 1,  
        title: "Website Design Senior Level",  
        job_type: "Full-Time",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
        location: "Los Angeles, USA",
        company: "Apple Inc",
        start_date: new Date("June 11, 2021"),
        end_date: new Date("April 12, 2022")
      },
      {
        id: 2,  
        title: "Frontend Engineer",  
        job_type: "Full-Time",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
        location: "Los Angeles, USA",
        company: "Microsoft LTD",
        start_date: new Date("April 11, 2020"),
        end_date: new Date("March 12, 2021")
      }
    ],  
    education_background: [
      {
        id: 1,  
        field_of_study: "Master Degree",  
        school_address: "Manila, Philippines",
        school: "De La Salle-College of Saint Benilde",
        start_date: new Date("June 11, 2021"),
        end_date: new Date("April 12, 2022")
      },
      {
        id: 2,  
        field_of_study: "BS Computer Science",  
        school_address: "Manila, Philippines",
        school: "Ateneo de Naga University",
        start_date: new Date("April 09, 2009"),
        end_date: new Date("March 12, 2015")
      }
    ],
    awards: [
      {
        id: 1,  
        title: "Team Leader",  
        job_type: "Full-Time",
        company: "Microsoft LTD",
        location: "Ateneo de Naga University",
        details: "Experience with the responsive and adaptive design is strongly preferred. Also, an understanding of the entire web development process, including design, development, and deployment is preferred.",
        start_date: new Date("June 11, 2021"),
        end_date: new Date("April 12, 2022")
      }
    ],
    skills: ["Marketing", "Angular", "JavaScript", "TypeScript", "HTML", "CSS", "Bootstrap", "MongoDB", "Node", "Web Development", "Frontend"], 
  },

  {
    id: 10014,
    company_id: 12004,
    job_id: 3004,
    profile_image: "/assets/images/face-4.jpg",  
    first_name: "Brian",
    last_name: "Mitchelle",
    email: "b.mitchelle@gmail.com",

    company: "Moveup Wev Inc.",  
    industry: "", 
    status: "Contract Signing",   
    job_type: "Part-Time",
    work_setup: "Remote",  
    expected_salary_min: 20000,
    expected_salary_max: 50000,  
    address: "Soutville, USA ",
    date_applied: new Date(),
    time_applied: "8:00 AM",
    
    title: 'Frontend Engineer',
    short_bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu.',  
    services_provided: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    work_experience: [
      {
        id: 1,  
        title: "Website Design Senior Level",  
        job_type: "Full-Time",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
        location: "Los Angeles, USA",
        company: "Apple Inc",
        start_date: new Date("June 11, 2021"),
        end_date: new Date("April 12, 2022")
      },
      {
        id: 2,  
        title: "Frontend Engineer",  
        job_type: "Full-Time",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veni am, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
        location: "Los Angeles, USA",
        company: "Microsoft LTD",
        start_date: new Date("April 11, 2020"),
        end_date: new Date("March 12, 2021")
      }
    ],  
    education_background: [
      {
        id: 1,  
        field_of_study: "Master Degree",  
        school_address: "Manila, Philippines",
        school: "De La Salle-College of Saint Benilde",
        start_date: new Date("June 11, 2021"),
        end_date: new Date("April 12, 2022")
      },
      {
        id: 2,  
        field_of_study: "BS Computer Science",  
        school_address: "Manila, Philippines",
        school: "Ateneo de Naga University",
        start_date: new Date("April 09, 2009"),
        end_date: new Date("March 12, 2015")
      }
    ],
    awards: [
      {
        id: 1,  
        title: "Team Leader",  
        job_type: "Full-Time",
        company: "Microsoft LTD",
        location: "Ateneo de Naga University",
        details: "Experience with the responsive and adaptive design is strongly preferred. Also, an understanding of the entire web development process, including design, development, and deployment is preferred.",
        start_date: new Date("June 11, 2021"),
        end_date: new Date("April 12, 2022")
      }
    ],
    skills: ["Marketing", "Angular", "JavaScript", "TypeScript", "HTML", "CSS", "Bootstrap", "MongoDB", "Node", "Web Development", "Frontend"],   
  },

];




export {
  displayedColumns,
  selectedColumns,
  applicantLists
}