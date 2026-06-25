import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SeoService } from '@app-core/services/seo.service';

@Component({
  selector: 'app-error-not-found',
  templateUrl: './error-not-found.component.html',
  styleUrls: ['./error-not-found.component.scss']
})
export class ErrorNotFoundComponent implements OnInit {

  constructor(
    private location: Location,
    private router: Router,
    private seoService: SeoService,
  ) { }

  ngOnInit(): void {
    // SEO Phase 5 + 18: 404 must be noindex; has useful links home and to jobs.
    this.seoService.setPageMeta({
      title: 'Page Not Found | GetHired Online',
      description: 'The page you are looking for could not be found. Browse available jobs or return to the GetHired Online homepage.',
      robots: 'noindex, follow',
    });
  }

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  goToJobs(): void {
    this.router.navigateByUrl('/jobs');
  }

}
