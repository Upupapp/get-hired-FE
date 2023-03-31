export interface Subs {
  subscriptionId: number;
  jobPost: number;
  admin: number;
  videoResponse: number;
  withCustomerCare: boolean;
  price: number;
  priceCurrency: string;
  subscriptionName: string;
  paymentOccurence: string;
}

export interface CompanySubscriptions {
  companyId: string;
  createdAt: Date;
  isPaid: boolean;
  paymentDate: Date;
  subscriptionId: number;
  jobPost: number;
  jobPostCount:number;
  admin: number;
  adminCount: number;
  videoResponse: number;
  videoResponseCount: number;
  withCustomerCare: boolean;
  price: number;
  priceCurrency: string;
  subscriptionName: string;
  paymentOccurence: string;
  endAt: Date;
}
