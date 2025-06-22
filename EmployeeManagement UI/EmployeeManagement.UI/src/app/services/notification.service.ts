import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hubConnection: signalR.HubConnection | null = null;
  private taskAssignedSubject = new Subject<any>();
  private taskUpdatedSubject = new Subject<any>();
  private taskDeletedSubject = new Subject<any>();
  private performanceUpdatedSubject = new Subject<any>();

  taskAssigned$ = this.taskAssignedSubject.asObservable();
  taskUpdated$ = this.taskUpdatedSubject.asObservable();
  taskDeleted$ = this.taskDeletedSubject.asObservable();
  performanceUpdated$ = this.performanceUpdatedSubject.asObservable();

  startConnection(userId: string) {
    if (this.hubConnection) return;
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7035/notificationHub', {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('TaskAssigned', (data) => {
      this.taskAssignedSubject.next(data);
    });
    this.hubConnection.on('TaskUpdated', (data) => {
      this.taskUpdatedSubject.next(data);
    });
    this.hubConnection.on('TaskDeleted', (data) => {
      this.taskDeletedSubject.next(data);
    });
    this.hubConnection.on('PerformanceUpdated', (data) => {
      this.performanceUpdatedSubject.next(data);
    });

    this.hubConnection.start().then(() => {
      // Set user identifier for SignalR (if using UserId mapping)
      // Optionally, you can invoke a method to register the user
    }).catch(err => console.error('SignalR Connection Error:', err));
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
  }
} 