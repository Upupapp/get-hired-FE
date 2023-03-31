import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {

  subscriptionUrl = `${environment.api_url}/subscription`;

  constructor(
    private baseService: BaseService
  ) { }

  getAllSubscriptions() {
    return this.baseService.get(`${this.subscriptionUrl}/getallsubscription`)
  }

  getCompanySubscription(companyId: string){
    return this.baseService.get(`${this.subscriptionUrl}/getcompanysubscription?companyId=${companyId}`)
  }

}
