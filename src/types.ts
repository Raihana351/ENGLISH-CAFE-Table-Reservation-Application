export interface Booking {
  bookingId: string;
  requestId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  guestCount: number;
  assignedTableIds: string[]; // e.g. ["T01"]
  specialRequests: string;
  bookingStatus: 'CONFIRMED' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  createdAt: string;   // ISO timestamp
  updatedAt: string;   // ISO timestamp
  adminNotes: string;
  emailStatus: 'SENT' | 'FAILED' | 'PENDING';
}

export interface Table {
  tableId: string;
  tableName: string;
  seatingCapacity: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'DISABLED';
  canCombine: boolean;
  notes: string;
}

export interface CafeSettings {
  spreadsheetId: string;
  senderEmail: string;
  serviceAccountEmail: string;
  appsScriptWebAppUrl: string;
  openingTime: string; // e.g. "08:00"
  closingTime: string; // e.g. "21:00"
  bookingDurationMinutes: number; // default 60
  bufferMinutes: number; // default 15
  slotIntervalMinutes: number; // default 30
  maxAdvanceDays: number; // default 60
  adminToken: string;
}

export interface BlockedDate {
  blockId: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm or empty for full day
  endTime?: string;   // HH:mm or empty for full day
  blockType: 'FULL_DAY' | 'TIME_SLOT' | 'TABLE_BLOCK';
  tableIds: string[]; // empty for all tables
  reason: string;
  createdBy: string;
}

export interface TimeSlotAvailability {
  time: string;
  available: boolean;
  remainingTables: number;
  reason?: string;
}

export interface BookingSubmissionRequest {
  requestId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  startTime: string;
  guestCount: number;
  specialRequests?: string;
}

export interface TestResultItem {
  id: number;
  name: string;
  description: string;
  status: 'PASSED' | 'FAILED' | 'RUNNING' | 'PENDING';
  message: string;
  details?: Record<string, unknown>;
  durationMs?: number;
}
