import { Injectable } from '@angular/core';
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  videoBlob: Blob;

  get videoBlobRaw():Blob{
    return this.videoBlob;
  }
  set videoBlobRaw(blob: Blob){
    this.videoBlob = blob;
  }
}
