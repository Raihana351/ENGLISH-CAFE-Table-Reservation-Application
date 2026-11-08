/**
 * ENGLISH CAFE – PRODUCTION GOOGLE APPS SCRIPT WEB APP
 * Backend Engine for Google Sheets Database, Concurrency Lock & Email Delivery
 * 
 * Instructions:
 * 1. Open Google Sheets -> Extensions -> Apps Script
 * 2. Replace all content in Code.gs with this script
 * 3. Click "Deploy" -> "New deployment"
 * 4. Select type: "Web app"
 * 5. Execute as: "Me" (your Google account)
 * 6. Who has access: "Anyone" (or "Anyone with Google account")
 * 7. Copy the Web App URL and paste it into the English Cafe Admin Settings
 */

const SHEET_NAMES = {
  BOOKINGS: 'BOOKINGS',
  TABLES: 'TABLES',
  SETTINGS: 'SETTINGS',
  BLOCKED_DATES: 'BLOCKED DATES'
};

const DEFAULT_TABLES = [
  { id: 'T01', name: 'Table 1 (Georgian Window)', capacity: 2, status: 'ACTIVE', canCombine: false, notes: 'Street view, couple table' },
  { id: 'T02', name: 'Table 2 (Georgian Window)', capacity: 2, status: 'ACTIVE', canCombine: false, notes: 'Street view, couple table' },
  { id: 'T03', name: 'Table 3 (Heritage Banquette)', capacity: 4, status: 'ACTIVE', canCombine: true, notes: 'Can combine with T04' },
  { id: 'T04', name: 'Table 4 (Heritage Banquette)', capacity: 4, status: 'ACTIVE', canCombine: true, notes: 'Can combine with T03' },
  { id: 'T05', name: 'Table 5 (Main Cafe Area)', capacity: 4, status: 'ACTIVE', canCombine: true, notes: 'Can combine with T06' },
  { id: 'T06', name: 'Table 6 (Main Cafe Area)', capacity: 4, status: 'ACTIVE', canCombine: true, notes: 'Can combine with T05' },
  { id: 'T07', name: 'Table 7 (Fireplace Alcove)', capacity: 6, status: 'ACTIVE', canCombine: false, notes: 'Near fireplace, family booth' },
  { id: 'T08', name: 'Table 8 (Garden View Booth)', capacity: 6, status: 'ACTIVE', canCombine: false, notes: 'Cozy booth, afternoon tea' },
  { id: 'T09', name: 'Table 9 (Library Corner)', capacity: 2, status: 'ACTIVE', canCombine: false, notes: 'Quiet reading / intimate corner' },
  { id: 'T10', name: 'Table 10 (Courtyard View)', capacity: 4, status: 'ACTIVE', canCombine: false, notes: 'Overlooks courtyard garden' }
];

const DEFAULT_SETTINGS = {
  OPENING_TIME: '08:00',
  CLOSING_TIME: '21:00',
  BOOKING_DURATION_MINUTES: '60',
  BUFFER_MINUTES: '15',
  SLOT_INTERVAL_MINUTES: '30',
  MAX_ADVANCE_DAYS: '60',
  CAFE_NAME: 'English Cafe',
  CAFE_ADDRESS: '14 Royal Crescent, Mayfair, London W1J 7PT',
  CAFE_PHONE: '+44 20 7946 0912'
};

/**
 * Handle GET Requests (Health check, Availability, Settings)
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'ping';
    const spreadsheetId = (e && e.parameter && e.parameter.spreadsheetId) || '';

    if (action === 'ping') {
      return jsonResponse({
        success: true,
        message: 'English Cafe Apps Script Web App is online and operational.',
        serverTime: new Date().toISOString()
      });
    }

    if (action === 'verifyConnection') {
      const result = verifySpreadsheetAccess(spreadsheetId);
      return jsonResponse(result);
    }

    if (action === 'getAvailability') {
      const date = e.parameter.date;
      const guests = parseInt(e.parameter.guests || '2', 10);
      const availability = calculateAvailability(spreadsheetId, date, guests);
      return jsonResponse({ success: true, availability: availability });
    }

    return jsonResponse({ success: false, error: 'Unknown GET action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handle POST Requests (Create Booking, Admin Operations, Initialization)
 */
