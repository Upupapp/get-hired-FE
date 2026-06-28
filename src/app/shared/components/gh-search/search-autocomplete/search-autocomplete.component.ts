import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, NgZone
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { SearchService, AutocompleteSuggestion } from '@app-core/services/search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-autocomplete',
  templateUrl: './search-autocomplete.component.html',
  styleUrls: ['./search-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchAutocompleteComponent implements OnInit, OnDestroy {
  @Input() initialQuery = '';
  @Input() placeholder = 'Search jobs, companies, skills, or locations';
  @Input() scope: 'jobs' | 'companies' | 'all' = 'all';
  @Output() searchSubmit = new EventEmitter<string>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  query = '';
  suggestions: AutocompleteSuggestion[] = [];
  isOpen = false;
  isLoading = false;
  activeIndex = -1;

  private query$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private searchService: SearchService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    this.query = this.initialQuery || '';

    this.query$.pipe(
      debounceTime(220),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q || q.trim().length < 2) {
          this.suggestions = [];
          this.isOpen = false;
          this.isLoading = false;
          this.cd.markForCheck();
          return [];
        }
        this.isLoading = true;
        this.cd.markForCheck();
        return this.searchService.autocomplete(q);
      }),
      takeUntil(this.destroy$),
    ).subscribe((res: any) => {
      if (res && res.suggestions) {
        this.suggestions = res.suggestions;
        this.isOpen = this.suggestions.length > 0;
      } else {
        this.suggestions = [];
        this.isOpen = false;
      }
      this.isLoading = false;
      this.activeIndex = -1;
      this.cd.markForCheck();
    });
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.query = val;
    this.activeIndex = -1;
    this.query$.next(val);
  }

  onKeydown(event: KeyboardEvent) {
    if (!this.isOpen) {
      if (event.key === 'Enter') this.submitSearch();
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = Math.min(this.activeIndex + 1, this.suggestions.length - 1);
        this.cd.markForCheck();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, -1);
        this.cd.markForCheck();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0 && this.suggestions[this.activeIndex]) {
          this.selectSuggestion(this.suggestions[this.activeIndex]);
        } else {
          this.submitSearch();
        }
        break;
      case 'Escape':
        this.closePanel();
        break;
      case 'Tab':
        this.closePanel();
        break;
    }
  }

  selectSuggestion(suggestion: AutocompleteSuggestion) {
    if (suggestion.type === 'job_title' || suggestion.type === 'location') {
      this.query = suggestion.label;
      this.searchSubmit.emit(suggestion.label);
    }
    this.closePanel();
    this.router.navigateByUrl(suggestion.url);
  }

  submitSearch() {
    this.closePanel();
    const q = this.query.trim();
    this.searchSubmit.emit(q);
    this.router.navigate(['/jobs'], { queryParams: q ? { q } : {} });
  }

  clearSearch() {
    this.query = '';
    this.suggestions = [];
    this.isOpen = false;
    this.activeIndex = -1;
    this.cd.markForCheck();
    if (this.searchInput) this.searchInput.nativeElement.focus();
  }

  closePanel() {
    this.isOpen = false;
    this.activeIndex = -1;
    this.cd.markForCheck();
  }

  onBlur() {
    // Delay to allow click on suggestion to register
    setTimeout(() => this.closePanel(), 180);
  }

  trackBySuggestion(_: number, s: AutocompleteSuggestion) {
    return s.type + s.label;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
