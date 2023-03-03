import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Host,
  Input,
  OnInit,
  Optional,
  Output,
  SkipSelf,
  ViewChild
} from '@angular/core';

import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

import { noop } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
//import { ViewImageVideoComponent } from '@app-shared/components/dialogs/view-image-video/view-image-video.component';
import {
  Subscription,
  Observable,
  forkJoin,
  combineLatest
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {
  select,
  Store
} from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DragAndDropComponent),
      multi: true
    }
  ],
  styleUrls: ['./drag-and-drop.component.scss']
})
export class DragAndDropComponent {
  public uploadedFile: any;
  public uploadedFileBase64: any;
  public fileType: string;
  private unsubscribe$ = new Subject<void>();

  @Input() multipleAttachmentTitle: string = 'Add an attachment';
  @Input() viewingOnly: boolean = false;
  @Input() label: string;
  @Input() required: any;
  @Input() disabled: boolean;
  @Input() formControlName: string;
  @Input() initialVal: string = '';
  @Input() labelTop: boolean = false;
  @Input() info: boolean = false;
  @Input() chips: boolean = true;
  @Input() infoTitle: string = 'Your title here';
  @Input() isDocument: boolean = false;
  @Input() acceptType: string = "image/*, video/mp4, video/x-m4v, video/*";
  @Input() supported: string = "";
  @Input() subtitle: string = '';
  @Input() fileArray: any[] = [];
  @Input() isMultiple: boolean;
  @Input() row: string = 'col-sm-6';
  @Input() file: any;
  @Input() maxSize: number = 200000;
  @Input() defaultImage: string = "assets/images/placeholder/job-post-banner.png";
  fileObject: any = {
    filename: '',
    size: '',
    type: '',
    file: ''
  }

  @Output() upload: EventEmitter<any> = new EventEmitter();
  @ViewChild('uploadFile') uploadInput: ElementRef;

  control: AbstractControl;
  isTouched: boolean = false;

  onChange: (value: any) => {};
  onTouched: () => {

  };

  @Output() keyevents: EventEmitter<any> = new EventEmitter<any>();
  protected _onChangeCallback: (_: any) => void = noop;

  constructor(
    private dialog: MatDialog,) { }

  registerOnTouched(fn: any) {
    this._onChangeCallback = fn;
  }

  registerOnChange(fn: any) {
    this._onChangeCallback = fn;
  }

  onTouch(event) {
    if (this.required && !event.target.value) {
      this.isTouched = true;
    } else {
      this.isTouched = false;
    }
  }

  writeValue(value: any) {
    this._onChangeCallback(value);
  }

  onFileChangeEvent(event: any, dropped = false): void {
    const uploaded = dropped ? event : event.target.files;
    if (uploaded.length !== 0) {
      this.uploadedFile = uploaded[0];
      this.fileObject.filename = uploaded[0].name;
      this.fileObject.type = uploaded[0].type;
      this.fileObject.size = uploaded[0].size
      const reader = new FileReader();
      reader.readAsDataURL(uploaded[0]);
      reader.onload = (_event) => {
        this.uploadedFileBase64 = reader.result;
        this.fileObject.file = reader.result;
        this.writeValue(this.fileObject);
        this.upload.emit(this.fileObject);
      }

      this.uploadInput.nativeElement.value = '';
    }
  }

  uploadMultiple(event: any, dropped = false) {
    const uploaded = dropped ? event : event.target.files;

    if (!this.isMultiple) {
      this.fileArray = [];
    }

    if (uploaded.length !== 0) {
      for (let i = 0; i < uploaded.length; i++) {

        let fileObject: any = {
          filename: '',
          size: '',
          type: '',
          file: ''
        }

        fileObject.filename = uploaded[i].name;
        fileObject.type = uploaded[i].type;
        fileObject.size = uploaded[i].size

        // if(uploaded[uploaded.length -1].size > this.maxSize) {
        //   console.log(uploaded[i].size)
        //   this.upload.emit([])
        //   break;
        // }

        const reader = new FileReader();
        reader.readAsDataURL(uploaded[i]);
        reader.onload = (_event) => {
          fileObject.file = reader.result;
          this.fileArray.push(fileObject)
          this.writeValue(this.fileArray);
          this.upload.emit(this.fileArray);

          console.log(this.fileArray)
        }
      }
    }
  }

  removeImage() {
    this.uploadedFile = "";
    this.fileType = "";
    this.uploadedFileBase64 = "";
    this.writeValue("");
    this.upload.emit("");
  }

  removeImageInArray(i) {
    this.fileArray.splice(i, 1)
    this.upload.emit(this.fileArray);
  }

  ngOnInit(): void {
    if (this.file) {
      this.uploadedFile = this.file[0];
      this.uploadedFile.name = this.file[0].filename;
    }

    console.log(this.dragPosition)
  }

  public dragPosition = JSON.parse(sessionStorage.getItem('job-post-banner-position')) || {
    x: 0, y: 0
  }

  // Update Drag position
  onDragEnded(event) {
    let element = event.source.getRootElement();
    let imageSourceFile = document.getElementById('image-source-file');
    let boundingClientRect = element.getBoundingClientRect();
    let parentPosition = this.getPosition(element);
    let dragPosition = { x: 0, y: ((imageSourceFile?.offsetHeight) - boundingClientRect?.y) + ((boundingClientRect.y) - (parentPosition.top)) };

    // temporary save to local storage
    sessionStorage.setItem('job-post-banner-position', JSON.stringify(dragPosition))
    console.log(dragPosition, imageSourceFile?.scrollHeight)
    //console.log('x: ' + (boundingClientRect.x - parentPosition.left), 'y: ' + (boundingClientRect.y - parentPosition.top));
  }

  getPosition(el) {
    let x = 0;
    let y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: y, left: x };
  }

  viewImageVideo(data: any) {
    /*let viewImageDialog = this.dialog.open(
      ViewImageVideoComponent,
      {
        width: '65vw',
        maxHeight: '95vh',
        data: data,
        panelClass: 'dialog-responsive'
      }
    );

    viewImageDialog
    .afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {

    });*/
  }

}
