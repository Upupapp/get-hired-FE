
export interface Inbox {
  id: any;
  job_id: any;  
  job_title_summary: string;
  read: boolean,  
  from: string;
  email_content: string;
  to: string;  
  date_sent: Date,  
  number_of_response: number;
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
  { col_name: 'job_id', title: 'Job ID' },
  { col_name: 'action', title: '' },
];

const selectedColumns: string[] =  [
  'job_id',
  'action'
];


 
const inboxItems: Inbox[] = [
  {
    id: 10023,  
    job_id: 3001,
    job_title_summary: "Web Designer / UX Designer / UI Designer / Figma Expert",
    date_sent: new Date(),  
    number_of_response: 5,
    read: false,  
    to: "jason_statham@gmail.com",  
    from: "SVG Asia inc.",  
    email_content: `<p>Hi there [Name],<br><br>I&rsquo;m emailing you today to let you know we have created a new [lead magnet type] called [lead magnet name].</p>

    <p>In this [lead magnet type], you&rsquo;ll learn how to create [describe what your lead magnet covers in 2 to 3 sentences].</p>

    <p>[Link]Click here to access the [lead magnet name] &rArr;[Link]</p>

    <p>If you know anybody else who&rsquo;ll find this useful, please forward the email to them.</p>

    <p>Let us know if you face any problems accessing the [lead magnet type] by replying to this email. We&rsquo;ll get back to you ASAP and ensure you gain access to it immediately.</p>

    <p>Thank you,</p>

    <p>[Your signature]</p>

    <p style="margin-left:95px">&nbsp;</p>
    `,
    status: 'Active'
  },

  {
    id: 10024,  
    job_id: 3001,
    job_title_summary: "Web Designer / UX Designer / UI Designer / Figma Expert",
    date_sent: new Date(),  
    number_of_response: 12,
    read: false,  
    to: "jason_statham@gmail.com",  
    from: "ICONS Jay Inc.",  
    email_content: `<p>Hi there [Name],<br><br>I&rsquo;m emailing you today to let you know we have created a new [lead magnet type] called [lead magnet name].</p>

        <p>In this [lead magnet type], you&rsquo;ll learn how to create [describe what your lead magnet covers in 2 to 3 sentences].</p>

        <p>[Link]Click here to access the [lead magnet name] &rArr;[Link]</p>

        <p>If you know anybody else who&rsquo;ll find this useful, please forward the email to them.</p>

        <p>Let us know if you face any problems accessing the [lead magnet type] by replying to this email. We&rsquo;ll get back to you ASAP and ensure you gain access to it immediately.</p>

        <p>Thank you,</p>

        <p>[Your signature]</p>

        <p style="margin-left:95px">&nbsp;</p>
        `,
    status: 'Active'
  },

  {
    id: 10025,  
    job_id: 3001,
    job_title_summary: "Web Designer / UX Designer / UI Designer / Figma Expert",
    date_sent: new Date(),  
    number_of_response: 10,
    read: true,  
    to: "jason_statham@gmail.com",  
    from: "Day4Night Inc.",  
    email_content: `<p>Hi there [Name],<br><br>I&rsquo;m emailing you today to let you know we have created a new [lead magnet type] called [lead magnet name].</p>

        <p>In this [lead magnet type], you&rsquo;ll learn how to create [describe what your lead magnet covers in 2 to 3 sentences].</p>

        <p>[Link]Click here to access the [lead magnet name] &rArr;[Link]</p>

        <p>If you know anybody else who&rsquo;ll find this useful, please forward the email to them.</p>

        <p>Let us know if you face any problems accessing the [lead magnet type] by replying to this email. We&rsquo;ll get back to you ASAP and ensure you gain access to it immediately.</p>

        <p>Thank you,</p>

        <p>[Your signature]</p>

        <p style="margin-left:95px">&nbsp;</p>
        `,
    status: 'Active'
  },

  {
    id: 10026,  
    job_id: 3001,
    job_title_summary: "Web Designer / UX Designer / UI Designer / Figma Expert",
    date_sent: new Date(),  
    number_of_response: 3,
    read: true,  
    to: "jason_statham@gmail.com",  
    from: "Spaty Jobs Inc.",  
    email_content: `<p>Hi there [Name],<br><br>I&rsquo;m emailing you today to let you know we have created a new [lead magnet type] called [lead magnet name].</p>

        <p>In this [lead magnet type], you&rsquo;ll learn how to create [describe what your lead magnet covers in 2 to 3 sentences].</p>

        <p>[Link]Click here to access the [lead magnet name] &rArr;[Link]</p>

        <p>If you know anybody else who&rsquo;ll find this useful, please forward the email to them.</p>

        <p>Let us know if you face any problems accessing the [lead magnet type] by replying to this email. We&rsquo;ll get back to you ASAP and ensure you gain access to it immediately.</p>

        <p>Thank you,</p>

        <p>[Your signature]</p>

        <p style="margin-left:95px">&nbsp;</p>
        `,
    status: 'Active'
  },
];




export {
  displayedColumns,
  selectedColumns,
  inboxItems
}