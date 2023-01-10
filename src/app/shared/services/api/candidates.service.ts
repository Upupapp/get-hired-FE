import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, filter, switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
    private server = environment.api_url;;
    constructor(private http: HttpClient) {}
  
    getCandidateList(data: any): Observable<any> {
        return this.http.get<any>(`${this.server}/candidates/list?companyId=${data.payload}`).pipe(
          map((res) => <any[]>res.data),
          catchError(this.handleError)
        );
    }

    getPublishedJob(data: any): Observable<any> {
      return this.http.get<any>(`${this.server}/job/published?id=${data.payload}`).pipe(
        map((res) => <any[]>res.data),
        catchError(this.handleError)
      );
    }

    AddCandidate(data:any): Observable<any> {
        return this.http.post<any>(`${this.server}/candidates/addcandidate`, data).pipe(
          map((res: any) => <any>res.data),
          catchError(this.handleError)
        );
    }
    
    AddMultipleCandidate(data:any): Observable<any> {
        return this.http.post<any>(`${this.server}/candidates/multiplecandidate`, data).pipe(
          map((res: any) => <any>res.data),
          catchError(this.handleError)
        );
    }

    UpdateCandidate(data:any): Observable<any> {
      return this.http.put<any>(`${this.server}/candidates/updatecandidate`, data).pipe(
        map((res: any) => <any>res.data),
        catchError(this.handleError)
    ); 
    }

    DeleteCandidate(data:any): Observable<any> {
      return this.http.delete<any>(`${this.server}/candidates/deletecandidate?candidateId=${data}`)
      .pipe(
        map((res: any) => <any>res),
        catchError(this.handleError)
      );
    }

    // error handler
    private handleError(error: any, caught: any): any {
        throw error;
    }
}