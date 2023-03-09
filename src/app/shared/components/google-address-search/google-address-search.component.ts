import { AfterViewInit, Input, Output, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoogleAddressService } from '@app-shared/services/api/google-address.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-google-address-search',
  templateUrl: './google-address-search.component.html',
  styleUrls: ['./google-address-search.component.scss']
})
export class GoogleAddressSearchComponent implements OnInit, AfterViewInit {
  @ViewChild('search') searchElementRef!: ElementRef;
  @Input() rawAddress: any;
  @Output() addressChange = new EventEmitter<any>();

  addressFormGroup: FormGroup;

  constructor(
    private googleAddressService: GoogleAddressService,
    private formBuilder: FormBuilder
  ) {
    this.googleAddressService.apiLoaded();
  }

  ngOnInit(): void {
    const {
      address,
      state,
      country,
      addressOne,
      town,
      city,
      zipcode,
      mapUrl
    } = this.rawAddress;

    this.addressFormGroup = this.formBuilder.group({
      address: [address],
      state: [state],
      country: [country, Validators.required],
      addressOne: [addressOne, Validators.required],
      town: [town],
      city: [city, Validators.required],
      zipcode: [zipcode],
      mapUrl: [mapUrl]
    })

  }

  ngAfterViewInit(): void {
    // Binding autocomplete to search input control



    let autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement,
      {

        componentRestrictions: { country: environment.mapRestrictions },
        fields: ["address_components", "url"],
        types: ["address"]
      }
    );

    if (this.rawAddress != '') {
      this.searchElementRef.nativeElement.focus()
    }

    autocomplete.addListener('place_changed', () => {
      const result = autocomplete.getPlace();
      console.log(result)

      const state = this.googleAddressService.getState(result);
      const country = this.googleAddressService.getCountry(result);
      const addressOne = this.googleAddressService.getStreetNumber(result) + ' ' + this.googleAddressService.getStreet(result);
      const sublocal = this.googleAddressService.getTown(result);
      const neighborhood = this.googleAddressService.getNeighborhood(result);
      const town = sublocal ? sublocal : neighborhood;
      const city = this.googleAddressService.getLocality(result);
      const zipcode = this.googleAddressService.getPostCode(result);
      const mapUrl = this.googleAddressService.getPostCode(result);

      this.populateForm({
        state, country, addressOne, town, city, zipcode, mapUrl
      });

      this.addressChange.emit(this.addressFormGroup.value);
    });

  }

  populateForm(rawAddress) {
    this.addressFormGroup.get('state').setValue(rawAddress.state);
    this.addressFormGroup.get('country').setValue(rawAddress.country);
    this.addressFormGroup.get('addressOne').setValue(rawAddress.addressOne);
    this.addressFormGroup.get('town').setValue(rawAddress.town);
    this.addressFormGroup.get('city').setValue(rawAddress.city);
    this.addressFormGroup.get('zipcode').setValue(rawAddress.zipcode);
    this.addressFormGroup.get('mapUrl').setValue(rawAddress.mapUrl);
  }

}
