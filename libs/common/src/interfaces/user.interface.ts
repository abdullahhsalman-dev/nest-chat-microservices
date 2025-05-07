export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  isOnline: boolean;
  lastSeen: Date;
}
