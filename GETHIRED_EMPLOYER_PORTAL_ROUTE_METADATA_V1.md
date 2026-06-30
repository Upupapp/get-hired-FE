# GETHIRED_EMPLOYER_PORTAL_ROUTE_METADATA_V1

Route metadata registry — implemented as TypeScript getters in `employer-panel.component.ts`.

| Route | Parent Label | Page Title | Subtitle |
|-------|-------------|------------|---------|
| /recruiter/dashboard | — | Dashboard | Track job activity, applicants, and hiring health. |
| /recruiter/jobs | — | Jobs | — |
| /recruiter/jobs/list | Jobs | Job Posts | Manage published, draft, and expired job posts. |
| /recruiter/jobs/expired | Jobs | Expired Jobs | Review closed or expired jobs for reference or reuse. |
| /recruiter/jobs/create | Jobs | Post a Job | Build and publish your job post step by step. |
| /recruiter/jobs/edit | Jobs | Edit Job | Update this job post and republish changes. |
| /recruiter/jobs/applicants | Jobs | Applicants | Review candidates who applied to this job. |
| /recruiter/jobs/view | Jobs | Job Preview | — |
| /recruiter/jobs/dashboard | Jobs | Job Overview | — |
| /recruiter/contacts | — | Candidates | — |
| /recruiter/contacts/list | Candidates | Contact List | Manage candidate contacts and outreach records. |
| /recruiter/contacts/candidates | Candidates | Applicants | Review all candidates who applied to your jobs. |
| /recruiter/contacts/candidate-list/:id | Candidates | Candidate Profile | Review this candidate's application and profile. |
| /recruiter/contacts/groups | Candidates | Contact Groups | Organise contacts into groups for hiring campaigns. |
| /recruiter/contacts/group-list/:id | Candidates | Contact Group | — |
| /recruiter/interview | Hiring Workspace | Interviews | Review interview activity and candidate video responses. |
| /recruiter/messages | Hiring Workspace | Messages | Manage candidate conversations across your jobs. |
| /recruiter/company/* | Company | Company | Manage your employer brand and public company profile. |
| /recruiter/subscription | Account | Subscription | Manage your GetHired plan and billing settings. |

## Primary Actions Per Route

| Route | Primary Action | Handler |
|-------|---------------|---------|
| /recruiter/jobs/list | Post a job | goToCreateJob() in topbar |
| /recruiter/jobs/expired | Post a job | goToCreateJob() in topbar |
| /recruiter/contacts/list | Add Contact | addContacts() in contact-list component |
| /recruiter/contacts/groups | Create Group | local button in contact-group component |
| /recruiter/contacts/candidates | Review applicants | table interaction |
| /recruiter/interview | Review applicants | ih-empty-actions > routerLink |
| /recruiter/messages | Review applicants | rm-empty-actions > goToApplicants() |

## Sidebar Sub-Routes (confirmed active)

Jobs:
- Job Posts → /recruiter/jobs/list
- Expired Jobs → /recruiter/jobs/expired

Candidates:
- Contact List → /recruiter/contacts/list
- Contact Group → /recruiter/contacts/groups
- Candidates → /recruiter/contacts/candidates

## Notes

- parentLabel returns '' for Dashboard (no eyebrow shown)
- pageSubtitle returns '' for Job Preview, Job Overview, Contact Group sub-routes (detail pages where global subtitle is not useful)
- Matching order in getters: most-specific sub-route first, then generic parent
