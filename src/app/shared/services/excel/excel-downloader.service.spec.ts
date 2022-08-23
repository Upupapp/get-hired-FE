import { TestBed } from '@angular/core/testing';

import { ExcelDownloaderService } from './excel-downloader.service';

describe('ExcelDownloaderService', () => {
  let service: ExcelDownloaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelDownloaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
