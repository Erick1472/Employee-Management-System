export interface GeneralSettings {
  companyName: string;
  email: string;
  theme: string;
}

export interface SecuritySettings {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
} 