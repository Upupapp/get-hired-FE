export interface Question {

}

export interface Interview {
  id: any;
  company: string;  
  date_invited: any;  
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
  { col_name: 'company', title: 'Company',  },
  { col_name: 'template_title', title: 'Interview Name'  },
  { col_name: 'date_invited', title: 'Date Invited', type: 'date'  },
  { col_name: 'status', title: 'Status'  },
  { col_name: 'action', title: 'Action' , type: 'menu' },
];

const selectedColumns: string[] =  [
  'id',
  'company',
  'date_invited',
  'template_title',
  'status',
  'action'
];
 
const interviewLists: Interview[] = [
  {
    id: 1001,  
    company: "Summer Web Tech",  
    template_title: "Web Development Interview",
    date_invited: new Date("July 1, 2022"),  
    interview_questions: [
      {
        id: 1,
        question: "How long have you been using Angular 2/4+?", 
        number_of_retakes: 5,  
        answerDuration: 3, 
      },
      {
        id: 2,
        question:  "What is JavaScript and ES6",
        number_of_retakes: 5,  
        answerDuration: 3, 
      },
      {
        id: 3,
        question:"Are you available for full-time or part-time?",  
        number_of_retakes: 5,  
        answerDuration: 3, 
      },
      
    ],
    status: "Pending"
  },

  {
    id: 1002,  
    company: "Shell IT/Dept",  
    template_title: "Business Interview",
    date_invited: new Date("August 1, 2022"),  
    interview_questions: [
      {
        id: 1,
        question: "Does your business give back to your community??", 
        number_of_retakes: 5,  
        answerDuration: 3, 
      },

      {
        id: 2,
        question: "What kind of corporation is your business?",
        number_of_retakes: 5,  
        answerDuration: 3, 
      },
      {
        id: 3,
        question:"Which qualities do you look for in new employees?", 
        number_of_retakes: 5,  
        answerDuration: 3, 
      },
    ],
    status: "Pending"
  },

  {
    id: 1003,  
    company: "119 Tech Provider",  
    template_title: "Backend Developer Interview",
    date_invited: new Date("August 1, 2022"),   
    interview_questions: [
      {
        id: 1,
        question: "Which technical skills do backend developers need to have?", 
        number_of_retakes: 5,  
        answerDuration: 3, 
      },
      {
        id: 2,
        question: "Which soft skills do backend developers need to be successful?",
        number_of_retakes: 5,  
        answerDuration: 3, 
      },
      {
        id: 3,
        question:"Name the main backend development responsibilities you had in your previous role.",
        number_of_retakes: 5,  
        answerDuration: 3, 
      },
      
    ],
    status: "Answered"
  },
];




export {
  displayedColumns,
  selectedColumns,
  interviewLists
}