function doPost(e) {
  try {
    let postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    }

    const action = postData.action || '';
    const spreadsheetId = postData.spreadsheetId || '';

    if (!spreadsheetId) {
      return jsonResponse({ success: false, error: 'Missing spreadsheetId parameter.' });
    }

    if (action === 'initialize') {
      const initResult = initializeSpreadsheet(spreadsheetId);
      return jsonResponse(initResult);
    }

    if (action === 'createBooking') {
      return handleCreateBookingWithLock(spreadsheetId, postData.booking);
    }

    if (action === 'cancelBooking') {
      return handleCancelBooking(spreadsheetId, postData.bookingId, postData.customerEmail, postData.reason);
    }

    if (action === 'modifyBooking') {
      return handleModifyBookingWithLock(spreadsheetId, postData.bookingId, postData.updates);
    }

    if (action === 'resendEmail') {
      return handleResendEmail(spreadsheetId, postData.bookingId);
    }

    return jsonResponse({ success: false, error: 'Unknown POST action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Helper to construct JSON HTTP Response with CORS headers
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Safe Spreadsheet Initialization (Non-destructive, Idempotent)
 */
function initializeSpreadsheet(spreadsheetId) {
  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    // 1. BOOKINGS Sheet
    let bookingsSheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);
    const bookingHeaders = [
      'Booking ID', 'Request ID', 'Customer Name', 'Customer Email', 'Customer Phone',
      'Booking Date', 'Start Time', 'End Time', 'Guest Count', 'Assigned Table IDs',
      'Special Requests', 'Booking Status', 'Created At', 'Updated At', 'Admin Notes', 'Email Status'
    ];
    if (!bookingsSheet) {
      bookingsSheet = ss.insertSheet(SHEET_NAMES.BOOKINGS);
      bookingsSheet.appendRow(bookingHeaders);
      formatHeaderRow(bookingsSheet);
    } else {
      ensureHeaders(bookingsSheet, bookingHeaders);
    }

    // 2. TABLES Sheet
    let tablesSheet = ss.getSheetByName(SHEET_NAMES.TABLES);
    const tableHeaders = ['Table ID', 'Table Name', 'Seating Capacity', 'Status', 'Can Combine', 'Notes'];
    if (!tablesSheet) {
      tablesSheet = ss.insertSheet(SHEET_NAMES.TABLES);
      tablesSheet.appendRow(tableHeaders);
      formatHeaderRow(tablesSheet);
      // Populate default tables
      DEFAULT_TABLES.forEach(function(tbl) {
        tablesSheet.appendRow([tbl.id, tbl.name, tbl.capacity, tbl.status, tbl.canCombine ? 'TRUE' : 'FALSE', tbl.notes]);
      });
    } else {
      ensureHeaders(tablesSheet, tableHeaders);
      if (tablesSheet.getLastRow() <= 1) {
        DEFAULT_TABLES.forEach(function(tbl) {
          tablesSheet.appendRow([tbl.id, tbl.name, tbl.capacity, tbl.status, tbl.canCombine ? 'TRUE' : 'FALSE', tbl.notes]);
        });
      }
    }

    // 3. SETTINGS Sheet
    let settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
    const settingsHeaders = ['Setting Key', 'Setting Value'];
    if (!settingsSheet) {
      settingsSheet = ss.insertSheet(SHEET_NAMES.SETTINGS);
      settingsSheet.appendRow(settingsHeaders);
      formatHeaderRow(settingsSheet);
      Object.keys(DEFAULT_SETTINGS).forEach(function(k) {
        settingsSheet.appendRow([k, DEFAULT_SETTINGS[k]]);
      });
    } else {
      ensureHeaders(settingsSheet, settingsHeaders);
      if (settingsSheet.getLastRow() <= 1) {
        Object.keys(DEFAULT_SETTINGS).forEach(function(k) {
          settingsSheet.appendRow([k, DEFAULT_SETTINGS[k]]);
        });
      }
    }

    // 4. BLOCKED DATES Sheet
    let blockedSheet = ss.getSheetByName(SHEET_NAMES.BLOCKED_DATES);
    const blockedHeaders = ['Block ID', 'Date', 'Start Time', 'End Time', 'Block Type', 'Table IDs', 'Reason', 'Created By'];
    if (!blockedSheet) {
      blockedSheet = ss.insertSheet(SHEET_NAMES.BLOCKED_DATES);
      blockedSheet.appendRow(blockedHeaders);
      formatHeaderRow(blockedSheet);
    } else {
      ensureHeaders(blockedSheet, blockedHeaders);
    }

    return {
      success: true,
      message: 'Spreadsheet successfully verified and initialized with required sheets and schemas.',
      sheetsCreatedOrVerified: [SHEET_NAMES.BOOKINGS, SHEET_NAMES.TABLES, SHEET_NAMES.SETTINGS, SHEET_NAMES.BLOCKED_DATES]
    };
  } catch (err) {
    return { success: false, error: 'Initialization error: ' + err.message };
  }
}

function formatHeaderRow(sheet) {
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground('#1B3B2B');
  range.setFontColor('#FFFFFF');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function ensureHeaders(sheet, expectedHeaders) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(expectedHeaders);
    formatHeaderRow(sheet);
    return;
  }
  const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const missing = [];
  expectedHeaders.forEach(function(h) {
    if (currentHeaders.indexOf(h) === -1) {
      missing.push(h);
    }
  });
  if (missing.length > 0) {
    missing.forEach(function(h) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
    });
    formatHeaderRow(sheet);
  }
}

