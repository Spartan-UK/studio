
import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  role: 'admin' | 'reception';
}

export interface Visitor {
  id?: string;
  name: string;
  firstName: string;
  surname: string;
  email?: string;
  phone?: string;
  company: string;
  visiting: string; // Employee ID or name
  visitType: "office" | "site";
  vehicleReg?: string;
  photoURL?: string | null;
  consentGiven: boolean;
  checkInTime: Timestamp;
  checkOutTime?: Timestamp | null;
  checkedOut: boolean;
}

export interface Contractor {
  id?: string;
  name: string;
  company: string;
  purpose: string;
  personResponsible: string; // Employee ID or name
  photoURL?: string;
  inductionComplete: boolean;
  rulesAgreed: boolean;
  checkInTime: number; // Unix timestamp
  checkOutTime?: number; // Unix timestamp
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
