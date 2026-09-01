import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  RecruiterInterviewHubService,
  InterviewHubItem,
} from './recruiter-interview-hub.service';

type FilterKey = 'all' | 'has-video' | 'review-stage';

interface FilterOption {
  key: FilterKey;
  label: string;
}

/**
 * B03: RecruiterInterviewHubComponent
 * Replaces <app-under-construction> at /recruiter/interview.
 *
 * Displays a company-scoped list of applicants with interview activity:
 *   - applicants who submitted video answers
 *   - applicants in any application status
 *
 * No scheduling, no AI claims, no fake counts, no fake urgency.
 * All data is real and company-scoped by the backend.
 */
@Component({
  selector: 'app-recruiter-interview-hub',
  templateUrl: './recruiter-interview-hub.component.html',
  styleUrls: ['./recruiter-interview-hub.component.scss'],
})
export class RecruiterInterviewHubComponent implements OnInit, OnDestroy {
  items: InterviewHubItem[] = [];
  // OPTIMIZE QA11: cache filtered results so the template *ngFor does not
  // call getFilteredItems() on every change-detection cycle (O(200) per tick).
  filteredItems: InterviewHubItem[] = [];
  loading = true;
  error = false;
  activeFilter: FilterKey = 'all';

  readonly filters: FilterOption[] = [
    { key: 'all', label: 'All applicants' },
    { key: 'has-video', label: 'Video answers' },
    { key: 'review-stage', label: 'Under review' },
  ];

  private sub: Subscription | null = null;

  constructor(private hubService: RecruiterInterviewHubService) {}

  ngOnInit(): void {
    this.loadHub();
  }

  loadHub(): void {
    this.loading = true;
    this.error = false;
    this.sub = this.hubService.getInterviewHub().subscribe({
      next: (res) => {
        this.items = res.items || [];
        this._applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  retry(): void {
    this.loadHub();
  }

  setFilter(key: FilterKey): void {
    this.activeFilter = key;
    this._applyFilter();
  }

  /** Recompute filteredItems. Called on data load and filter change only. */
  private _applyFilter(): void {
    switch (this.activeFilter) {
      case 'has-video':
        this.filteredItems = this.items.filter((i) => i.hasVideoAnswers);
        break;
      case 'review-stage':
        // applicationStatusId === 3 = "Under Review" (set when video answers present)
        this.filteredItems = this.items.filter((i) => i.applicationStatusId === 3);
        break;
      default:
        this.filteredItems = this.items;
    }
  }

  /** @deprecated Use filteredItems property in template instead. Kept for backward compat. */
  getFilteredItems(): InterviewHubItem[] {
    return this.filteredItems;
  }

  /** Returns the correct candidate detail route for this application. */
  getCandidateRoute(item: InterviewHubItem): string[] {
    return ['/recruiter/contacts/candidate-list', item.jobId];
  }

  /** Returns the job applicants route for drilling into video review. */
  getVideoReviewRoute(item: InterviewHubItem): string[] {
    return ['/recruiter/contacts/candidate-list', item.jobId];
  }

  /** Deep-link query params for "Review responses" -- candidate-list.component.ts
   *  reads applicantId to load this specific applicant automatically (instead
   *  of landing on the generic table and requiring a manual re-click), and
   *  openAnswers to open the video review modal straight onto their first
   *  answer. */
  getVideoReviewQueryParams(item: InterviewHubItem): { applicantId: string; openAnswers: string } {
    return { applicantId: item.applicantId, openAnswers: '1' };
  }

  getDisplayName(item: InterviewHubItem): string {
    return item.applicantName || item.applicantEmail || 'Applicant';
  }

  get videoAnswerCount(): number {
    return this.items.filter((i) => i.hasVideoAnswers).length;
  }

  trackByApplicationId(_: number, item: InterviewHubItem): string {
    return item.applicationId;
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
