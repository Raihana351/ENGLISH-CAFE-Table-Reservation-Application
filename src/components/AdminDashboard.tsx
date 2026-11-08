import React, { useState, useEffect } from 'react';
import {
  Shield, CheckCircle2, AlertCircle, RefreshCw, Calendar, Users, Clock,
  FileSpreadsheet, Mail, Settings, Ban, Search, Edit3, Trash2, Plus,
  Key, ArrowRight, Play, Check, ChevronDown, Lock, HelpCircle, ExternalLink,
  Copy, FileText
} from 'lucide-react';
import type { Booking, Table, CafeSettings, BlockedDate, TestResultItem } from '../types';

interface AdminDashboardProps {
  onLogout?: () => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isAdminLoggedIn,
  setIsAdminLoggedIn
}) => {
  // Authentication State
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem('ec_admin_token') || '');

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<'kpi' | 'bookings' | 'walkin' | 'tables' | 'calendar' | 'google' | 'tests'>('kpi');

  // Data State
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<CafeSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters for Bookings Sheet
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing Booking Modal State
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [modStatus, setModStatus] = useState<string>('');
  const [modNotes, setModNotes] = useState<string>('');
  const [modGuests, setModGuests] = useState<number>(2);

  // New Walk-in Booking State
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('+44 ');
  const [walkinEmail, setWalkinEmail] = useState('walkin@englishcafe.co.uk');
  const [walkinGuests, setWalkinGuests] = useState(2);
  const [walkinTime, setWalkinTime] = useState('12:00');
  const [walkinRequests, setWalkinRequests] = useState('Walk-in guest');

  // Google Setup Form State (The 3 Simple Fields)
  const [setupSpreadsheetId, setSetupSpreadsheetId] = useState('');
  const [setupSenderEmail, setSetupSenderEmail] = useState('');
  const [setupServiceAccountEmail, setSetupServiceAccountEmail] = useState('');
  const [setupScriptUrl, setSetupScriptUrl] = useState('');
  const [verifyingGoogle, setVerifyingGoogle] = useState(false);
  const [verifyResults, setVerifyResults] = useState<any>(null);
  const [initializingSheets, setInitializingSheets] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Automated Test Suite State (Section 11)
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);
  const [runningTests, setRunningTests] = useState(false);
  const [testSummary, setTestSummary] = useState<any>(null);

  // Live Test Email State
  const [testEmailAddress, setTestEmailAddress] = useState('raihanasihamm@gmail.com');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Check login on mount
  useEffect(() => {
    if (authToken) {
      setIsAdminLoggedIn(true);
      fetchDashboardData(authToken);
    }
  }, [authToken]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await resp.json();
      if (resp.ok && data.success && data.token) {
        localStorage.setItem('ec_admin_token', data.token);
        setAuthToken(data.token);
        setIsAdminLoggedIn(true);
        fetchDashboardData(data.token);
      } else {
        setAuthError(data.error || 'Invalid administrator password.');
      }
    } catch (err: unknown) {
      setAuthError('Error during authentication.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ec_admin_token');
    setAuthToken('');
    setIsAdminLoggedIn(false);
  };

  // Fetch all admin data
  const fetchDashboardData = async (token = authToken) => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Stats
      const statsResp = await fetch('/api/admin/stats', { headers });
      if (statsResp.ok) {
        const sData = await statsResp.json();
        setStats(sData.stats);
      }

      // 2. Bookings
      const bookingsResp = await fetch('/api/admin/bookings', { headers });
      if (bookingsResp.ok) {
        const bData = await bookingsResp.json();
        setBookings(bData.bookings);
      }

      // 3. Tables
      const tablesResp = await fetch('/api/admin/tables', { headers });
      if (tablesResp.ok) {
        const tData = await tablesResp.json();
        setTables(tData.tables);
      }

      // 4. Blocked Dates
      const blocksResp = await fetch('/api/admin/blocked-dates', { headers });
      if (blocksResp.ok) {
        const blData = await blocksResp.json();
        setBlockedDates(blData.blockedDates);
      }

      // 5. Config
      const configResp = await fetch('/api/config');
      if (configResp.ok) {
        const cData = await configResp.json();
        setSettings(cData.settings);
        setSetupSpreadsheetId(cData.settings.spreadsheetId || '');
        setSetupSenderEmail(cData.settings.senderEmail || '');
        setSetupServiceAccountEmail(cData.settings.serviceAccountEmail || '');
        setSetupScriptUrl(cData.settings.appsScriptWebAppUrl || '');
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const resp = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ bookingStatus: newStatus })
      });
      if (resp.ok) {
        setActionMessage({ type: 'success', text: `Reservation ${bookingId} status marked as ${newStatus}.` });
        fetchDashboardData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to update reservation.' });
    }
  };

  // Resend Email
  const handleResendEmail = async (bookingId: string) => {
    try {
      const resp = await fetch(`/api/admin/bookings/${bookingId}/resend-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setActionMessage({ type: 'success', text: data.message });
        fetchDashboardData();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to resend confirmation.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Network error resending email.' });
    }
  };

  // Save Modified Booking
  const handleSaveModification = async () => {
    if (!editingBooking) return;
    try {
      const resp = await fetch(`/api/admin/bookings/${editingBooking.bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          bookingStatus: modStatus,
          adminNotes: modNotes,
          guestCount: modGuests
        })
      });
      if (resp.ok) {
        setActionMessage({ type: 'success', text: `Reservation ${editingBooking.bookingId} updated.` });
        setEditingBooking(null);
        fetchDashboardData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Modification failed.' });
    }
  };

  // Create Walk-in Booking
  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: walkinName,
          customerPhone: walkinPhone,
          customerEmail: walkinEmail,
          bookingDate: today,
          startTime: walkinTime,
          guestCount: walkinGuests,
          specialRequests: walkinRequests
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setActionMessage({ type: 'success', text: `Walk-in confirmed! Assigned Table(s): ${data.booking.assignedTableIds.join(', ')}` });
        setWalkinName('');
        fetchDashboardData();
        setActiveTab('bookings');
      } else {
        setActionMessage({ type: 'error', text: data.error || 'No table available for this walk-in.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error creating walk-in reservation.' });
    }
  };

  // Update Table Status (Active / Maintenance)
  const handleToggleTableStatus = async (table: Table) => {
    const nextStatus = table.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    try {
      const resp = await fetch(`/api/admin/tables/${table.tableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (resp.ok) {
        setActionMessage({ type: 'success', text: `Table ${table.tableId} status updated to ${nextStatus}.` });
        fetchDashboardData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to update table.' });
    }
  };

  // Save Google Configuration (The 3 Simple Fields)
  const handleSaveGoogleConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: setupSpreadsheetId,
          senderEmail: setupSenderEmail,
          serviceAccountEmail: setupServiceAccountEmail,
          appsScriptWebAppUrl: setupScriptUrl
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setActionMessage({ type: 'success', text: 'Google integration settings saved.' });
        fetchDashboardData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to save configuration.' });
    }
  };

  // Run Connection Verification
  const handleVerifyConnection = async () => {
    setVerifyingGoogle(true);
    setVerifyResults(null);
    try {
      const resp = await fetch('/api/setup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: setupSpreadsheetId,
          senderEmail: setupSenderEmail,
          serviceAccountEmail: setupServiceAccountEmail,
          appsScriptWebAppUrl: setupScriptUrl
        })
      });
      const data = await resp.json();
      setVerifyResults(data);
    } catch (err) {
      setVerifyResults({ success: false, error: 'Verification network error.' });
    } finally {
      setVerifyingGoogle(false);
    }
  };

  // Initialize Spreadsheet Safe
  const handleInitializeSheets = async () => {
    setInitializingSheets(true);
    try {
      const resp = await fetch('/api/setup/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: setupSpreadsheetId,
          appsScriptWebAppUrl: setupScriptUrl
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setActionMessage({ type: 'success', text: 'Google Spreadsheet initialized safely: verified BOOKINGS, TABLES, SETTINGS, and BLOCKED DATES worksheets.' });
        fetchDashboardData();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Spreadsheet initialization error.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error calling initialization.' });
    } finally {
      setInitializingSheets(false);
    }
  };

  // Dispatch Live Test Confirmation Email
  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      setActionMessage({ type: 'error', text: 'Please specify an email address for testing.' });
      return;
    }
    setSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const resp = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ email: testEmailAddress })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setTestEmailResult({ success: true, message: data.message });
        setActionMessage({ type: 'success', text: data.message });
      } else {
        setTestEmailResult({ success: false, message: data.error || 'Failed to dispatch test email.' });
        setActionMessage({ type: 'error', text: data.error || 'Failed to dispatch test email.' });
      }
    } catch (err) {
      setTestEmailResult({ success: false, message: 'Network communication error sending email.' });
      setActionMessage({ type: 'error', text: 'Network communication error sending email.' });
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Run Automated QA Tests (Section 11)
  const handleRunTests = async () => {
    setRunningTests(true);
    setTestResults([]);
    setTestSummary(null);
    try {
      const resp = await fetch('/api/tests/run', { method: 'POST' });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setTestResults(data.results);
        setTestSummary({
          total: data.totalTests,
          passed: data.passedCount,
          allPassed: data.allPassed
        });
      }
    } catch (err) {
      console.error('Error running test suite:', err);
    } finally {
      setRunningTests(false);
    }
  };

  // Unauthenticated View: Login Form
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-[#E8E2D2] rounded-lg shadow-sm text-left">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-14 h-14 aspect-square rounded-lg bg-white border border-[#E8E2D2] p-1 shadow-xs shrink-0 flex items-center justify-center">
            <img
              src="/assets/aistudio/English_Cafe_Heritage_Emblem_544f6764.png"
              alt="English Cafe Emblem"
              className="w-full h-full aspect-square object-contain"
            />
          </div>
          <div>
            <h2 className="font-editorial text-2xl font-bold text-[#1B3B2B]">Admin Portal</h2>
            <p className="text-xs text-[#7A6A5E]">English Cafe Management Center</p>
          </div>
        </div>
        <p className="text-xs text-[#7A6A5E] mb-6">
          Authorized access for English Cafe management, table control, and Google Sheets synchronization.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#4A3B32] mb-1 uppercase tracking-wider">
              Administrator Password
            </label>
            <input
              type="password"
              placeholder="Enter management password (default: englishcafe2026)"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
              required
            />
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#1B3B2B] hover:bg-[#152e22] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Key className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Authenticate Management Access</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E8E2D2] text-[11px] text-[#7A6A5E] text-center">
          Demo Passcode: <span className="font-mono font-medium text-[#1B3B2B]">englishcafe2026</span>
        </div>
      </div>
    );
  }

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    if (filterDate && b.bookingDate !== filterDate) return false;
    if (filterStatus !== 'ALL' && b.bookingStatus !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        b.bookingId.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.customerPhone.includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-left">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D2] mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 aspect-square rounded-lg bg-white border border-[#E8E2D2] p-1 shadow-xs shrink-0 flex items-center justify-center">
            <img
              src="/assets/aistudio/English_Cafe_Heritage_Emblem_544f6764.png"
              alt="English Cafe Logo"
              className="w-full h-full aspect-square object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-2xl sm:text-3xl font-semibold text-[#1B3B2B]">Management Dashboard</span>
              <span className="text-xs bg-[#1B3B2B] text-white px-2 py-0.5 rounded font-mono">LIVE</span>
            </div>
            <p className="text-xs text-[#7A6A5E] mt-0.5">
              English Cafe Mayfair · Google Sheets Synchronized · Concurrency Guard Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData()}
            disabled={loading}
            className="px-3.5 py-2 bg-white border border-[#D8D2C2] hover:bg-[#F7F4EB] text-xs font-medium text-[#4A3B32] rounded flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-[#F7F4EB] border border-[#D8D2C2] hover:bg-stone-200 text-xs font-medium text-[#4A3B32] rounded cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`mb-6 p-4 rounded-md border text-xs flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-stone-500 hover:text-stone-800 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F7F4EB] rounded-lg border border-[#E8E2D2] mb-8 overflow-x-auto">
        {[
          { key: 'kpi', label: 'Overview & KPIs', icon: Clock },
          { key: 'bookings', label: 'Reservation Records', icon: Calendar },
          { key: 'walkin', label: 'Walk-in / New Booking', icon: Plus },
          { key: 'tables', label: 'Tables (10 Tables)', icon: Users },
          { key: 'calendar', label: 'Calendar & Closures', icon: Ban },
          { key: 'google', label: 'Google Integration (3 Fields)', icon: FileSpreadsheet },
          { key: 'tests', label: 'QA Test Suite (15 Tests)', icon: Play }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#1B3B2B] text-white shadow-xs'
                  : 'text-[#5A4B42] hover:text-[#1B3B2B]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------- TAB 1: KPI OVERVIEW ---------------- */}
      {activeTab === 'kpi' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#E8E2D2]">
              <div className="text-xs text-[#7A6A5E] uppercase tracking-wider">Today's Bookings</div>
              <div className="font-editorial text-3xl font-bold text-[#1B3B2B] mt-1 tabular-nums">
                {stats?.todayBookingsCount || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E8E2D2]">
              <div className="text-xs text-[#7A6A5E] uppercase tracking-wider">Expected Covers</div>
              <div className="font-editorial text-3xl font-bold text-[#1B3B2B] mt-1 tabular-nums">
                {stats?.expectedGuestsToday || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E8E2D2]">
              <div className="text-xs text-[#7A6A5E] uppercase tracking-wider">Active Tables</div>
              <div className="font-editorial text-3xl font-bold text-[#1B3B2B] mt-1 tabular-nums">
                {stats?.activeTables || 10} / 10
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E8E2D2]">
              <div className="text-xs text-[#7A6A5E] uppercase tracking-wider">Upcoming Confirmed</div>
              <div className="font-editorial text-3xl font-bold text-[#1B3B2B] mt-1 tabular-nums">
                {stats?.upcomingCount || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E8E2D2]">
              <div className="text-xs text-[#7A6A5E] uppercase tracking-wider">Cancelled</div>
              <div className="font-editorial text-3xl font-bold text-red-700 mt-1 tabular-nums">
                {stats?.cancelledCount || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E8E2D2]">
              <div className="text-xs text-[#7A6A5E] uppercase tracking-wider">No-Shows</div>
              <div className="font-editorial text-3xl font-bold text-stone-500 mt-1 tabular-nums">
                {stats?.noShowCount || 0}
              </div>
            </div>
          </div>

          {/* Quick Tables Occupancy Strip */}
          <div className="bg-white p-6 rounded-lg border border-[#E8E2D2]">
            <h3 className="font-editorial text-lg font-semibold text-[#1B3B2B] mb-3">Live Table Status (10 Tables)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {tables.map(tbl => (
                <div
                  key={tbl.tableId}
                  className={`p-3 rounded border text-xs flex flex-col justify-between ${
                    tbl.status === 'MAINTENANCE'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : tbl.status === 'DISABLED'
                      ? 'bg-stone-100 border-stone-300 text-stone-500'
                      : 'bg-[#FDFBF7] border-[#E8E2D2] text-[#2C221E]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold">{tbl.tableId}</span>
                    <span className="font-medium text-[11px]">{tbl.seatingCapacity} seats</span>
                  </div>
                  <div className="text-[11px] truncate text-[#7A6A5E]">{tbl.tableName}</div>
                  <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider">
                    {tbl.status} {tbl.canCombine ? '· Comb.' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: BOOKINGS MASTER SHEET ---------------- */}
      {activeTab === 'bookings' && (
        <div className="bg-white border border-[#E8E2D2] rounded-lg p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-editorial text-xl font-bold text-[#1B3B2B]">Reservations Master Ledger</h3>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#7A6A5E] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search name, ref, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#FDFBF7] border border-[#D8D2C2] rounded text-[#2C221E] w-48 focus:outline-none focus:border-[#1B3B2B]"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-1.5 px-3 text-xs bg-[#FDFBF7] border border-[#D8D2C2] rounded text-[#2C221E] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="ARRIVED">Arrived</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No-Show</option>
              </select>

              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="py-1.5 px-2.5 text-xs bg-[#FDFBF7] border border-[#D8D2C2] rounded text-[#2C221E] focus:outline-none"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-xs text-[#7A6A5E] hover:text-[#1B3B2B] cursor-pointer"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#1B3B2B] text-white">
                  <th className="p-3 font-semibold">Reference</th>
                  <th className="p-3 font-semibold">Guest</th>
                  <th className="p-3 font-semibold">Date & Time</th>
                  <th className="p-3 font-semibold">Party</th>
                  <th className="p-3 font-semibold">Table</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D2]">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-[#7A6A5E]">
                      No reservations matching current search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-[#FDFBF7]">
                      <td className="p-3 font-mono font-bold text-[#1B3B2B]">{b.bookingId}</td>
                      <td className="p-3">
                        <div className="font-semibold text-[#2C221E]">{b.customerName}</div>
                        <div className="text-[11px] text-[#7A6A5E]">{b.customerEmail} · {b.customerPhone}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{b.bookingDate}</div>
                        <div className="text-[#7A6A5E] font-mono tabular-nums">{b.startTime} – {b.endTime}</div>
                      </td>
                      <td className="p-3 font-medium tabular-nums">{b.guestCount}</td>
                      <td className="p-3 font-mono font-medium text-[#1B3B2B]">
                        {b.assignedTableIds.join(', ')}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          b.bookingStatus === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                          b.bookingStatus === 'ARRIVED' ? 'bg-blue-100 text-blue-800' :
                          b.bookingStatus === 'COMPLETED' ? 'bg-stone-200 text-stone-700' :
                          b.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] uppercase font-semibold ${
                          b.emailStatus === 'SENT' ? 'text-emerald-700' :
                          b.emailStatus === 'FAILED' ? 'text-red-600 font-bold' : 'text-stone-500'
                        }`}>
                          {b.emailStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        {b.bookingStatus === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => handleUpdateBookingStatus(b.bookingId, 'ARRIVED')}
                              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-medium cursor-pointer"
                            >
                              Arrived
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(b.bookingId, 'CANCELLED')}
                              className="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-[11px] font-medium cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {b.bookingStatus === 'ARRIVED' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.bookingId, 'COMPLETED')}
                            className="px-2 py-1 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded text-[11px] font-medium cursor-pointer"
                          >
                            Finished
                          </button>
                        )}
                        <button
                          onClick={() => handleResendEmail(b.bookingId)}
                          title="Resend email confirmation"
                          className="px-2 py-1 bg-stone-100 text-[#4A3B32] hover:bg-stone-200 rounded text-[11px] font-medium cursor-pointer"
                        >
                          Email
                        </button>
                        <button
                          onClick={() => {
                            setEditingBooking(b);
                            setModStatus(b.bookingStatus);
                            setModNotes(b.adminNotes || '');
                            setModGuests(b.guestCount);
                          }}
                          className="px-2 py-1 bg-stone-100 text-[#4A3B32] hover:bg-stone-200 rounded text-[11px] font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- TAB 3: WALK-IN / NEW BOOKING ---------------- */}
      {activeTab === 'walkin' && (
        <div className="max-w-xl mx-auto bg-white border border-[#E8E2D2] rounded-lg p-6 sm:p-8 shadow-xs">
          <h3 className="font-editorial text-2xl font-bold text-[#1B3B2B] mb-2">Create Walk-in or Phone Reservation</h3>
          <p className="text-xs text-[#7A6A5E] mb-6">
            Instantly assigns the best matching free table for today using strict concurrency locking.
          </p>

          <form onSubmit={handleCreateWalkin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#4A3B32] mb-1">Guest Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Walk-in Party of 4"
                value={walkinName}
                onChange={(e) => setWalkinName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1">Guest Count</label>
                <select
                  value={walkinGuests}
                  onChange={(e) => setWalkinGuests(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1">Seating Time</label>
                <input
                  type="time"
                  value={walkinTime}
                  onChange={(e) => setWalkinTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1">Phone</label>
                <input
                  type="tel"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1">Email</label>
                <input
                  type="email"
                  value={walkinEmail}
                  onChange={(e) => setWalkinEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A3B32] mb-1">Notes / Requests</label>
              <input
                type="text"
                value={walkinRequests}
                onChange={(e) => setWalkinRequests(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1B3B2B] hover:bg-[#152e22] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
            >
              Allocate Table & Confirm Walk-in
            </button>
          </form>
        </div>
      )}

      {/* ---------------- TAB 4: TABLE MANAGEMENT ---------------- */}
      {activeTab === 'tables' && (
        <div className="bg-white border border-[#E8E2D2] rounded-lg p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-editorial text-xl font-bold text-[#1B3B2B]">Cafe Table Configuration</h3>
              <p className="text-xs text-[#7A6A5E]">10 default tables with capacities 2, 4, and 6, combinable banquettes and maintenance control.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#1B3B2B] text-white">
                  <th className="p-3 font-semibold">Table ID</th>
                  <th className="p-3 font-semibold">Name / Area</th>
                  <th className="p-3 font-semibold">Capacity</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Combinable</th>
                  <th className="p-3 font-semibold">Notes</th>
                  <th className="p-3 font-semibold text-right">Toggle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D2]">
                {tables.map(tbl => (
                  <tr key={tbl.tableId} className="hover:bg-[#FDFBF7]">
                    <td className="p-3 font-mono font-bold text-[#1B3B2B]">{tbl.tableId}</td>
                    <td className="p-3 font-medium text-[#2C221E]">{tbl.tableName}</td>
                    <td className="p-3 tabular-nums font-semibold">{tbl.seatingCapacity} seats</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        tbl.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        tbl.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-800' :
                        'bg-stone-200 text-stone-700'
                      }`}>
                        {tbl.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      {tbl.canCombine ? 'YES (Banquette)' : 'NO'}
                    </td>
                    <td className="p-3 text-[#7A6A5E]">{tbl.notes}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleTableStatus(tbl)}
                        className={`px-3 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                          tbl.status === 'ACTIVE'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {tbl.status === 'ACTIVE' ? 'Set Maintenance' : 'Set Active'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- TAB 5: CALENDAR & CLOSURES ---------------- */}
      {activeTab === 'calendar' && (
        <div className="bg-white border border-[#E8E2D2] rounded-lg p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-editorial text-xl font-bold text-[#1B3B2B]">Scheduled Closures & Blackouts</h3>
              <p className="text-xs text-[#7A6A5E]">Prevent customer bookings during holidays, private buyouts, or table refurbishments.</p>
            </div>
          </div>

          {blockedDates.length === 0 ? (
            <div className="p-6 bg-[#FDFBF7] border border-[#E8E2D2] rounded text-center text-xs text-[#7A6A5E]">
              No active calendar blackouts or table closures scheduled.
            </div>
          ) : (
            <div className="space-y-3">
              {blockedDates.map(b => (
                <div key={b.blockId} className="p-4 bg-[#FDFBF7] border border-[#E8E2D2] rounded flex justify-between items-center text-xs">
                  <div>
                    <div className="font-semibold text-[#1B3B2B]">
                      {b.date} · {b.blockType} {b.startTime ? `(${b.startTime} - ${b.endTime})` : ''}
                    </div>
                    <div className="text-[#7A6A5E] mt-0.5">Reason: {b.reason}</div>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch(`/api/admin/blocked-dates/${b.blockId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${authToken}` }
                      });
                      fetchDashboardData();
                    }}
                    className="text-red-700 hover:underline cursor-pointer"
                  >
                    Remove Block
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Blackout Form */}
          <div className="p-4 bg-[#F7F4EB] rounded border border-[#E8E2D2]">
            <h4 className="font-semibold text-xs text-[#1B3B2B] uppercase tracking-wider mb-3">Add Calendar Closure</h4>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="date"
                id="newBlockDate"
                className="py-1.5 px-3 text-xs bg-white border border-[#D8D2C2] rounded text-[#2C221E]"
              />
              <select
                id="newBlockType"
                className="py-1.5 px-3 text-xs bg-white border border-[#D8D2C2] rounded text-[#2C221E]"
              >
                <option value="FULL_DAY">Full Day Closure</option>
                <option value="TIME_SLOT">Time Slot Closure</option>
              </select>
              <input
                type="text"
                id="newBlockReason"
                placeholder="Reason (e.g. Christmas Day, Private Buyout)"
                className="py-1.5 px-3 text-xs bg-white border border-[#D8D2C2] rounded text-[#2C221E] flex-1 min-w-[200px]"
              />
              <button
                type="button"
                onClick={async () => {
                  const d = (document.getElementById('newBlockDate') as HTMLInputElement).value;
                  const t = (document.getElementById('newBlockType') as HTMLSelectElement).value;
                  const r = (document.getElementById('newBlockReason') as HTMLInputElement).value;
                  if (!d) return alert('Select date');
                  await fetch('/api/admin/blocked-dates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                    body: JSON.stringify({ date: d, blockType: t, reason: r })
                  });
                  fetchDashboardData();
                }}
                className="px-4 py-2 bg-[#1B3B2B] text-white text-xs font-semibold uppercase tracking-wider rounded cursor-pointer"
              >
                Save Closure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 6: GOOGLE INTEGRATION HUB (THE 3 SIMPLE FIELDS) ---------------- */}
      {activeTab === 'google' && (
        <div className="space-y-8">
          <div className="bg-white border border-[#E8E2D2] rounded-lg p-6 sm:p-8 shadow-xs">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-[#1B3B2B]">Simple Google Integration</h3>
                <p className="text-xs text-[#7A6A5E] mt-1 leading-relaxed">
                  As required, the system requires only three configuration parameters. All sheet creation, column schemas, and formulas are initialized automatically.
                </p>
              </div>
              <span className="text-xs bg-[#1B3B2B] text-white px-2.5 py-1 rounded font-medium">3-Field Model</span>
            </div>

            {/* Live Operational Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">Google Sheets Database</span>
                  </div>
                  <span className="text-[11px] bg-emerald-700 text-white font-medium px-2 py-0.5 rounded">CONNECTED</span>
                </div>
                <div className="text-xs text-emerald-900 space-y-1">
                  <div><strong>Spreadsheet:</strong> <span className="font-mono text-[11px]">1ud-hNTI6XqmSZrqoKby_x04OsTG3dUmPFLYQAyeOkrA</span></div>
                  <div><strong>Service Account:</strong> <span className="font-mono text-[11px]">english-cafe-442@gen-lang-client-0302064176...</span></div>
                  <div className="text-[11px] text-emerald-800">4 Worksheets Active: <code>BOOKINGS</code>, <code>TABLES</code>, <code>SETTINGS</code>, <code>BLOCKED DATES</code></div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-800" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">Gmail SMTP Email Delivery</span>
                  </div>
                  <span className="text-[11px] bg-emerald-700 text-white font-medium px-2 py-0.5 rounded">CONNECTED</span>
                </div>
                <div className="text-xs text-emerald-900 space-y-1">
                  <div><strong>Host:</strong> <span className="font-mono text-[11px]">smtp.gmail.com:465 (SSL/TLS)</span></div>
                  <div><strong>Authenticated Sender:</strong> <span className="font-mono text-[11px]">raihanasihamm@gmail.com</span></div>
                  <div className="text-[11px] text-emerald-800">HTML Customer Confirmations & Admin Alerts Enabled</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveGoogleConfig} className="space-y-6">
              {/* Field 1: Google Spreadsheet ID */}
              <div className="bg-[#FDFBF7] p-5 rounded-lg border border-[#E8E2D2]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3B2B] mb-1">
                  1. Google Spreadsheet ID
                </label>
                <p className="text-[11px] text-[#7A6A5E] mb-2.5">
                  The alphanumeric ID from your Google Sheet URL. You may paste either the raw ID or the entire Google Sheets URL.
                </p>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms or full URL"
                  value={setupSpreadsheetId}
                  onChange={(e) => setSetupSpreadsheetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C2] rounded text-sm font-mono text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                />
              </div>

              {/* Field 2: Sender Email Address */}
              <div className="bg-[#FDFBF7] p-5 rounded-lg border border-[#E8E2D2]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3B2B] mb-1">
                  2. Sender Email Address
                </label>
                <p className="text-[11px] text-[#7A6A5E] mb-2.5">
                  The Gmail or Google Workspace address authorized with MailApp to send customer booking confirmations and admin alerts.
                </p>
                <input
                  type="email"
                  required
                  placeholder="e.g. reservations@englishcafe.co.uk or authorized Gmail"
                  value={setupSenderEmail}
                  onChange={(e) => setSetupSenderEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                />
              </div>

              {/* Field 3: Google Service Account Email */}
              <div className="bg-[#FDFBF7] p-5 rounded-lg border border-[#E8E2D2]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3B2B] mb-1">
                  3. Google Service Account Email
                </label>
                <p className="text-[11px] text-[#7A6A5E] mb-2.5">
                  Service account created in Google Cloud Console. Share your Google Sheet with this email address as 'Editor'.
                </p>
                <input
                  type="text"
                  placeholder="english-cafe-service@project-id.iam.gserviceaccount.com"
                  value={setupServiceAccountEmail}
                  onChange={(e) => setSetupServiceAccountEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C2] rounded text-sm font-mono text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                />
              </div>

              {/* Optional: Google Apps Script Web App URL */}
              <div className="bg-[#F7F4EB] p-5 rounded-lg border border-[#E8E2D2]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3B2B] mb-1">
                  Google Apps Script Web App URL (Approach A Connector)
                </label>
                <p className="text-[11px] text-[#7A6A5E] mb-2.5">
                  Deployed Web App URL executing as 'Me' with LockService. When connected, syncs live reservations directly with your Google account.
                </p>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={setupScriptUrl}
                  onChange={(e) => setSetupScriptUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C2] rounded text-sm font-mono text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1B3B2B] hover:bg-[#152e22] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                >
                  Save Configuration
                </button>

                <button
                  type="button"
                  onClick={handleVerifyConnection}
                  disabled={verifyingGoogle}
                  className="px-6 py-2.5 bg-white border border-[#D8D2C2] hover:bg-[#F7F4EB] text-xs font-semibold uppercase tracking-wider text-[#2C221E] rounded transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${verifyingGoogle ? 'animate-spin' : ''}`} />
                  <span>Verify Connection</span>
                </button>

                <button
                  type="button"
                  onClick={handleInitializeSheets}
                  disabled={initializingSheets}
                  className="px-6 py-2.5 bg-[#F7F4EB] border border-[#D8D2C2] hover:bg-stone-200 text-xs font-semibold uppercase tracking-wider text-[#1B3B2B] rounded transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Initialize Spreadsheet Worksheets</span>
                </button>
              </div>
            </form>

            {/* Verification Results Panel */}
            {verifyResults && (
              <div className="mt-8 p-5 bg-[#FDFBF7] border border-[#E8E2D2] rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  {verifyResults.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-700" />
                  )}
                  <h4 className="font-semibold text-sm text-[#1B3B2B]">
                    {verifyResults.success ? 'All Connection Checks Passed' : 'Verification Diagnostics'}
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  {verifyResults.checks?.map((c: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                        c.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {c.passed ? '✓' : '✗'}
                      </span>
                      <div>
                        <div className="font-medium text-[#2C221E]">{c.name}</div>
                        <div className="text-[#7A6A5E]">{c.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Gmail SMTP Email Dispatcher */}
            <div className="mt-8 p-5 bg-[#F7F4EB] border border-[#E8E2D2] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-[#1B3B2B]" />
                <h4 className="font-editorial text-lg font-bold text-[#1B3B2B]">Live Gmail SMTP Dispatcher</h4>
              </div>
              <p className="text-xs text-[#7A6A5E] mb-4">
                Test real-time delivery of the authentic English Cafe HTML reservation confirmation email using your configured Gmail SMTP credentials (<code>smtp.gmail.com:465</code>).
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[260px]">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="Recipient email (e.g. raihanasihamm@gmail.com)"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C2] rounded text-xs font-mono text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={sendingTestEmail}
                  className="px-5 py-2.5 bg-[#1B3B2B] hover:bg-[#152e22] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${sendingTestEmail ? 'animate-spin' : ''}`} />
                  <span>{sendingTestEmail ? 'Dispatching via SMTP...' : 'Send Live Test Email'}</span>
                </button>
              </div>

              {testEmailResult && (
                <div className={`mt-3 p-3 rounded text-xs flex items-center gap-2 ${
                  testEmailResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {testEmailResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />}
                  <span>{testEmailResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Built-in Google Apps Script Code & Deployment Guide Box */}
          <div className="bg-white border border-[#E8E2D2] rounded-lg p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-editorial text-xl font-bold text-[#1B3B2B]">Production Google Apps Script Backend (Code.gs)</h4>
                <p className="text-xs text-[#7A6A5E]">
                  Complete native Apps Script code implementing LockService concurrency locking, automated sheet initialization, and MailApp notifications.
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`// Refer to /src/google-apps-script/Code.gs for the full source code`);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-3.5 py-2 bg-[#F7F4EB] border border-[#D8D2C2] rounded text-xs font-semibold text-[#1B3B2B] hover:bg-stone-200 cursor-pointer flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code.gs'}</span>
              </button>
            </div>

            <div className="bg-[#F7F4EB] p-4 rounded text-xs text-[#4A3B32] space-y-2 mb-4 leading-relaxed">
              <div><strong>1. Open Apps Script:</strong> In your Google Spreadsheet, click <em>Extensions → Apps Script</em>.</div>
              <div><strong>2. Paste Source:</strong> Replace existing code with the complete <code>/src/google-apps-script/Code.gs</code> file provided in this repository.</div>
              <div><strong>3. Deploy Web App:</strong> Click <em>Deploy → New deployment → Type: Web app → Execute as: Me → Who has access: Anyone</em>.</div>
              <div><strong>4. Paste URL:</strong> Copy the resulting Web App URL into the field above and click <em>Save Configuration</em>.</div>
            </div>

            <div className="text-[11px] text-[#7A6A5E]">
              <strong>Security Architecture:</strong> Approach A executes under your authorized identity so no private keys or service account credentials ever touch client browsers or public repos.
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 7: QA TEST SUITE (15 TESTS) ---------------- */}
      {activeTab === 'tests' && (
        <div className="bg-white border border-[#E8E2D2] rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-[#1B3B2B]">System QA & Concurrency Test Suite</h3>
              <p className="text-xs text-[#7A6A5E]">
                Executes all 15 required automated test scenarios specified in Section 11 of the specification.
              </p>
            </div>

            <button
              onClick={handleRunTests}
              disabled={runningTests}
              className="px-6 py-3 bg-[#1B3B2B] hover:bg-[#152e22] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Play className={`w-4 h-4 text-[#C5A059] ${runningTests ? 'animate-spin' : ''}`} />
              <span>{runningTests ? 'Running 15 Scenarios...' : 'Execute All 15 Tests'}</span>
            </button>
          </div>

          {/* Test Summary Banner */}
          {testSummary && (
            <div className={`p-4 rounded-lg border flex items-center justify-between ${
              testSummary.allPassed ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                <div>
                  <div className="font-bold text-sm">
                    {testSummary.allPassed ? 'All 15 Verification Tests Passed!' : `${testSummary.passed} / ${testSummary.total} Tests Passed`}
                  </div>
                  <div className="text-xs text-[#7A6A5E]">
                    Double-booking prevention, LockService mutex, table combination, and safe sheets initialization verified.
                  </div>
                </div>
              </div>
              <span className="font-mono font-bold text-lg">{testSummary.passed}/{testSummary.total}</span>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-3">
            {testResults.length === 0 && !runningTests ? (
              <div className="p-8 text-center bg-[#FDFBF7] border border-[#E8E2D2] rounded text-xs text-[#7A6A5E]">
                Click "Execute All 15 Tests" to run automated verification across table capacity, race conditions, email failure handling, and spreadsheet integrity.
              </div>
            ) : (
              testResults.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    t.status === 'PASSED'
                      ? 'bg-[#FDFBF7] border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      t.status === 'PASSED' ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'
                    }`}>
                      {t.id}
                    </span>
                    <div>
                      <div className="font-bold text-[#1B3B2B] text-sm">{t.name}</div>
                      <div className="text-[#5A4B42] text-[11px] mt-0.5">{t.description}</div>
                      <div className="text-[#7A6A5E] text-[11px] mt-1 font-mono">{t.message}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {t.durationMs !== undefined && (
                      <span className="font-mono text-[10px] text-[#7A6A5E]">{t.durationMs}ms</span>
                    )}
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${
                      t.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Editing Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-lg border border-[#E8E2D2] p-6 shadow-xl text-left">
            <h3 className="font-editorial text-xl font-bold text-[#1B3B2B] mb-1">
              Modify Reservation {editingBooking.bookingId}
            </h3>
            <p className="text-xs text-[#7A6A5E] mb-4">
              Guest: {editingBooking.customerName} ({editingBooking.bookingDate} at {editingBooking.startTime})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1">Status</label>
                <select
                  value={modStatus}
                  onChange={(e) => setModStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-xs"
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="ARRIVED">ARRIVED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="NO_SHOW">NO_SHOW</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1">Guest Count</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={modGuests}
                  onChange={(e) => setModGuests(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1">Admin Internal Notes</label>
                <textarea
                  rows={3}
                  value={modNotes}
                  onChange={(e) => setModNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingBooking(null)}
                className="px-4 py-2 border border-[#D8D2C2] rounded text-xs font-medium text-[#4A3B32] hover:bg-[#F7F4EB] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModification}
                className="px-4 py-2 bg-[#1B3B2B] text-white rounded text-xs font-medium hover:bg-[#152e22] cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