/**
 * Strict Concurrency Booking Handler using Apps Script LockService
 */
function handleCreateBookingWithLock(spreadsheetId, bookingData) {
  const lock = LockService.getScriptLock();
  try {
    // 1. Acquire script lock (up to 30s)
    const hasLock = lock.tryLock(30000);
    if (!hasLock) {
      return jsonResponse({
        success: false,
        error: 'System is experiencing heavy booking traffic. Could not obtain concurrency lock. Please try again.'
      });
    }

    const ss = SpreadsheetApp.openById(spreadsheetId);
    const bookingsSheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);
    const tablesSheet = ss.getSheetByName(SHEET_NAMES.TABLES);
    const settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
    const blockedSheet = ss.getSheetByName(SHEET_NAMES.BLOCKED_DATES);

    if (!bookingsSheet || !tablesSheet) {
      return jsonResponse({ success: false, error: 'Spreadsheet has not been initialized yet.' });
    }

    // 2. Idempotency Check via requestId
    const requestId = bookingData.requestId || '';
    if (requestId) {
      const existingData = bookingsSheet.getDataRange().getValues();
      for (let i = 1; i < existingData.length; i++) {
        if (existingData[i][1] === requestId) {
          // Already created!
          return jsonResponse({
            success: true,
            idempotent: true,
            message: 'Booking was already successfully recorded.',
            bookingId: existingData[i][0],
            assignedTableIds: (existingData[i][9] || '').split(','),
            bookingStatus: existingData[i][11]
          });
        }
      }
    }

    // 3. Settings & Duration Calculation
    const settings = loadSettings(settingsSheet);
    const duration = parseInt(settings.BOOKING_DURATION_MINUTES || '60', 10);
    const buffer = parseInt(settings.BUFFER_MINUTES || '15', 10);

    const bookingDate = bookingData.bookingDate; // YYYY-MM-DD
    const startTime = bookingData.startTime;     // HH:mm
    const guestCount = parseInt(bookingData.guestCount, 10);
    const endTime = addMinutesToTimeString(startTime, duration);

    // Validate date not in past
    const todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (bookingDate < todayStr) {
      return jsonResponse({ success: false, error: 'Reservations cannot be made in the past.' });
    }

    // Check Operating Hours
    if (startTime < settings.OPENING_TIME || endTime > settings.CLOSING_TIME) {
      return jsonResponse({
        success: false,
        error: 'Requested time (' + startTime + ' - ' + endTime + ') is outside operating hours (' + settings.OPENING_TIME + ' - ' + settings.CLOSING_TIME + ').'
      });
    }

    // 4. Load Active Tables
    const tablesData = tablesSheet.getDataRange().getValues();
    const tables = [];
    for (let t = 1; t < tablesData.length; t++) {
      const row = tablesData[t];
      if (row[3] === 'ACTIVE') {
        tables.push({
          id: String(row[0]),
          name: String(row[1]),
          capacity: parseInt(row[2], 10),
          canCombine: String(row[4]).toUpperCase() === 'TRUE'
        });
      }
    }

    // 5. Check Blocked Dates
    const isDateBlocked = checkDateBlocked(blockedSheet, bookingDate, startTime, endTime);
    if (isDateBlocked) {
      return jsonResponse({ success: false, error: 'The requested date/time is unavailable due to a scheduled cafe closure.' });
    }

    // 6. Re-read Current Bookings & Detect Conflicts
    const bookingsData = bookingsSheet.getDataRange().getValues();
    const occupiedTableIds = {};

    for (let b = 1; b < bookingsData.length; b++) {
      const bRow = bookingsData[b];
      const bDate = Utilities.formatDate(new Date(bRow[5]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const bStart = String(bRow[6]);
      const bEnd = String(bRow[7]);
      const bStatus = String(bRow[11]);
      const bTables = String(bRow[9]).split(',');

      if (bDate === bookingDate && (bStatus === 'CONFIRMED' || bStatus === 'ARRIVED')) {
        // Table occupancy includes buffer: End time + buffer
        const bOccupiedEnd = addMinutesToTimeString(bEnd, buffer);
        const newOccupiedEnd = addMinutesToTimeString(endTime, buffer);

        // Strict Overlap Rule: Existing Start < New Occupied End AND Existing Occupied End > New Start
        if (bStart < newOccupiedEnd && bOccupiedEnd > startTime) {
          bTables.forEach(function(tid) {
            occupiedTableIds[tid.trim()] = true;
          });
        }
      }
    }

    // 7. Find Available Table or Valid Combination
    const availableTables = tables.filter(function(tbl) {
      return !occupiedTableIds[tbl.id];
    });

    let assignedTableIds = [];

    // First try single table that fits best (minimize wasted capacity)
    const fittingSingleTables = availableTables
      .filter(function(tbl) { return tbl.capacity >= guestCount; })
      .sort(function(a, b) { return a.capacity - b.capacity; });

    if (fittingSingleTables.length > 0) {
      assignedTableIds = [fittingSingleTables[0].id];
    } else {
      // If party size > single table capacity, check valid combinable tables
      const combinable = availableTables.filter(function(tbl) { return tbl.canCombine; });
      let combinedCapacity = 0;
      const candidates = [];
      for (let c = 0; c < combinable.length; c++) {
        candidates.push(combinable[c].id);
        combinedCapacity += combinable[c].capacity;
        if (combinedCapacity >= guestCount) {
          assignedTableIds = candidates;
          break;
        }
      }
    }

    if (assignedTableIds.length === 0) {
      return jsonResponse({
        success: false,
        error: 'No tables with capacity for ' + guestCount + ' guest(s) are available on ' + bookingDate + ' at ' + startTime + '.'
      });
    }

    // 8. Generate Unique Booking ID (e.g. EC-20261108-7291)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateCompact = bookingDate.replace(/-/g, '');
    const bookingId = 'EC-' + dateCompact + '-' + randomSuffix;
    const nowIso = new Date().toISOString();

    // 9. Save Reservation to Google Sheet
    const newRow = [
      bookingId,
      requestId,
      bookingData.customerName,
      bookingData.customerEmail,
      bookingData.customerPhone,
      bookingDate,
      startTime,
      endTime,
      guestCount,
      assignedTableIds.join(','),
      bookingData.specialRequests || '',
      'CONFIRMED',
      nowIso,
      nowIso,
      '',
      'PENDING'
    ];

    bookingsSheet.appendRow(newRow);

    // 10. Release Lock
    lock.releaseLock();

    // 11. Send Email Notifications (Outside critical lock section)
    const emailResult = sendBookingEmails(bookingId, bookingData, assignedTableIds, startTime, endTime, settings);
    
    // Update Email Status in Sheet
    updateBookingEmailStatus(bookingsSheet, bookingId, emailResult.success ? 'SENT' : 'FAILED', emailResult.error);

    return jsonResponse({
      success: true,
      bookingId: bookingId,
      bookingDate: bookingDate,
      startTime: startTime,
      endTime: endTime,
      guestCount: guestCount,
      assignedTableIds: assignedTableIds,
      bookingStatus: 'CONFIRMED',
      emailStatus: emailResult.success ? 'SENT' : 'FAILED',
      message: 'Reservation confirmed successfully!'
    });

  } catch (err) {
    if (lock) {
      try { lock.releaseLock(); } catch (e) {}
    }
    return jsonResponse({ success: false, error: 'Booking transaction failed: ' + err.toString() });
  }
}

/**
 * Calculate Available Time Slots for given Date and Guest Count
 */
function calculateAvailability(spreadsheetId, date, guests) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const tablesSheet = ss.getSheetByName(SHEET_NAMES.TABLES);
  const bookingsSheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);
  const settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  const blockedSheet = ss.getSheetByName(SHEET_NAMES.BLOCKED_DATES);

  const settings = loadSettings(settingsSheet);
  const duration = parseInt(settings.BOOKING_DURATION_MINUTES || '60', 10);
  const buffer = parseInt(settings.BUFFER_MINUTES || '15', 10);
  const interval = parseInt(settings.SLOT_INTERVAL_MINUTES || '30', 10);

  // Generate slots
  const slots = [];
  let current = timeStringToMinutes(settings.OPENING_TIME);
  const close = timeStringToMinutes(settings.CLOSING_TIME);

  while (current + duration <= close) {
    const slotStart = minutesToTimeString(current);
    const slotEnd = minutesToTimeString(current + duration);

    // Check availability
    const hasCapacity = checkSlotCapacity(tablesSheet, bookingsSheet, blockedSheet, date, slotStart, slotEnd, guests, buffer);
    slots.push({
      time: slotStart,
      endTime: slotEnd,
      available: hasCapacity
    });

    current += interval;
  }

  return slots;
}

