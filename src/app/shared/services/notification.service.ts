import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  linkRoute: string | null;
  linkQuery: Record<string, any> | null;
  relatedApplicationId: string | null;
  relatedJobId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResult {
  notifications: AppNotification[];
  unreadCount: number;
}

/**
 * Frontend for the notification bell/center backend
 * (controllers/notificationController.js, services/notification.service.js).
 * Mirrors message.service.ts's structure -- the backend always derives the
 * caller's identity server-side from the authenticated uid, never from
 * anything sent here.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.api_url}/notifications`;

  constructor(private baseService: BaseService) {}

  list(): Observable<NotificationListResult> {
    return this.baseService
      .get<any>(`${this.base}`)
      .pipe(map((res: any) => res?.data ?? { notifications: [], unreadCount: 0 }));
  }

  markRead(id: string): Observable<boolean> {
    return this.baseService
      .post<any>(`${this.base}/${id}/read`, {})
      .pipe(map((res: any) => !!res?.data?.found));
  }

  markAllRead(): Observable<number> {
    return this.baseService
      .post<any>(`${this.base}/read-all`, {})
      .pipe(map((res: any) => res?.data?.updatedCount ?? 0));
  }
}
