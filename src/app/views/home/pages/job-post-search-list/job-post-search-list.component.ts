import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-job-post-search-list',
  templateUrl: './job-post-search-list.component.html',
  styleUrls: ['./job-post-search-list.component.scss']
})
export class JobPostSearchListComponent implements OnInit {
  public searchJobPost: string = `Try adjusting your search or find what you’re looking for. <br> Note sure where to start? <a href="/job-post">Browse Job</a>.`
  
  constructor() { }

  ngOnInit(): void {
  }

}
