import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageAnnouncementService } from '../../services/message-announcement.service';
import { Message } from '../../models/message-announcement.model';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.css']
})
export class NewMessageComponent implements OnInit {
  messageForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageAnnouncementService: MessageAnnouncementService
  ) {
    this.messageForm = this.fb.group({
      recipient: ['', Validators.required],
      subject: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  sendMessage(): void {
    if (this.messageForm.valid) {
      const newMessage: Message = {
        sender: 'Admin', // This could be dynamically set from logged-in user
        receiver: this.messageForm.value.recipient,
        subject: this.messageForm.value.subject,
        content: this.messageForm.value.content,
        time: new Date(),
        read: false
      };

      this.messageAnnouncementService.sendMessage(newMessage).subscribe(
        (response: Message) => { // Explicitly typed response
          console.log('Message sent successfully', response);
          alert('Message sent successfully!');
          this.messageForm.reset();
        },
        (error: any) => { // Explicitly typed error
          console.error('Error sending message', error);
          alert('Error sending message: ' + error.message);
        }
      );
    } else {
      alert('Please fill in all required fields.');
    }
  }

}