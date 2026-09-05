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
  button_title?: string;
  button_class?: string;
}

const displayedColumns: TableHeader[] = [
  { col_name: 'email', title: 'Email Address' },
  { col_name: 'firstname', title: 'Firstname' },
  { col_name: 'lastname', title: 'Lastname' },
  { col_name: 'cell_number', title: 'Mobile number' },
  { col_name: 'address', title: 'Address' },
  // GETHIRED_TALENT_CANDIDATE_GROUP_MEMBER_REMOVAL_V1: explicit "Remove from
  // Group" action, distinct from "Delete"/"Remove Candidate" -- this only
  // removes the group_list membership row, never the candidate itself.
  { col_name: 'remove_from_group', title: 'Action', type: 'action_button', button_title: 'Remove from Group', button_class: 'remove-from-group' },
];

const selectedColumns: string[] =  [
  'email',
  'firstname',
  'lastname',
  'cell_number',
  'address',
  'remove_from_group'
];

const groupList: GroupList[]=[];

export {
  displayedColumns,
  selectedColumns,
  groupList
}
