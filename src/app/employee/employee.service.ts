import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";
import { of } from "rxjs";
import * as Model from "./employee.model";

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  employerUrl = `${environment.api_url}/employer`;

  constructor(
    private baseService: BaseService
  ) { }

  getEmployeeCompany(userId: string){
    return this.baseService.get<Model.Employee>(`${this.employerUrl}/company?id=${userId}`);
  }

  getEmployeeProfile(id: string){
    return this.baseService.get<Model.Employee>(`${this.employerUrl}/profile?id=${id}`);
  }

}
