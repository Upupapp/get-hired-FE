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
  button_title?: string;
  button_class?: string;
  button_logo?: string;
}

const displayedColumns: TableHeader[] = [
  { col_name: 'group_id', title: 'Group ID' },
  { col_name: 'group_name', title: 'Group Name' },
  { col_name: 'members', title: 'Number of Members', type: 'number' },
  { col_name: 'view_members', title: 'Members', type: 'action_button', button_title: 'View Members', button_class: 'view-group'  },
  { col_name: 'action', title: 'Action' , type: 'menu' },
];

const selectedColumns: string[] =  [
  'group_id',
  'group_name',
  'members',
  'view_members',
  'action'
];

const contactGroupList: ContactGroup[]=[];

export {
  displayedColumns,
  selectedColumns,
  contactGroupList
}
