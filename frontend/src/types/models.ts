export type Role = 'admin' | 'user' | 'faculty' | 'student';

export type Department = 'CSE' | 'IT' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'BME' | 'CHEM';

export type AuthUser = {
  role: Role;
  name?: string;
  email?: string;
  department?: Department | string;
};

export type AdminCredentials = { email: string; password: string };
export type UserCredentials = { email: string; password: string };
export type StudentRegisterPayload = {
  id: string;
  name: string;
  email: string;
  password: string;
};
export type FacultyRegisterPayload = {
  id: string;
  facultyName: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type ExternalLinkType = 'googleform' | 'whatsapp' | 'telegram' | 'website' | 'other';

export type ExternalLink = {
  url: string;
  type: ExternalLinkType;
  label: string;
  required: boolean;
};

export type CustomFormFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file';

export type CustomFormField = {
  label: string;
  fieldType: CustomFormFieldType;
  required: boolean;
  options?: string[];
};

export type EventStatus = 'open' | 'closed' | 'postponed' | string;
export type EventType = 'common' | 'department';

export type Event = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  departments?: Department[];
  category: string;
  startDate: string;
  endDate?: string;
  eventDate?: string;
  time: string;
  venue: string;
  registrationDeadline?: string;
  maxSeats: number;
  isTeamEvent: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  isPaid: boolean;
  amount: number;
  paymentInfo?: string;
  posterUrl?: string;
  status: EventStatus;
  externalLink?: ExternalLink;
  customFormFields?: CustomFormField[];
};

export type AdminStats = {
  totalEvents: number;
  totalParticipants: number;
  departmentParticipation?: Array<{ department: string; count: number }>;
  topEvent?: string;
  engagementScore?: string;
};

export type RegistrationResponse = { label: string; answer: string };
export type RegistrationAttendanceStatus = 'present' | 'pending' | 'absent' | string;

export type Registration = {
  id: string;
  eventId: Event;
  userId?: AuthUser & { id?: string };
  attendanceStatus: RegistrationAttendanceStatus;
  responses?: RegistrationResponse[];
};

