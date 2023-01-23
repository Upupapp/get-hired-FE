
export interface Group {
  id: any;
  group_name: string;
  date_created: any;  
  number_of_members: number;
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
  { col_name: 'id', title: 'Group ID' },
  { col_name: 'group_name', title: 'Group Name'  },
  { col_name: 'number_of_members', title: 'Number of Members'  },
  { col_name: 'date_created', title: 'Date Created'  },
  { col_name: 'status', title: 'Status'  },
  { col_name: 'view_members', title: 'Members', type: 'action_button', button_title: 'View Members', button_class: 'view-group'  },
  { col_name: 'action', title: 'Action' , type: 'menu' },
];

const selectedColumns: string[] =  [
  'id',
  'group_name',
  'number_of_members',
  'date_created',
  'view_members',
  'action'
];
 
const contactGroupLists: Group[] = [
  {
    id: 60011,
    group_name: "HR Tech Group",
    status: "Active", 
    date_created: "02-12-2022",  
    number_of_members: 5
  },

  {
    id: 60012,
    group_name: "Web Development Team",
    status: "Active",  
    date_created: "02-12-2022",  
    number_of_members: 2
  },

  {
    id: 60013,
    group_name: "Business Team",
    status: "Active", 
    date_created: "02-12-2022",  
    number_of_members: 5
  },

  {
    id: 50014,
    group_name: "Design Team",
    status: "Active",   
    date_created: "02-12-2022",  
    number_of_members: 3 
  },

];




export {
  displayedColumns,
  selectedColumns,
  contactGroupLists
}