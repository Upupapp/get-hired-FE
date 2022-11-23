import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-preview-job-post-step',
  animations: [mainAnimations],
  templateUrl: './preview-job-post-step.component.html',
  styleUrls: ['./preview-job-post-step.component.scss']
})
export class PreviewJobPostStepComponent implements OnInit {
  @Input() jobPostData: any = {};
  
  public dragPosition = JSON.parse(sessionStorage.getItem('job-post-banner-position')) || {
    x: 0.25, y: -160
  }

  constructor() { }

  ngOnInit(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    //this.dragPosition.y = this.dragPosition.y - 160;
    
    console.log(/*this.jobPostData,*/ this.dragPosition)
  }

  // Update Drag position
  onDragEnded(event) {
    let element = event.source.getRootElement();
    let imageSourceFile = document.getElementById('banner-source-file');
    let boundingClientRect = element.getBoundingClientRect();
    let parentPosition = this.getPosition(element);
    let dragPosition = {x: 0, y: ((boundingClientRect.y) - (parentPosition.top))};

    // temporary save to local storage
    sessionStorage.setItem('job-post-banner-position', JSON.stringify(dragPosition))
    console.log(dragPosition, imageSourceFile?.scrollHeight)
  }

  getPosition(el) {
    let x = 0;
    let y = 0;
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: y, left: x };
  }

}
