import { 
  Component, 
  OnInit, 
  OnDestroy
} from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  Subscription, 
} from 'rxjs';
import { 
  select, 
  Store 
} from '@ngrx/store';
import { 
  displayedColumns,
  selectedColumns,
  TableHeader,
  Contact,
  contactLists
} from './utils/contact-list-model-interface';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddContactComponent } from './dialogs/add-contact/add-contact.component';

@Component({
  selector: 'app-contact-list',
  animations: [mainAnimations],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit {

  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public routerUrl: any[] = [];
  public loading: boolean = true;
  public id;
  public displayedColumns: TableHeader[] = displayedColumns;
  public contactLists: Contact[] = contactLists;
  public listView: boolean = true;
  public selectedColumns: string[] = selectedColumns
  public searchSource: any = (el) => {
    return {
      id: el.id,
      full_name: el.full_name,
      email: el.email,
      address: el.address,
      contact_number: el.contact_number,
      company: el.company,
      code_number: el.code_number,
    };
  };
  public status: string[] = ["Initial Interview", "Technical Interview", "Contract Signing"];
  
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar) {

  }

  ngOnInit(): void {

    this.contactLists.forEach((el) => {
      el['salary'] = `₱${el?.expected_salary_min.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - ₱${el?.expected_salary_max.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
      el['full_name'] = `${el?.first_name} ${el.last_name}`;
    });

    setTimeout(() => this.loading = false, 1500);

  }


  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }


  viewMenu(event): void {
    
  }


  addContacts(){
    let openDialog = this.dialog.open(
      AddContactComponent,
      { 
        width: '34vw',
        data: event,
      }
    );

    openDialog
    .afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {

    });
  }

}
