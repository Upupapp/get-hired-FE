
export interface CompanyUser {
  id: any;
  job_role: any;

  first_name: string;
  last_name: string;
  email: string;
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
  { col_name: 'id', title: 'Access Id' },
  { col_name: 'full_name', title: 'Full Name'  },
  { col_name: 'email', title: 'Email Address'  },
  { col_name: 'job_role', title: 'Job Role'  },
  { col_name: 'action', title: 'Action' , type: 'menu' },
];

const selectedColumns: string[] =  [
  'id',
  'full_name',
  'email',
  'job_role',
  'action'
];



const companyUserLists: CompanyUser[] = [
  {
    id: 10011,
    job_role: "Admin",
    first_name: "Jordan",
    last_name: "Clark",
    email: "clark.jordan@gmail.com",
  },

  {
    id: 10012,
    job_role: "Admin",
    first_name: "Samuel",
    last_name: "Solomon",
    email: "solomon.samuel@gmail.com",
  },

  {
    id: 10013,
    job_role: "Manager",
    first_name: "Jules",
    last_name: "Juniper",
    email: "jul.jper@gmail.com",
  },
];




export {
  displayedColumns,
  selectedColumns,
  companyUserLists
}
