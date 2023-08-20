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
  Interview,
  interviewLists
} from '../../utils/applicant-interview-model-interface';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DetailDialogComponent } from './components/detail-dialog/detail-dialog.component';

@Component({
  selector: 'app-interview-list',
  animations: [mainAnimations],
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.scss']
})
export class InterviewListComponent implements OnInit {
  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public routerUrl: any[] = [];
  public loading: boolean = true;
  public id;
  public displayedColumns: TableHeader[] = displayedColumns;
  public interviewLists: Interview[] = interviewLists;
  public listView: boolean = true;
  public selectedColumns: string[] = selectedColumns
  public searchSource: any = (el) => {
    return {
      id: el.id,
      full_name: el.full_name,
      email: el.email,
      address: el.address,
      interview_number: el.interview_number,
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
    setTimeout(() => this.loading = false, 1500);
  }

  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }


  viewMenu(event): void {
    let openDialog = this.dialog.open(DetailDialogComponent, {
      width: '34vw',
      data: event?.data,
    });

    openDialog
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        console.log(result);
        if (result) {
        }
      });
  }


  addInterviews(link?: any){
    this.router.navigate([`${link}`])
  }

}
