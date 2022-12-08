export interface GroupList {
  email: any,
  firstname?: string,
  lastname?: string;
  cell_number?: string;
  address?: string;
}

export interface TableHeader {
  col_name: string;
  title: string;
  type?: string;
}

const displayedColumns: TableHeader[] = [
  { col_name: 'email', title: 'Email Address' },
  { col_name: 'firstname', title: 'Firstname' },
  { col_name: 'lastname', title: 'Lastname' },
  { col_name: 'cell_number', title: 'Mobile number' },
  { col_name: 'address', title: 'Address' },
];

const selectedColumns: string[] =  [
  'email',
  'firstname',
  'lastname',
  'cell_number',
  'address'
];

const groupList: GroupList[]=[];

export {
  displayedColumns,
  selectedColumns,
  groupList
}
