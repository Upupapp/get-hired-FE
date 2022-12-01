export interface ContactGroup {
  group_id: any,
  group_name: any,
  members?: any,
  emails?: any
}

export interface TableHeader {
  col_name: string;
  title: string;
  type?: string;
}

const displayedColumns: TableHeader[] = [
  { col_name: 'group_id', title: 'Group ID' },
  { col_name: 'group_name', title: 'Group Name' },
  { col_name: 'members', title: 'Number of Members', type: 'number' },
  { col_name: 'action', title: 'Action' , type: 'menu' },
];

const selectedColumns: string[] =  [
  'group_id',
  'group_name',
  'members',
  'action'
];

const contactGroupList: ContactGroup[]=[];

export {
  displayedColumns,
  selectedColumns,
  contactGroupList
}
