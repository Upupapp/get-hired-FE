import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { BaseService } from '@main/core/services/base.service';
import { EmployerSubscriptionSummary } from './subscription.models';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionSummaryService {

  private apiUrl = `${environment.api_url}/recruiter/subscription-summary`;

  constructor(private baseService: BaseService) {}

  getSummary(): Observable<EmployerSubscriptionSummary> {
    return this.baseService.get<any>(this.apiUrl).pipe(
      map((res: any) => res && res.data ? res.data : res),
      catchError(err => throwError(err))
    );
  }
}
