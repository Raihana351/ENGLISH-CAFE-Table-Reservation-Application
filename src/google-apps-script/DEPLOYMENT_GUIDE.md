# English Cafe – Google Sheets & Apps Script Deployment Guide

This guide describes how to connect the English Cafe application to your Google Spreadsheet and enable email confirmations.

---

## 1. The 3 Simple Configuration Values

The application setup requires only 3 values:

1. **Google Spreadsheet ID**:
   - Configured Sheet: `1ud-hNTI6XqmSZrqoKby_x04OsTG3dUmPFLYQAyeOkrA`
   - Direct Sheet Link: [https://docs.google.com/spreadsheets/d/1ud-hNTI6XqmSZrqoKby_x04OsTG3dUmPFLYQAyeOkrA/edit](https://docs.google.com/spreadsheets/d/1ud-hNTI6XqmSZrqoKby_x04OsTG3dUmPFLYQAyeOkrA/edit)
   - You can paste either the raw ID or the entire Google Sheets URL; the app automatically parses and validates it.

2. **Sender Email Address**:
   - The Gmail or Google Workspace address authorized to send customer confirmation emails and receive admin notifications.
   - Example: `reservations@englishcafe.co.uk` or your authorized Gmail.

3. **Google Service Account Email**:
   - Configured Service Account: `english-cafe-442@gen-lang-client-0302064176.iam.gserviceaccount.com`
   - **Spreadsheet Sharing**: Share your Google Spreadsheet ([Open Sheet](https://docs.google.com/spreadsheets/d/1ud-hNTI6XqmSZrqoKby_x04OsTG3dUmPFLYQAyeOkrA/edit)) with `english-cafe-442@gen-lang-client-0302064176.iam.gserviceaccount.com` as an **Editor**.

---

## 2. Architecture: Approach A vs. Approach B

- **Approach A (Recommended & Implemented)**:
  - Google Apps Script executes as your authorized Google account (`Me`).
  - Google Sheets is read and written directly with native `SpreadsheetApp` and concurrency protected via `LockService`.
  - Confirmation emails are dispatched securely using `MailApp`.
  - **Zero Secrets in Frontend**: No private keys, service account secrets, or database passwords ever touch the client or browser bundle.

- **Approach B (Service Account REST API)**:
  - If your enterprise infrastructure calls Google Sheets REST API directly using the service account, the service account email is preserved in the settings.
  - The service account must be granted `roles/sheets.editor` and explicitly shared on the spreadsheet.

---

## 3. Step-by-Step Google Apps Script Deployment

1. **Create or Open your Google Spreadsheet**:
   - Go to [Google Sheets](https://sheets.new) and create a new spreadsheet (e.g., "English Cafe Reservations").
   - Copy the Spreadsheet ID from the browser address bar.

2. **Open Apps Script**:
   - In Google Sheets, click **Extensions** → **Apps Script**.

3. **Paste `Code.gs`**:
   - Clear any default code in `Code.gs`.
   - Copy all code from `/src/google-apps-script/Code.gs` in this repository and paste it into the editor.
   - Click the floppy disk icon (💾 **Save project**).

4. **Deploy as Web App**:
   - Click **Deploy** → **New deployment**.
   - Click the gear icon next to "Select type" and select **Web app**.
   - Configure:
     - **Description**: `English Cafe Reservation Backend v1.0`
     - **Execute as**: `Me (your-email@gmail.com)`
     - **Who has access**: `Anyone`
   - Click **Deploy**.
   - Review and grant authorizations for Google Sheets and Google Mail (`MailApp`).
   - Copy the generated **Web App URL** (format: `https://script.google.com/macros/s/.../exec`).

5. **Connect in English Cafe Admin**:
   - In the English Cafe application, open the **Admin Dashboard** → **Google Integration**.
   - Enter your **Google Spreadsheet ID**, **Sender Email**, and paste the **Apps Script Web App URL**.
   - Click **"Initialize Spreadsheet"**: The app will automatically create the 4 required sheets (`BOOKINGS`, `TABLES`, `SETTINGS`, `BLOCKED DATES`) with styled headers and default tables (T01–T10).
   - Click **"Run Diagnostic Test"**: Verifies read/write permissions, email quota, and table occupancy rules.
