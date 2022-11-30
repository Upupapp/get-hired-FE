import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, Observable } from 'rxjs';

interface FileUpload {
  key: string;
  name: string;
  url: string;
  file: File;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private basePath = '/uploads';

  constructor(
    private storage: AngularFireStorage
  ) { }

  uploadFile(event) {
    const file = event.target.files[0];
    const filePath = 'name-your-file-path-here';
    const ref = this.storage.ref(filePath);
    const task = ref.put(file);
  }


}
