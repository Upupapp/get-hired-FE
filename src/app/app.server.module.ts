import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    // TransferHttpCacheModule is imported in AppModule (shared) so Universal
    // HTTP responses (e.g. GET /job/details) transfer to the browser after SSR.
    AppModule,
    ServerModule,
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
