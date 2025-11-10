
import { Timestamp } from "firebase/firestore";

export interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  role: 'admin' | 'user';
}

export type PersonType = 'visitor' | 'contractor';

export interface Visitor {
  id?: string;
  type: PersonType;
  name: string;
  firstName: string;
  surname: string;
  email?: string;
  phone?: string;
  company: string;
  
  // Visitor specific
  visiting?: string; 
  visitType?: "office" | "site";
  consentGiven?: boolean;

  // Contractor specific
  personResponsible?: string; 
  inductionComplete?: boolean;
  inductionTimestamp?: Timestamp;
  inductionValid?: boolean;
  rulesAgreed?: boolean;

  // Common optional
  vehicleReg?: string;
  photoURL?: string | null;

  // Common required
  checkInTime: Timestamp;
  checkOutTime?: Timestamp | null;
  checkedOut: boolean;
}


// This is now redundant but kept for reference until all files are updated.
export interface Contractor {
  id?: string;
  name: string;
  firstName: string;
  surname: string;
  company: string;
  email: string;
  phone: string;
  vehicleReg?: string;
  personResponsible: string; // User ID or name
  photoURL?: string;
  inductionComplete: boolean;
  inductionTimestamp?: Timestamp;
  rulesAgreed: boolean;
  checkInTime: Timestamp;
  checkOutTime?: Timestamp | null;
  checkedOut: boolean;
}

export interface User {
  id?: string;
  uid: string;
  firstName: string;
  surname: string;
  displayName: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Employee {
  id?: string;
  firstName: string;
  surname: string;
  displayName: string;
  email: string;
}

export interface Company {
  id?: string;
  name: string;
  contact?: string;
  email?: string;
}

export interface AppSettings {
  id?: string;
  siteName: string;
  badgeLogoURL: string;
  emailNotifications: boolean;
}
