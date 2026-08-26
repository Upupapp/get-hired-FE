import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HapticFeedbackService } from '@app-shared/services/haptic-feedback/haptic-feedback.service';
import { CvBuilderService } from './cv-builder.service';

type CvBuilderTab = 'overview' | 'upload' | 'privacy' | 'unavailable';

interface CurrentCv {
  id: string;
  filename: string;
  fileurl: string;
  size?: number;
  type?: string;
  created_at: string;
}

/**
 * CVCOACH (v2 Product OS) -- frontend shell at /user/profile/cv-builder.
 *
 * Honest by design: Overview, Upload, and Privacy & Data Use are real,
 * working tabs (no fake data, no fake progress). CV Health, Surgical
 * Review, Match Explorer, Action Plan, and Versions/History all route to
 * a single shared "not available yet" tab rather than 5 separate empty
 * components -- every one of them needs the same missing applicant_cvs
 * schema that Upload's own backend honestly reports as unavailable. See
 * GETHIRED_CVCOACH_DATA_MODEL.md.
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

  readonly comingSoonTabs = [
    { id: 'cv-health', label: 'CV Health' },
    { id: 'surgical-review', label: 'Surgical Review' },
    { id: 'match-explorer', label: 'Match Explorer' },
    { id: 'action-plan', label: 'Action Plan' },
    { id: 'history', label: 'Versions / History' },
  ];

  constructor(
    private router: Router,
    private haptics: HapticFeedbackService,
    private cvBuilderService: CvBuilderService,
  ) {}

  ngOnInit(): void {
    this.loadCurrentCv();
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
