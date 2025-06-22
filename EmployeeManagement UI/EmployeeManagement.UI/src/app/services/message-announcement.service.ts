import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, Announcement } from '../models/message-announcement.model';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class MessageAnnouncementService {
  private baseUrl = 'https://localhost:7035'; // No trailing /api
  private hubConnection: signalR.HubConnection | null = null;

  constructor(private http: HttpClient) { }

  // SignalR connection for real-time updates
  startConnection() {
    if (this.hubConnection) return;
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7035/notificationHub') // Adjust to your backend
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected!'))
      .catch(err => console.error('SignalR Error:', err));
  }

  onMessageReceived(callback: (msg: Message) => void) {
    this.hubConnection?.on('ReceiveMessage', callback);
  }

  onAnnouncementReceived(callback: (ann: Announcement) => void) {
    this.hubConnection?.on('ReceiveAnnouncement', callback);
  }

  sendMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/api/message`, message);
  }

  createAnnouncement(announcement: Announcement): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.baseUrl}/api/announcement`, announcement);
  }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/api/message`);
  }

  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.baseUrl}/api/announcement`);
  }

  getMessagesByRecipient(email: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/api/message/recipient/${email}`);
  }
} 