export interface Candidate {
  id: any,
  full_name?: string,
  email?: string;
  mobile_number?: string;
  address?: string;
  job_id?: any
  job_title?: string
  created_at?: string,
  groups?: any
  // id: any;
  // first_name: string;
  // last_name: string;
  // middle_name: string;
  // full_name: string;
  // code_name: string;
  // biography: string;
  // profile_image: string;
  // contact_number: string;
  // telephone_number: string;
  // company: string;
  // address: string;
  // address_b: string;
  // city: string;
  // post_code: string;
  // gender: string;
  // date_of_birth: Date;
  // age: number;
  // experience: string;
  // specialty: string;
  // code_number?: number;
  // documents?: any[];
  // email?: string;
  // password?: string;
  // status: string;
}

export interface TableHeader {
  col_name: string;
  title: string;
  type?: string;
}

const displayedColumns: TableHeader[] = [
  { col_name: 'full_name', title: 'Full Name' },
  { col_name: 'email', title: 'Email Address' },
  { col_name: 'mobile_number', title: 'Mobile Number' },
  { col_name: 'address', title: 'Address' },
  { col_name: 'job_id', title: 'Job ID' },
  { col_name: 'job_title', title: 'Job Title' },
  { col_name: 'created_at', title: 'Date Created', type: 'date' },
  // { col_name: 'groups', title: 'Group Name' },
];

const selectedColumns: string[] =  [
  'full_name',
  'email',
  'mobile_number',
  'address',
  'job_id',
  'job_title',
  'created_at',
  //'groups'
];


// const contactList: Contact[] = [
//   {
//     id: 14501,
//     first_name: "Joe",
//     last_name: "Smith",
//     company: "Company A",
//     profile_image: "/assets/images/face-1.jpg",
//     address: "Jenson Street Sampaloc Manila",
//     email: 'joe.smith@gmail.com',
//     status: 'Active'
//   },
// ];

const candidateList: Candidate[]=[];

export {
  displayedColumns,
  selectedColumns,
  candidateList
}