function checkSlotCapacity(tablesSheet, bookingsSheet, blockedSheet, date, slotStart, slotEnd, guests, buffer) {
  // Check blocked
  if (checkDateBlocked(blockedSheet, date, slotStart, slotEnd)) {
    return false;
  }

  // Active tables
  const tData = tablesSheet.getDataRange().getValues();
  const tables = [];
  for (let t = 1; t < tData.length; t++) {
    if (tData[t][3] === 'ACTIVE') {
      tables.push({ id: String(tData[t][0]), capacity: parseInt(tData[t][2], 10), canCombine: String(tData[t][4]).toUpperCase() === 'TRUE' });
    }
  }

  // Booked tables
  const occupied = {};
  if (bookingsSheet) {
    const bData = bookingsSheet.getDataRange().getValues();
    const newOccupiedEnd = addMinutesToTimeString(slotEnd, buffer);

    for (let i = 1; i < bData.length; i++) {
      const bRow = bData[i];
      const bDate = Utilities.formatDate(new Date(bRow[5]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const bStatus = String(bRow[11]);
      if (bDate === date && (bStatus === 'CONFIRMED' || bStatus === 'ARRIVED')) {
        const bStart = String(bRow[6]);
        const bEnd = String(bRow[7]);
        const bOccupiedEnd = addMinutesToTimeString(bEnd, buffer);

        if (bStart < newOccupiedEnd && bOccupiedEnd > slotStart) {
          String(bRow[9]).split(',').forEach(function(tid) {
            occupied[tid.trim()] = true;
          });
        }
      }
    }
  }

  const freeTables = tables.filter(function(tbl) { return !occupied[tbl.id]; });

  // Can any single table hold party?
  if (freeTables.some(function(tbl) { return tbl.capacity >= guests; })) {
    return true;
  }

  // Can combined tables hold party?
  const combinableFree = freeTables.filter(function(tbl) { return tbl.canCombine; });
  const totalComb = combinableFree.reduce(function(acc, tbl) { return acc + tbl.capacity; }, 0);
  return totalComb >= guests;
}

/**
 * Send Customer & Admin Emails via Google Apps Script MailApp
 */
function sendBookingEmails(bookingId, bookingData, assignedTableIds, startTime, endTime, settings) {
  try {
    const cafeName = settings.CAFE_NAME || 'English Cafe';
    const cafeAddress = settings.CAFE_ADDRESS || '14 Royal Crescent, Mayfair, London';
    const cafePhone = settings.CAFE_PHONE || '+44 20 7946 0912';

    // 1. Customer Email
    const customerSubject = 'English Cafe – Your Reservation Confirmation [' + bookingId + ']';
    const customerHtml = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2C221E; background-color: #FDFBF7; padding: 32px; border: 1px solid #E8E2D2;">
        <h1 style="color: #1B3B2B; font-size: 26px; border-bottom: 2px solid #1B3B2B; padding-bottom: 12px; margin-top: 0;">ENGLISH CAFE</h1>
        <p style="font-size: 16px;">Dear ${bookingData.customerName},</p>
        <p style="font-size: 15px; line-height: 1.6;">Thank you for reserving a table with us. We take great pleasure in confirming your booking.</p>
        
        <div style="background-color: #F7F4EB; padding: 20px; border-left: 4px solid #1B3B2B; margin: 24px 0;">
          <table style="width: 100%; font-size: 14px; line-height: 1.8;">
            <tr><td><strong>Booking Reference:</strong></td><td>${bookingId}</td></tr>
            <tr><td><strong>Date:</strong></td><td>${bookingData.bookingDate}</td></tr>
            <tr><td><strong>Time:</strong></td><td>${startTime} – ${endTime}</td></tr>
            <tr><td><strong>Guests:</strong></td><td>${bookingData.guestCount} person(s)</td></tr>
            <tr><td><strong>Assigned Table:</strong></td><td>${assignedTableIds.join(', ')}</td></tr>
            ${bookingData.specialRequests ? `<tr><td><strong>Special Requests:</strong></td><td>${bookingData.specialRequests}</td></tr>` : ''}
          </table>
        </div>

        <p style="font-size: 14px; color: #666;">If your plans change or you need to modify your reservation, please contact us at least 2 hours in advance.</p>
        <hr style="border: 0; border-top: 1px solid #E8E2D2; margin: 24px 0;" />
        <p style="font-size: 13px; color: #777;">
          <strong>${cafeName}</strong><br/>
          ${cafeAddress}<br/>
          Telephone: ${cafePhone}
        </p>
      </div>
    `;

    MailApp.sendEmail({
      to: bookingData.customerEmail,
      subject: customerSubject,
      htmlBody: customerHtml
    });

    // 2. Admin Notification
    const adminEmail = settings.SENDER_EMAIL || Session.getActiveUser().getEmail();
    if (adminEmail) {
      const adminSubject = 'English Cafe – New Reservation [' + bookingId + ']';
      const adminHtml = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1B3B2B;">New Reservation Notification</h2>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Guest:</strong> ${bookingData.customerName} (${bookingData.customerEmail}, ${bookingData.customerPhone})</p>
          <p><strong>Date & Time:</strong> ${bookingData.bookingDate} at ${startTime} (Party of ${bookingData.guestCount})</p>
          <p><strong>Assigned Table(s):</strong> ${assignedTableIds.join(', ')}</p>
          <p><strong>Special Requests:</strong> ${bookingData.specialRequests || 'None'}</p>
        </div>
      `;
      MailApp.sendEmail({
        to: adminEmail,
        subject: adminSubject,
        htmlBody: adminHtml
      });
    }

    return { success: true };
  } catch (err) {
    Logger.log('MailApp error: ' + err.toString());
    return { success: false, error: err.toString() };
  }
}

function updateBookingEmailStatus(sheet, bookingId, status, errorMsg) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bookingId) {
      sheet.getRange(i + 1, 16).setValue(status);
      if (errorMsg) {
        const existingNotes = data[i][14] || '';
        sheet.getRange(i + 1, 15).setValue(existingNotes + ' [Email error: ' + errorMsg + ']');
      }
      break;
    }
  }
}

