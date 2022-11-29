export interface ContactGroup {
  group_id: any,
  group_name: any
}

export interface TableHeader {
  col_name: string;
  title: string;
  type?: string;
}

const displayedColumns: TableHeader[] = [
  { col_name: 'group_id', title: 'Group ID' },
  { col_name: 'group_name', title: 'Group Name' },
];

const selectedColumns: string[] =  [
  'group_id',
  'group_name',
];

const contactGroupList: ContactGroup[]=[];

export {
  displayedColumns,
  selectedColumns,
  contactGroupList
}
