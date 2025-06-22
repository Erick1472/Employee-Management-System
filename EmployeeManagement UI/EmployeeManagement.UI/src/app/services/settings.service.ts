import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeneralSettings, SecuritySettings } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl = 'https://localhost:7035/api'; // Adjust base URL as per your backend

  constructor(private http: HttpClient) { }

  getGeneralSettings(): Observable<GeneralSettings> {
    // TODO: Implement API call to get general settings
    return this.http.get<GeneralSettings>(`${this.baseUrl}/settings/general`);
  }

  updateGeneralSettings(settings: GeneralSettings): Observable<GeneralSettings> {
    // TODO: Implement API call to update general settings
    return this.http.put<GeneralSettings>(`${this.baseUrl}/settings/general`, settings);
  }

  updatePassword(security: SecuritySettings): Observable<any> {
    // TODO: Implement API call to update password
    return this.http.put<any>(`${this.baseUrl}/settings/security/password`, security);
  }

  downloadBackup(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/system/backup`, { responseType: 'blob' });
  }

  downloadAuditLog(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/system/audit-log`, { responseType: 'blob' });
  }
} 