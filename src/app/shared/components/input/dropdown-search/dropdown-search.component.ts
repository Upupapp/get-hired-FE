import { Component, EventEmitter, forwardRef, Host, Input, OnInit, Optional, Output, SkipSelf } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dropdown-search',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownSearchComponent),
      multi: true
    }
  ],
  templateUrl: './dropdown-search.component.html',
  styleUrls: ['./dropdown-search.component.scss']
})
export class DropdownSearchComponent implements OnInit {
  @Input() label: string;
  @Input() required: any;
  @Input() disabled: boolean;
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;
  @Input() formControlName: string;
  @Input() isMultiple:any;
  @Input() initialVal: any;
  @Input() options: any = [];
  @Input() info: boolean = false;
  @Input() labelTop: boolean = false;
  @Input() infoTitle: string = 'Your title here';
  @Input() isObjectValue: boolean = false;
  @Input() multiple: boolean = false;

  control: AbstractControl;

  onChange: (value: any) => {};
  onTouched: () => {};
  isTouched:boolean = false;

  @Output() keyevents: EventEmitter<any> = new EventEmitter<any>();

  public filterControl = new FormControl();
  public filteredOptions: Subscription;
  public optionSearch: any[];

  constructor(
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer,
  ) { 

  }
  

  onPanelClose() {
      this.filterControl.setValue('');
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  onTouch(){
    if(this.required && !this.initialVal){
      this.isTouched = true;
    } else {
      this.isTouched = false;
    }
  }

  writeValue(value: any) {
    this.initialVal = value;
    this.keyevents.emit(value);
    this.control.updateValueAndValidity();
  }

  onSelectionChange(event){
    this.initialVal = event.value;
    this.writeValue(event.value);
    this.onChange(event.value);
  }

  objectComparisonFunction = function( option, value ) : boolean {
    return this.isObjectValue ? option.id === value.id : option === value;
  }

  removeItem(index) {
    let object = { value: []};
    this.initialVal = this.initialVal.splice(index, 1);
    object.value = this.initialVal;
    this.onSelectionChange(object);
  }

  ngOnInit(): void {
    this.optionSearch = this.options;
    this.initialVal = this.isMultiple ? [] : "";
    this.control = this.formControlName ? this.controlContainer?.control.get(this.formControlName) : this.controlContainer?.control;
  
    // check subscription
    this.filteredOptions = this.filterControl.valueChanges
    .subscribe((value) => {
      this.optionSearch = [...this.options].filter(el => el?.toLocaleLowerCase().includes(value?.toLowerCase()));
    })
  }

  ngOnDestroy(): void {
    if(this.filteredOptions)
      this.filteredOptions.unsubscribe();
  }

}
