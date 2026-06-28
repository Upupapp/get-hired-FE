import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token = localStorage.getItem("token");

        if (token) {
            const headers: Record<string, string> = {
                "Authorization": token,
                "content-language": "en",
            };
            // Don't set Content-Type for FormData — browser sets it automatically
            // with the correct multipart boundary. Overriding it breaks file uploads.
            if (!(request.body instanceof FormData)) {
                headers["Content-Type"] = "application/json";
            }
            request = request.clone({ setHeaders: headers });
        }

        return next.handle(request);
    }
}
