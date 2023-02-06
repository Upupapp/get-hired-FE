import { Component, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { WorkExperienceComponent } from '../work-experience/work-experience.component';

@Component({
  selector: 'app-skills-and-exp',
  templateUrl: './skills-and-exp.component.html',
  styleUrls: ['./skills-and-exp.component.scss'],
  animations: [mainAnimations]
})
export class SkillsAndExpComponent implements OnInit {
  professionalSkills: FormArray;

  constructor(
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  addWorkExperience() {
    const ref = this.dialog.open(WorkExperienceComponent, {
      width: '70vw',
      data: {
        controlIndex: 1,
      }
    });
  }

  addItem(control, controlArray: FormArray) {
    // TODO
  }

  removeItem(index: number, controlArray: FormArray) {
    controlArray.removeAt(index);
  }
}
