// Definice rolí přesně podle dokumentace [cite: 56]
export type UserRole = "Student" | "CEO" | "Guide" | "Head Admin";

export interface UserStatus {
  role: UserRole;
  priority: number;
  isVerified: boolean;
}

export interface GridProps {
  rooms: string[];
  selectedRoomId: string;
  userStatus: UserStatus;
  view?: string;
}