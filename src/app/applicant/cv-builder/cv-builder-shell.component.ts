import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HapticFeedbackService } from '@app-shared/services/haptic-feedback/haptic-feedback.service';
import { CvBuilderService } from './cv-builder.service';

type CvBuilderTab = 'overview' | 'upload' | 'privacy' | 'unavailable';

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
 */
@Component({
  selector: 'app-cv-builder-shell',
  templateUrl: './cv-builder-shell.component.html',
  styleUrls: ['./cv-builder-shell.component.scss'],
})
export class CvBuilderShellComponent {
  activeTab: CvBuilderTab = 'overview';
  uploading = false;
  uploadResult: { success: boolean; message: string } | null = null;

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
        next: () => {
          // CVCOACH re-run (Applicant Data Foundation v2): now genuinely
          // reachable -- the backend stores the file for real. Still
          // honest about what's NOT real yet: no extraction/analysis
          // happens, this just confirms the file was saved.
          this.uploading = false;
          this.uploadResult = { success: true, message: 'CV uploaded.' };
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
