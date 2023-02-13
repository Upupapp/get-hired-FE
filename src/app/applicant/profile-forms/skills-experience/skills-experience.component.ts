import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-skills-experience',
  templateUrl: './skills-experience.component.html',
  styleUrls: ['./skills-experience.component.scss']
})
export class SkillsExperienceComponent implements OnInit {
  @Input() user: any;

  constructor() { }

  ngOnInit(): void {
  }

}
