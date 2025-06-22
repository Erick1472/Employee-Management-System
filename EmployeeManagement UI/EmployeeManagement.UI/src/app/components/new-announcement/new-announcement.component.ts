import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageAnnouncementService } from '../../services/message-announcement.service';
import { Announcement } from '../../models/message-announcement.model';

@Component({
  selector: 'app-new-announcement',
  templateUrl: './new-announcement.component.html',
  styleUrls: ['./new-announcement.component.css']
})
export class NewAnnouncementComponent implements OnInit {
  announcementForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageAnnouncementService: MessageAnnouncementService
  ) {
    this.announcementForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  createAnnouncement(): void {
    if (this.announcementForm.valid) {
      const newAnnouncement: Announcement = {
        author: 'Admin', // This could be dynamically set from logged-in user
        date: new Date(),
        title: this.announcementForm.value.title,
        content: this.announcementForm.value.content
      };

      this.messageAnnouncementService.createAnnouncement(newAnnouncement).subscribe(
        (response: Announcement) => { // Explicitly typed response
          console.log('Announcement created successfully', response);
          alert('Announcement created successfully!');
          this.announcementForm.reset();
        },
        (error: any) => { // Explicitly typed error
          console.error('Error creating announcement', error);
          alert('Error creating announcement: ' + error.message);
        }
      );
    } else {
      alert('Please fill in all required fields.');
    }
  }

}