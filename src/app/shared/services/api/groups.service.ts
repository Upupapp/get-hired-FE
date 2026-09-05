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
        // QA10 FIX-14: removed ?companyId= query param — BE now derives
        // companyId from the JWT and ignores any caller-supplied param.
        return this.http.get<any>(`${this.server}/groups/list`).pipe(
          map((res) => <any[]>res.data),
          catchError(this.handleError)
        );
    }

    getContactGroupList(data: any): Observable<any> {
      // QA10 FIX-14: removed companyId query param — BE now derives from JWT.
      // groupName is still required for filtering.
      return this.http.get<any>(`${this.server}/groups/contactlist?groupName=${data.payload.groupName}`).pipe(
        map((res) => <any[]>res.data),
        catchError(this.handleError)
      );
    }

    addContactGroup(data:any){
      return this.http.post<any>(`${this.server}/groups/creategroup`, data);
    }

    deleteGroup(data: any): Observable<any> {
      return this.http.delete<any>(`${this.server}/groups/deletegroup?groupId=${data.group_id}`)
      .pipe(
        map((res) => <any>res),
        catchError(this.handleError)
      );
    }

    editGroup(data:any): Observable<any> {
      return this.http.put<any>(`${this.server}/groups/updategroup`, data).pipe(
        map((res: any) => <any>res.data),
        catchError(this.handleError)
      );
    }

    // GETHIRED_TALENT_CANDIDATE_GROUP_MEMBER_REMOVAL_V1: removes one
    // candidate from a group. Only deletes the group_list membership row —
    // the candidate/contact/applicant record is untouched.
    removeGroupMember(groupId: string, email: string): Observable<any> {
      return this.http.delete<any>(`${this.server}/groups/removemember?groupId=${encodeURIComponent(groupId)}&email=${encodeURIComponent(email)}`)
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