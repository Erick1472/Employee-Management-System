export interface Message {
  id?: string;
  sender: string;
  receiver: string;
  subject: string;
  content: string;
  time: Date;
  read: boolean;
}

export interface Announcement {
  id?: string;
  author: string;
  title: string;
  content: string;
  date: Date;
  read?: boolean;
} 