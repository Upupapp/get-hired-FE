import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {
  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return localStorage.getItem(key);
    }
  };

  userRole: string;
  screenSize: number = 1600;

  constructor() { }

  ngOnInit(): void {
    this.screenSize = window.innerWidth;
    this.getUserRole();
  }

  async getUserRole(){
    this.userRole = await this.asyncLocalStorage.getItem('role') || null;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }
}
