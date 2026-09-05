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
  @Output() isValid = new EventEmitter<any>();

  addressFormGroup: FormGroup;

  constructor(
    private googleAddressService: GoogleAddressService,
    private formBuilder: FormBuilder
  ) {
    this.googleAddressService.apiLoaded();
  }

  ngOnInit(): void {
    this.addressFormGroup = this.formBuilder.group({
      address: [this.rawAddress ? this.rawAddress.address : null],
      state: [this.rawAddress ? this.rawAddress.state : null],
      country: [this.rawAddress ? this.rawAddress.country : null],
      addressOne: [this.rawAddress ? this.rawAddress.addressOne : null],
      town: [this.rawAddress ? this.rawAddress.town : null],
      city: [this.rawAddress ? this.rawAddress.city : null],
      zipcode: [this.rawAddress ? this.rawAddress.zipcode : null],
      mapUrl: [this.rawAddress ? this.rawAddress.mapUrl : null]
    });

    this.addressFormGroup.markAllAsTouched();

    this.addressFormGroup.statusChanges.subscribe(stat => {
      if(stat == 'VALID') {
        this.isValid.emit(true)
      }
    })

    // APP-015 fix: addressChange previously only emitted from the Google
    // Places `place_changed` listener (ngAfterViewInit below) -- a caller
    // relying solely on that event (as profile-basic-info.component.ts now
    // does, having removed its own duplicate plain Address/City/Country
    // fields) never saw a manually-typed edit to this widget's own
    // State/Country/Address 1/Town/City/Zip fields, since typing directly
    // into them never touched the search box's autocomplete listener at
    // all. Subscribing to the form's own valueChanges makes every edit --
    // autocomplete-selected or hand-typed -- reach the same output,
    // matching what a caller reasonably expects from an @Output() named
    // addressChange.
    this.addressFormGroup.valueChanges.subscribe(() => {
      this.addressChange.emit(this.addressFormGroup.value);
    });

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

    // if (this.rawAddress != '') {
    //   this.searchElementRef.nativeElement.focus()
    // }

    autocomplete.addListener('place_changed', () => {
      const result = autocomplete.getPlace();

      const state = this.googleAddressService.getState(result);
      const country = this.googleAddressService.getCountry(result);
      const addressOne = this.googleAddressService.getStreetNumber(result) + ' ' + this.googleAddressService.getStreet(result);
      const sublocal = this.googleAddressService.getTown(result);
      const neighborhood = this.googleAddressService.getNeighborhood(result);
      const town = sublocal ? sublocal : neighborhood;
      const city = this.googleAddressService.getLocality(result);
      const zipcode = this.googleAddressService.getPostCode(result);
      // BUGFIX: was `getPostCode(result)` -- a copy-paste mistake that put
      // the zip code into mapUrl too, so this field never actually held a
      // map link. getGoogleMapUrl() (place.url, Google's own real map link
      // for this result) already existed on the service, unused.
      const mapUrl = this.googleAddressService.getGoogleMapUrl(result);

      this.populateForm({
        state, country, addressOne, town, city, zipcode, mapUrl
      });

      this.addressChange.emit(this.addressFormGroup.value);
    });

    // APP-015 fix: emitEvent:false -- without it, this reset (pre-existing,
    // unrelated to the search-box's own value at this point) now also
    // fires the valueChanges subscription added above, synchronously
    // during Angular's initial change-detection pass. A caller whose
    // bound template expression depends on state that subscription
    // updates (e.g. profile-forms.component.html's Next button
    // [disabled]) then throws ExpressionChangedAfterItHasBeenCheckedError,
    // since this reset happens inside ngAfterViewInit, after that
    // expression was already checked once this cycle.
    this.addressFormGroup.get('address').reset(null, { emitEvent: false });

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

  get city_validators() {
    return this.addressFormGroup.get('city');
  }

  get country_validators() {
    return this.addressFormGroup.get('country');
  }

  get adressOne_validators() {
    return this.addressFormGroup.get('addressOne');
  }

}
