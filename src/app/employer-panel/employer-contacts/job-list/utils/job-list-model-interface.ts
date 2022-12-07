export interface JobList {
  id: any,
  name?: string,
}

export interface TableHeader {
  col_name: string;
  title: string;
  type?: string;
}

const displayedColumns: TableHeader[] = [
  { col_name: 'id', title: 'Job ID' },
  { col_name: 'name', title: 'Job Name' },
  { col_name: 'action', title: 'Action' , type: 'menu' },
];

const selectedColumns: string[] =  [
  'id',
  'name',
  'action'
];


const candidateJobList: JobList[]=[];

export {
  displayedColumns,
  selectedColumns,
  candidateJobList
}