/**
 * Date / Time Utilities
 */
function addMinutesToTimeString(timeStr, minutesToAdd) {
  const total = timeStringToMinutes(timeStr) + minutesToAdd;
  return minutesToTimeString(total);
}

function timeStringToMinutes(timeStr) {
  const parts = String(timeStr).split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function minutesToTimeString(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hStr = hours < 10 ? '0' + hours : '' + hours;
  const mStr = minutes < 10 ? '0' + minutes : '' + minutes;
  return hStr + ':' + mStr;
}

function checkDateBlocked(blockedSheet, date, startTime, endTime) {
  if (!blockedSheet || blockedSheet.getLastRow() <= 1) return false;
  const data = blockedSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const bDate = Utilities.formatDate(new Date(data[i][1]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (bDate === date) {
      const type = data[i][4];
      if (type === 'FULL_DAY') return true;
      if (type === 'TIME_SLOT') {
        const bStart = data[i][2];
        const bEnd = data[i][3];
        if (bStart < endTime && bEnd > startTime) return true;
      }
    }
  }
  return false;
}

function loadSettings(settingsSheet) {
  const settings = Object.assign({}, DEFAULT_SETTINGS);
  if (!settingsSheet || settingsSheet.getLastRow() <= 1) return settings;
  const data = settingsSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      settings[String(data[i][0]).toUpperCase()] = String(data[i][1]);
    }
  }
  return settings;
}

function verifySpreadsheetAccess(spreadsheetId) {
  try {
    if (!spreadsheetId) {
      return { success: false, error: 'No Spreadsheet ID provided.' };
    }
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const title = ss.getName();
    const sheets = ss.getSheets().map(function(s) { return s.getName(); });
    return {
      success: true,
      spreadsheetTitle: title,
      sheetsPresent: sheets,
      authorizedUser: Session.getActiveUser().getEmail() || 'Current Authorized Identity',
      quotaRemaining: MailApp.getRemainingDailyQuota()
    };
  } catch (err) {
    return {
      success: false,
      error: 'Cannot access Google Spreadsheet (' + err.message + '). Check that the Spreadsheet ID is correct and shared with the authorized Google identity.'
    };
  }
}
