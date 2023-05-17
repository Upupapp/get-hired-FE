export interface Question {

}

export interface Interview {
  id: any;
  created_by: string;  
  date_created: any;  
  template_title: string;
  interview_questions: Question[];
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
  { col_name: 'id', title: 'ID'  },
  { col_name: 'created_by', title: 'Created By',  },
  { col_name: 'template_title', title: 'Invite List Name'  },
  { col_name: 'date_created', title: 'Date Created', type: 'date'  },
  { col_name: 'status', title: 'Status'  },
  { col_name: 'action', title: 'Action' , type: 'menu' },
];

const selectedColumns: string[] =  [
  'id',
  'created_by',
  'date_created',
  'template_title',
  'status',
  'action'
];
 
const interviewLists: Interview[] = [
  {
    id: 1001,  
    created_by: "James Marcii",  
    template_title: "Web Development Interview",
    date_created: new Date("July 1, 2022"),  
    interview_questions: [
      {
        question: "How long have you been using Angular 2/4+?", 
        number_of_retakes: 5,  
        duration: 3, 
      },
      {
        question:  "What is JavaScript and ES6",
        number_of_retakes: 5,  
        duration: 3, 
      },
      {
        question:"Are you available for full-time or part-time?",  
        number_of_retakes: 5,  
        duration: 3, 
      },
      
    ],
    status: "Active"
  },

  {
    id: 1002,  
    created_by: "James Marcii",  
    template_title: "Business Interview",
    date_created: new Date("August 1, 2022"),  
    interview_questions: [
      {
        question: "Does your business give back to your community??", 
        number_of_retakes: 5,  
        duration: 3, 
      },

      {
        question: "What kind of corporation is your business?",
        number_of_retakes: 5,  
        duration: 3, 
      },
      {
        question:"Which qualities do you look for in new employees?", 
        number_of_retakes: 5,  
        duration: 3, 
      },
    ],
    status: "Active"
  },

  {
    id: 1002,  
    created_by: "Julius Caesar",  
    template_title: "Backend Developer Interview",
    date_created: new Date("August 1, 2022"),   
    interview_questions: [
      {
        question: "Which technical skills do backend developers need to have?", 
        number_of_retakes: 5,  
        duration: 3, 
      },
      {
        question: "Which soft skills do backend developers need to be successful?",
        number_of_retakes: 5,  
        duration: 3, 
      },
      {
        question:"Name the main backend development responsibilities you had in your previous role.",
        number_of_retakes: 5,  
        duration: 3, 
      },
      
    ],
    status: "Active"
  },
];




export {
  displayedColumns,
  selectedColumns,
  interviewLists
}