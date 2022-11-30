import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, filter, switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
    private server = environment.api_url;;
    constructor(private http: HttpClient) {}
  
    getContactList(data: any): Observable<any> {
        return this.http.get<any>(`${this.server}/contacts/list?companyId=${data.payload}`).pipe(
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

    AddContact(data:any): Observable<any> {
        return this.http.post<any>(`${this.server}/contacts/addcontact`, data).pipe(
          map((res: any) => <any>res.data),
          catchError(this.handleError)
        );
    }

    editContact(data:any): Observable<any> {
      return this.http.put<any>(`${this.server}/contacts/updatecontact`, data).pipe(
        map((res: any) => <any>res.data),
        catchError(this.handleError)
      );
    }
    
    AddMultipleContact(data:any): Observable<any> {
        return this.http.post<any>(`${this.server}/contacts/multiplecontact`, data).pipe(
          map((res: any) => <any>res.data),
          catchError(this.handleError)
        );
    }

    deleteContact(data: any): Observable<any> {
      return this.http.delete<any>(`${this.server}/contacts/deletecontact?contactId=${data.contact_id}`)
      .pipe(
        map((res) => <any>res),
        catchError(this.handleError)
      );
    }


    // error handler
    private handleError(error: any, caught: any): any {
        throw error;
    }
}