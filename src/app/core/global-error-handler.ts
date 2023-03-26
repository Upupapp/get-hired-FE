import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable, NgZone } from "@angular/core";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(
    private zone: NgZone
  ) { }

  handleError(error: any): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    if (chunkFailedMessage.test(error.message)) {
      if (confirm("New version available. Load New Version?")) {
        window.location.reload();
      }
    }
  }
}
