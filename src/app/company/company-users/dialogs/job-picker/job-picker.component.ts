import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CompanyService } from '../../../company.service';
import * as TeamModel from '../../../team-access.model';

@Component({
  selector: 'app-job-picker',
  templateUrl: './job-picker.component.html',
  styleUrls: ['./job-picker.component.scss']
})
export class JobPickerComponent implements OnInit, OnChanges {
  @Input() selectedJobIds: string[] = [];
  @Output() selectedJobIdsChange = new EventEmitter<string[]>();

  jobs: TeamModel.AssignableJob[] = [];
  filteredJobs: TeamModel.AssignableJob[] = [];
  loading = true;
  searchTerm = '';

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.companyService.getAssignableJobs().subscribe({
      next: (res: any) => {
        this.jobs = res && res.data ? res.data : [];
        this.filteredJobs = this.jobs;
        this.loading = false;
      },
      error: () => {
        this.jobs = [];
        this.filteredJobs = [];
        this.loading = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // no-op: selectedJobIds is driven by the parent form; this component
    // only reflects it, it doesn't own the source of truth.
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    const q = (term || '').trim().toLowerCase();
    this.filteredJobs = q
      ? this.jobs.filter(j => j.jobTitle.toLowerCase().includes(q))
      : this.jobs;
  }

  isSelected(jobId: string): boolean {
    return this.selectedJobIds.indexOf(jobId) !== -1;
  }

  toggle(jobId: string): void {
    const next = this.isSelected(jobId)
      ? this.selectedJobIds.filter(id => id !== jobId)
      : [...this.selectedJobIds, jobId];
    this.selectedJobIdsChange.emit(next);
  }

  remove(jobId: string): void {
    this.selectedJobIdsChange.emit(this.selectedJobIds.filter(id => id !== jobId));
  }

  jobTitleFor(jobId: string): string {
    const job = this.jobs.find(j => j.jobId === jobId);
    return job ? job.jobTitle : jobId;
  }
}
