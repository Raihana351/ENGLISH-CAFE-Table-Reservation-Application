import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri?: string;
  project_id?: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export function loadServiceAccount(): ServiceAccountKey | null {
  try {
    const credPath = path.join(process.cwd(), 'data', 'service-account.json');
    if (fs.existsSync(credPath)) {
      const content = fs.readFileSync(credPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to read service account credentials:', err);
  }
  return null;
}

/**
 * Creates and signs a Google OAuth2 JWT for Service Account authentication (RS256)
 */
export async function getGoogleAccessToken(scopes = ['https://www.googleapis.com/auth/spreadsheets']): Promise<string> {
  const sa = loadServiceAccount();
  if (!sa || !sa.client_email || !sa.private_key) {
    throw new Error('Service account credentials not configured on server.');
  }

  // Return cached token if still valid (with 60s safety buffer)
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token;
  }

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const payload = {
    iss: sa.client_email,
    scope: scopes.join(' '),
    aud: sa.token_uri || 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64UrlEncode = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  sign.end();
  const signature = sign.sign(sa.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${unsignedToken}.${signature}`;

  // Exchange JWT for OAuth2 Access Token
  const tokenUri = sa.token_uri || 'https://oauth2.googleapis.com/token';
  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google OAuth2 token request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json() as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in
  };

  return data.access_token;
}

/**
 * Verifies live Google Spreadsheet access using the Service Account
 */
export async function verifySpreadsheetWithServiceAccount(spreadsheetId: string) {
  try {
    const accessToken = await getGoogleAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=false`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsedErr: any = null;
      try { parsedErr = JSON.parse(errText); } catch {}
      const errMsg = parsedErr?.error?.message || errText;
      return {
        success: false,
        error: `Google Sheets API error (${res.status}): ${errMsg}`,
        statusCode: res.status
      };
    }

    const data = await res.json() as { properties?: { title?: string }; sheets?: Array<{ properties?: { title?: string } }> };
    const sheetTitle = data.properties?.title || 'Google Sheet';
    const sheetNames = (data.sheets || []).map(s => s.properties?.title || '').filter(Boolean);

    return {
      success: true,
      title: sheetTitle,
      sheetNames,
      serviceAccountConnected: true
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: msg
    };
  }
}

/**
 * Safely initializes Google Spreadsheet worksheets via Google Sheets API (Approach B)
 */
export async function initializeGoogleSpreadsheetApi(spreadsheetId: string) {
  const accessToken = await getGoogleAccessToken();
  const verify = await verifySpreadsheetWithServiceAccount(spreadsheetId);
  if (!verify.success) {
    throw new Error(verify.error);
  }

  const existingSheets = verify.sheetNames || [];
  const requiredSheets = ['BOOKINGS', 'TABLES', 'SETTINGS', 'BLOCKED DATES'];
  const missingSheets = requiredSheets.filter(s => !existingSheets.includes(s));

  // 1. Add missing sheets
  if (missingSheets.length > 0) {
    const requests = missingSheets.map(title => ({
      addSheet: {
        properties: {
          title,
          gridProperties: {
            frozenRowCount: 1
          }
        }
      }
    }));

    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const batchRes = await fetch(batchUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    if (!batchRes.ok) {
      const errText = await batchRes.text();
      throw new Error(`Failed to create sheets in spreadsheet: ${errText}`);
    }
  }

  // 2. Set headers and default content for created sheets
  const valueUpdates: Array<{ range: string; values: string[][] }> = [];

  // BOOKINGS Headers
  valueUpdates.push({
    range: 'BOOKINGS!A1:P1',
    values: [[
      'Booking ID', 'Request ID', 'Customer Name', 'Customer Email', 'Customer Phone',
      'Booking Date', 'Start Time', 'End Time', 'Guest Count', 'Assigned Table IDs',
      'Special Requests', 'Booking Status', 'Created At', 'Updated At', 'Admin Notes', 'Email Status'
    ]]
  });

  // TABLES Headers and 10 default tables
  if (missingSheets.includes('TABLES')) {
    valueUpdates.push({
      range: 'TABLES!A1:F11',
      values: [
        ['Table ID', 'Table Name', 'Seating Capacity', 'Status', 'Can Combine', 'Notes'],
        ['T01', 'Table 1 (Georgian Window)', '2', 'ACTIVE', 'FALSE', 'Street view, couple table'],
        ['T02', 'Table 2 (Georgian Window)', '2', 'ACTIVE', 'FALSE', 'Street view, couple table'],
        ['T03', 'Table 3 (Heritage Banquette)', '4', 'ACTIVE', 'TRUE', 'Can combine with T04'],
        ['T04', 'Table 4 (Heritage Banquette)', '4', 'ACTIVE', 'TRUE', 'Can combine with T03'],
        ['T05', 'Table 5 (Main Cafe Area)', '4', 'ACTIVE', 'TRUE', 'Can combine with T06'],
        ['T06', 'Table 6 (Main Cafe Area)', '4', 'ACTIVE', 'TRUE', 'Can combine with T05'],
        ['T07', 'Table 7 (Fireplace Alcove)', '6', 'ACTIVE', 'FALSE', 'Near fireplace, family booth'],
        ['T08', 'Table 8 (Garden View Booth)', '6', 'ACTIVE', 'FALSE', 'Cozy booth, afternoon tea'],
        ['T09', 'Table 9 (Library Corner)', '2', 'ACTIVE', 'FALSE', 'Quiet reading corner'],
        ['T10', 'Table 10 (Courtyard View)', '4', 'ACTIVE', 'FALSE', 'Overlooks courtyard garden']
      ]
    });
  }

  // SETTINGS Headers and defaults
  if (missingSheets.includes('SETTINGS')) {
    valueUpdates.push({
      range: 'SETTINGS!A1:B10',
      values: [
        ['Setting Key', 'Setting Value'],
        ['OPENING_TIME', '08:00'],
        ['CLOSING_TIME', '21:00'],
        ['BOOKING_DURATION_MINUTES', '60'],
        ['BUFFER_MINUTES', '15'],
        ['SLOT_INTERVAL_MINUTES', '30'],
        ['MAX_ADVANCE_DAYS', '60'],
        ['CAFE_NAME', 'English Cafe'],
        ['CAFE_ADDRESS', '14 Royal Crescent, Mayfair, London W1J 7PT'],
        ['CAFE_PHONE', '+44 20 7946 0912']
      ]
    });
  }

  // BLOCKED DATES Headers
  if (missingSheets.includes('BLOCKED DATES')) {
    valueUpdates.push({
      range: "'BLOCKED DATES'!A1:H1",
      values: [[
        'Block ID', 'Date', 'Start Time', 'End Time', 'Block Type', 'Table IDs', 'Reason', 'Created By'
      ]]
    });
  }

  if (valueUpdates.length > 0) {
    const valuesBatchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
    await fetch(valuesBatchUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueUpdates
      })
    });
  }

  return {
    success: true,
    message: 'Google Spreadsheet successfully verified and initialized via Google Sheets API.',
    sheetsCreatedOrVerified: requiredSheets
  };
}

