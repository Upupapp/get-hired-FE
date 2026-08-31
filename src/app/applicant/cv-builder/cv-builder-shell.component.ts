import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HapticFeedbackService } from '@app-shared/services/haptic-feedback/haptic-feedback.service';
import { CvBuilderService } from './cv-builder.service';

type CvBuilderTab = 'overview' | 'upload' | 'history' | 'privacy'
  | 'cv-health' | 'surgical-review' | 'match-explorer' | 'action-plan';

interface CurrentCv {
  id: string;
  filename: string;
  fileurl: string;
  size?: number;
  type?: string;
  created_at: string;
}

interface CvVersion extends CurrentCv {
  isActive: boolean;
}

// CV Builder & Match Coach, Phase B: each still-unimplemented tab explains
// its own real purpose and the actual missing prerequisite -- replaces the
// single shared "isn't ready yet" placeholder every one of these used to
// route to. All four need the same missing capability (parsing an
// uploaded CV file into structured/analyzable text) that doesn't exist
// anywhere in this codebase -- a real, separate backend effort (a
// text-extraction + analysis engine), not something fakeable from the
// frontend alone. Recorded in get-hired-BE/notes.md.
interface UnavailableTabCopy {
  tab: CvBuilderTab;
  label: string;
  heading: string;
  body: string;
}

const UNAVAILABLE_TABS: UnavailableTabCopy[] = [
  {
    tab: 'cv-health',
    label: 'CV Health',
    heading: 'CV Health needs a CV analysis engine we haven’t built yet',
    body: 'This will review structure, clarity, completeness, and presentation once your CV is uploaded, and show exactly what deserves attention. It needs the ability to actually read and understand your CV’s content, which this version of GetHired doesn’t have yet.',
  },
  {
    tab: 'surgical-review',
    label: 'Surgical Review',
    heading: 'Surgical Review needs the same CV analysis engine',
    body: 'This will offer line-by-line wording suggestions for specific sections of your CV, without changing the facts of your experience. It depends on the same not-yet-built CV analysis engine as CV Health.',
  },
  {
    tab: 'match-explorer',
    label: 'Match Explorer',
    heading: 'Match Explorer needs the same CV analysis engine, plus job comparison',
    body: 'This will compare your CV against a specific job’s requirements and show which ones your CV already evidences. It depends on the same not-yet-built CV analysis engine as CV Health.',
  },
  {
    tab: 'action-plan',
    label: 'Action Plan',
    heading: 'Action Plan aggregates findings from the other analysis tabs',
    body: 'This will turn CV Health, Surgical Review, and Match Explorer findings into one prioritized to-do list. Since none of those exist yet, there’s nothing real to aggregate here yet.',
  },
];

/**
 * CVCOACH (v2 Product OS) -- frontend shell at /user/profile/cv-builder.
 *
 * Honest by design. Real, working tabs: Overview, Upload CV, Versions /
 * History (Phase B -- see cv-builder.service.ts's new version endpoints),
 * and Privacy & Data Use. CV Health, Surgical Review, Match Explorer, and
 * Action Plan each show their own distinct explanation (UNAVAILABLE_TABS
 * above) rather than one generic placeholder -- all four genuinely need a
 * CV text-extraction/analysis engine that doesn't exist in this codebase.
 *
 * AUDIT FIX: GET /cv-builder/current has existed and worked server-side
 * the whole time, but nothing in the frontend ever called it -- Overview
 * unconditionally showed the "no CV yet" empty state even after a
 * successful upload, and there was no way to see your current CV's
 * filename/upload date anywhere in this UI. Loads it on init and after
 * every successful upload.
 */
@Component({
  selector: 'app-cv-builder-shell',
  templateUrl: './cv-builder-shell.component.html',
  styleUrls: ['./cv-builder-shell.component.scss'],
})
export class CvBuilderShellComponent implements OnInit {
  activeTab: CvBuilderTab = 'overview';
  uploading = false;
  uploadResult: { success: boolean; message: string } | null = null;
  currentCv: CurrentCv | null = null;
  loadingCurrentCv = true;

  readonly unavailableTabs = UNAVAILABLE_TABS;

  // Real CV Versioning (Phase B)
  versions: CvVersion[] = [];
  loadingVersions = false;
  versionActionInFlight: string | null = null;
  versionActionError: string | null = null;

