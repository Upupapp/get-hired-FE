import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private readonly isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // SSR (Node) has no localStorage — unguarded access throws and aborts
        // Universal HTTP (including public GET /job/details needed for job OG meta).
        // Anonymous requests must pass through unchanged on the server.
        let token: string | null = null;
        if (this.isBrowser) {
            try {
                token = localStorage.getItem("token");
            } catch {
                token = null;
            }
        }

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
