import { Component, OnInit } from '@angular/core';
import  { 
  displayedColumns,
  selectedColumns,
  TableHeader,
  Job,
  jobLists
} from '../../utils/job-list-model-interface'; 
import { mainAnimations } from '@app-shared/animations/main-animations';
import  { 
  Company,
  companyLists
} from '../../utils/company-list-model-interface'; 
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-company-details',
  animations: [mainAnimations],
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent implements OnInit {
  public latestjobs: Job[] = jobLists;
  public company: Company[] = companyLists;  
  public selectedCompany: Company;
  public companyName: any;

  constructor(private router: Router,  
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    this.companyName = this.route.snapshot.params['name'];
    this.selectedCompany = this.company.find(el => el?.name?.toLowerCase() == this.companyName?.toLowerCase());

    console.log(this.companyName, this.selectedCompany)
  }

}
