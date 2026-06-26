import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GroupState } from '@main/shared/store/reducers/group.reducer';
import { GroupActionTypes } from '@main/shared/store/actions/group.action';
import { StoreState } from '@main/shared/store/index';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-add-contact-group',
  templateUrl: './add-contact-group.component.html',
  styleUrls: ['./add-contact-group.component.scss'],
  animations: [mainAnimations]
})
export class AddContactGroupComponent implements OnInit {

  public contactGroupForm: FormGroup;
  public isLoading: boolean = false;
  public localData: any = localStorage.getItem('user');
  private groupData$: any;
  private req: Subscription = new Subscription;
  public loading: boolean = true;
  public groupContactList: any = {};
  public emailArray: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddContactGroupComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private groupState: Store<StoreState>
  ) { }

  ngOnInit(): void {
    this.localData = JSON.parse(this.localData);
    if(this.data){
      this.data.details.forEach(element => {
        this.emailArray.push(element.email)
      });
    }

    this.contactGroupForm = this.formBuilder.group({
      groupName: [this.data? this.data.group_name : '', [Validators.required]],
      emails: [this.data? this.emailArray : []]
    });
    this.getContactGrouptList();
    this.groupData$ = this.groupState.pipe(select(state => state.group));
    this.req = this.groupData$.subscribe((group: GroupState) => {
      this.loading = group.pending;
      this.isLoading = group.pending;
      if(group.contactGroupList){
        this.groupContactList = group.contactGroupList;
      }
      if(group.success) {
        this.contactGroupForm.reset();
        this.close();
      }

      if(group.editGroupRes) {
        this.contactGroupForm.reset();
        this.close();
      }
    });
  }

  close() {
    this.dialogRef.close(null);
  }

  submitForm() {
    if(!this.data){
      if(this.contactGroupForm.valid){
        this.isLoading = true;
        this.contactGroupForm.get("emails")?.patchValue(this.setContactEmail(this.contactGroupForm.controls['emails'].value));
        let data = {
          ...this.contactGroupForm.value,
          companyId:this.localData.companyId
        }

        this.groupState.dispatch({
          type: GroupActionTypes.SAVE_GROUP,
          payload: data
        });
      }
    } else {
      if(this.contactGroupForm.valid){
        this.isLoading = true;
        this.contactGroupForm.get("emails")?.patchValue(this.setContactEmail(this.contactGroupForm.controls['emails'].value));
        let data = {
          ...this.contactGroupForm.value,
          groupId: this.data?.group_id
        }

        this.groupState.dispatch({
          type: GroupActionTypes.EDIT_GROUP,
          payload: data
        });
      }
    }
  }

  setContactEmail(emails) {
    let emailList: any = [];
    if(emails && emails.length > 0) {
      emails.forEach(element => {
        emailList.push({email: element});
      });
      return emailList;
    }
    return [];
  }

  getContactGrouptList() {
    let data = {
      companyId:this.localData.companyId,
      groupName:""
    }
    this.groupState.dispatch({
      type: GroupActionTypes.GET_CONTACT_GROUP_LIST,
      payload: data
    });
  }

}