/**
 * Appends a confirmed reservation row directly to the Google Sheet
 */
export async function appendBookingToGoogleSheet(spreadsheetId: string, booking: any) {
  try {
    const accessToken = await getGoogleAccessToken();
    const row = [
      booking.bookingId,
      booking.requestId || '',
      booking.customerName,
      booking.customerEmail,
      String(booking.customerPhone || '').startsWith('+') ? `'${booking.customerPhone}` : String(booking.customerPhone || ''),
      booking.bookingDate,
      booking.startTime,
      booking.endTime,
      booking.guestCount,
      booking.assignedTableIds.join(','),
      booking.specialRequests || '',
      booking.bookingStatus,
      booking.createdAt,
      booking.updatedAt,
      booking.adminNotes || '',
      booking.emailStatus || 'SENT'
    ];

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/BOOKINGS!A:P:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [row]
      })
    });

    return res.ok;
  } catch (err) {
    console.warn('Failed to append booking to Google Sheet via Service Account API:', err);
    return false;
  }
}

/**
 * Reads values from a specified range in the Google Sheet
 */
export async function readRowsFromGoogleSheet(spreadsheetId: string, range: string): Promise<string[][]> {
  try {
    const accessToken = await getGoogleAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.values || [];
  } catch (err) {
    console.warn('Failed to read from Google Sheet:', err);
    return [];
  }
}