  constructor(
    private router: Router,
    private haptics: HapticFeedbackService,
    private cvBuilderService: CvBuilderService,
  ) {}

  ngOnInit(): void {
    this.loadCurrentCv();
  }

  get currentUnavailableCopy(): UnavailableTabCopy | null {
    return this.unavailableTabs.find((t) => t.tab === this.activeTab) || null;
  }

  loadCurrentCv(): void {
    this.loadingCurrentCv = true;
    this.cvBuilderService.getCurrentCv().subscribe({
      next: (res: any) => {
        this.currentCv = res?.data || null;
        this.loadingCurrentCv = false;
      },
      error: () => {
        // Non-fatal: Overview just falls back to the "no CV yet" prompt,
        // same as a genuinely new applicant -- no error state needed for
        // a background read that isn't blocking any action.
        this.currentCv = null;
        this.loadingCurrentCv = false;
      },
    });
  }

  setTab(tab: CvBuilderTab): void {
    this.activeTab = tab;
    if (tab === 'history' && this.versions.length === 0) {
      this.loadVersions();
    }
  }

  loadVersions(): void {
    this.loadingVersions = true;
    this.versionActionError = null;
    this.cvBuilderService.getCvVersions().subscribe({
      next: (res: any) => {
        this.versions = res?.data || [];
        this.loadingVersions = false;
      },
      error: () => {
        this.versions = [];
        this.loadingVersions = false;
        this.versionActionError = "We couldn't load your CV versions. Please try again.";
      },
    });
  }

  activateVersion(version: CvVersion): void {
    if (version.isActive || this.versionActionInFlight) {
      return;
    }
    this.versionActionInFlight = version.id;
    this.versionActionError = null;
    this.cvBuilderService.activateCvVersion(version.id).subscribe({
      next: () => {
        this.versionActionInFlight = null;
        this.haptics.selection();
        this.loadVersions();
        this.loadCurrentCv();
      },
      error: (err) => {
        this.versionActionInFlight = null;
        this.versionActionError = err?.error?.message || "We couldn't switch your active CV. Please try again.";
      },
    });
  }

  deleteVersion(version: CvVersion): void {
    if (version.isActive || this.versionActionInFlight) {
      return;
    }
    this.versionActionInFlight = version.id;
    this.versionActionError = null;
    this.cvBuilderService.deleteCvVersion(version.id).subscribe({
      next: () => {
        this.versionActionInFlight = null;
        this.versions = this.versions.filter((v) => v.id !== version.id);
      },
      error: (err) => {
        this.versionActionInFlight = null;
        this.versionActionError = err?.error?.message || "We couldn't delete that CV version. Please try again.";
      },
    });
  }

  startUpload(): void {
    this.haptics.selection();
    this.activeTab = 'upload';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.uploading = true;
      this.uploadResult = null;
      this.cvBuilderService.uploadCv(reader.result as string, file.name).subscribe({
        next: (res: any) => {
          // CVCOACH re-run (Applicant Data Foundation v2): now genuinely
          // reachable -- the backend stores the file for real. Still
          // honest about what's NOT real yet: no extraction/analysis
          // happens, this just confirms the file was saved.
          this.uploading = false;
          this.uploadResult = { success: true, message: 'CV uploaded.' };
          // AUDIT FIX: reflect the newly-uploaded CV immediately -- the
          // upload response's `data` is the same saved-document shape
          // GET /cv-builder/current returns, so this updates Overview/
          // Upload right away instead of only on the next page load.
          if (res?.data) {
            this.currentCv = res.data;
          }
          // A successful upload just created a new version and demoted the
          // old active one -- force Versions/History to refetch instead of
          // showing a now-stale list next time it's opened.
          this.versions = [];
          this.haptics.uploadComplete();
        },
        error: (err) => {
          this.uploading = false;
          const body = err?.error;
          this.uploadResult = {
            success: false,
            // Always show the backend's own safe, structured message --
            // never the raw error object -- same rule as every other
            // error-handling surface built this session.
            message: body?.message || "We couldn't process that file right now.",
          };
        },
      });
    };
    reader.readAsDataURL(file);
  }

  goToProfile(): void {
    this.router.navigateByUrl('/user/profile/edit');
  }
}
