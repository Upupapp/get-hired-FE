export interface JobList {
  jobId: any,
  jobTitle?: string,
  jobCity?: string,
  workSetupName?: string,
  jobTypeName?: string,
  salaryMaximum?: number,
  salaryMinimum?: number
}

export interface TableHeader {
  col_name: string;
  title: string;
  type?: string;
}

const displayedColumns: TableHeader[] = [
  { col_name: 'jobId', title: 'Job Id' },
  { col_name: 'jobTitle', title: 'Title' },
  { col_name: 'jobCity', title: 'Location' },
  { col_name: 'workSetupName', title: 'Work Setup' },
  { col_name: 'jobTypeName', title: 'Type' },
  { col_name: 'salaryMinimum', title: 'Minimum Salary' },
  { col_name: 'salaryMaximum', title: 'Maximum Salary' },
  { col_name: 'action', title: 'Action' , type: 'menu' },
];

const selectedColumns: string[] =  [
  'jobId',
  'jobTitle',
  'jobCity',
  'workSetupName',
  'jobTypeName',
  'salaryMinimum',
  'salaryMaximum',
  'action'
];


const candidateJobList: JobList[]=[];

export {
  displayedColumns,
  selectedColumns,
  candidateJobList
}
