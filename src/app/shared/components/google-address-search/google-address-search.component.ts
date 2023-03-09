import { AfterViewInit, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { GoogleAddressService } from '@app-shared/services/api/google-address.service';

@Component({
  selector: 'app-google-address-search',
  templateUrl: './google-address-search.component.html',
  styleUrls: ['./google-address-search.component.scss']
})
export class GoogleAddressSearchComponent implements OnInit, AfterViewInit {
  @ViewChild('search') searchElementRef!: ElementRef;

  constructor(
    private googleAddressService: GoogleAddressService
  ) {
    this.googleAddressService.apiLoaded();
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    // Binding autocomplete to search input control
    let autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement
    );

    autocomplete.addListener('place_changed', () => {
      const result = autocomplete.getPlace();
      console.log(result)
    });
  }

}
