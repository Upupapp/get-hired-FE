import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, filter, switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
    private server = environment.api_url;;
    constructor(private http: HttpClient) {}
  
    getGroupList(data: any): Observable<any> {
        return this.http.get<any>(`${this.server}/contacts/grouplist?companyId=${data.payload}`).pipe(
          map((res) => <any[]>res.data),
          catchError(this.handleError)
        );
    }

    // error handler
    private handleError(error: any, caught: any): any {
        throw error;
    }
}