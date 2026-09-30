import React, { useState } from 'react';
import { Dispute, DisputeReason, DisputeStatus } from './types';
import {
  FileText,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  DollarSign,
  Search,
  Trash2,
  X
} from 'lucide-react';

export default function App() {
  // Navigation tab state: 'Dashboard' | 'Disputes' | 'Invoices' | 'Vendors' | 'Reports'
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  // Temporary frontend state for disputes - initialized to empty list
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  // Modal open/close state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Search & filter state in Disputes tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Form field states for New Dispute
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<DisputeReason>('Wrong Quantity');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<DisputeStatus>('New');

  // Dashboard card calculations (dynamic from state)
  const totalDisputes = disputes.length;
  const openDisputes = disputes.filter(
    (d) => d.status === 'New' || d.status === 'In Progress'
  ).length;
  const resolvedDisputes = disputes.filter(
    (d) => d.status === 'Resolved' || d.status === 'Closed'
  ).length;
  const totalAmount = disputes.reduce((sum, d) => sum + d.amount, 0);

  // Form submit handler
  const handleSaveDispute = (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceNumber.trim() || !vendor.trim() || !amount) {
      return;
    }

    const newDispute: Dispute = {
      id: Date.now().toString(),
      invoiceNumber: invoiceNumber.trim(),
      vendor: vendor.trim(),
      amount: parseFloat(amount) || 0,
      reason,
      description: description.trim(),
      date,
      status,
    };

    // Update state (easy to replace with backend POST /api/disputes later)
    setDisputes([newDispute, ...disputes]);

    // Reset form and close modal
    setInvoiceNumber('');
    setVendor('');
    setAmount('');
    setReason('Wrong Quantity');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('New');
    setIsModalOpen(false);
  };

  // Delete dispute handler (easy to replace with backend DELETE /api/disputes/:id later)
  const handleDeleteDispute = (id: string) => {
    setDisputes(disputes.filter((d) => d.id !== id));
  };

  // Change dispute status handler
  const handleStatusChange = (id: string, newStatus: DisputeStatus) => {
    setDisputes(
      disputes.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  // Filtered disputes for the Disputes tab
  const filteredDisputes = disputes.filter((d) => {
    const matchesSearch =
      d.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ? true : d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Derived distinct Invoices
  const uniqueInvoices = Array.from(
    new Set(disputes.map((d) => d.invoiceNumber))
  ).map((invNum) => {
    const invDisputes = disputes.filter((d) => d.invoiceNumber === invNum);
    return {
      invoiceNumber: invNum,
      vendor: invDisputes[0]?.vendor || '',
      disputeCount: invDisputes.length,
      totalAmount: invDisputes.reduce((sum, d) => sum + d.amount, 0),
      latestDate: invDisputes[0]?.date || '',
    };
  });

  // Derived distinct Vendors
  const uniqueVendors = Array.from(
    new Set(disputes.map((d) => d.vendor))
  ).map((vendorName) => {
    const vDisputes = disputes.filter((d) => d.vendor === vendorName);
    return {
      vendor: vendorName,
      disputeCount: vDisputes.length,
      totalAmount: vDisputes.reduce((sum, d) => sum + d.amount, 0),
    };
  });

  // Reason breakdown for Reports
  const reasonsList: DisputeReason[] = [
    'Wrong Quantity',
    'Wrong Price',
    'Missing Items',
    'Tax Problem',
    'Damaged Goods',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header / Navigation Bar */}
      <header className="bg-blue-600 text-white shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2">
            {/* Project Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-white text-blue-600 font-bold flex items-center justify-center text-lg shadow-sm">
                D
              </div>
              <h1 className="text-lg font-bold tracking-wide">
                SMART DISPUTE MANAGEMENT
              </h1>
            </div>

            {/* Main Action Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-1.5 rounded-md text-sm flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span>+ New Dispute</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-1 overflow-x-auto border-t border-blue-500/60 pt-1 pb-1">
            {['Dashboard', 'Disputes', 'Invoices', 'Vendors', 'Reports'].map(
              (tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-t text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-50 text-blue-700 font-bold shadow-xs'
                        : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                );
              }
            )}
          </nav>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* ==================================================== */}
        {/* 1. DASHBOARD TAB */}
        {/* ==================================================== */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1: Total Disputes */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Disputes
                  </span>
                  <FileText className="w-4 h-4 text-blue-500" />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {totalDisputes}
                </div>
              </div>

              {/* Card 2: Open Disputes */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Open Disputes
                  </span>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-2 text-2xl font-bold text-amber-600">
                  {openDisputes}
                </div>
              </div>

              {/* Card 3: Resolved Disputes */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Resolved Disputes
                  </span>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-2xl font-bold text-emerald-600">
                  {resolvedDisputes}
                </div>
              </div>

              {/* Card 4: Total Amount */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Amount
                  </span>
                  <DollarSign className="w-4 h-4 text-blue-500" />
                </div>
                <div className="mt-2 text-2xl font-bold text-blue-700">
                  ₹{totalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Dashboard Disputes Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Recent Disputes
                  </h2>
                  <p className="text-xs text-slate-500">
                    Current list of invoice disputes logged in the system
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
                >
                  + New Dispute
                </button>
              </div>

              {/* Empty State */}
              {disputes.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">
                    No disputes yet
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Click the button below to add your first invoice dispute.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded shadow-xs transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ New Dispute</span>
                  </button>
                </div>
              ) : (
                /* Simple Table */
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Invoice Number</th>
                        <th className="py-2.5 px-3">Vendor</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {disputes.map((dispute) => (
                        <tr key={dispute.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-blue-700">
                            {dispute.invoiceNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800">
                            {dispute.vendor}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                            ₹{dispute.amount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {dispute.reason}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {dispute.date}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                                dispute.status === 'New'
                                  ? 'bg-blue-100 text-blue-800'
                                  : dispute.status === 'In Progress'
                                  ? 'bg-amber-100 text-amber-800'
                                  : dispute.status === 'Resolved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {dispute.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteDispute(dispute.id)}
                              className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 cursor-pointer"
                              title="Delete dispute"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 2. DISPUTES TAB */}
        {/* ==================================================== */}
        {activeTab === 'Disputes' && (
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  All Disputes
                </h2>
                <p className="text-xs text-slate-500">
                  Manage, track, and update status of all invoice disputes
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer self-start sm:self-auto"
              >
                + New Dispute
              </button>
            </div>

            {/* Search and Status Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by invoice or vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">All ({disputes.length})</option>
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Disputes Table */}
            {filteredDisputes.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                {disputes.length === 0
                  ? 'No disputes yet'
                  : 'No disputes match your search criteria'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Vendor</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDisputes.map((dispute) => (
                      <tr key={dispute.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-blue-700">
                          {dispute.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">
                          {dispute.vendor}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                          ₹{dispute.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {dispute.reason}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate" title={dispute.description}>
                          {dispute.description || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {dispute.date}
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={dispute.status}
                            onChange={(e) =>
                              handleStatusChange(
                                dispute.id,
                                e.target.value as DisputeStatus
                              )
                            }
                            className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-medium text-slate-700"
                          >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteDispute(dispute.id)}
                            className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* 3. INVOICES TAB */}
        {/* ==================================================== */}
        {activeTab === 'Invoices' && (
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Invoices</h2>
              <p className="text-xs text-slate-500">
                Invoices associated with disputes
              </p>
            </div>

            {uniqueInvoices.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  No invoices yet
                </p>
                <p className="text-xs text-slate-400">
                  Add a dispute to automatically track invoice details here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Invoice Number</th>
                      <th className="py-2.5 px-3">Vendor</th>
                      <th className="py-2.5 px-3 text-center">Dispute Count</th>
                      <th className="py-2.5 px-3 text-right">Total Disputed Amount</th>
                      <th className="py-2.5 px-3">Latest Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {uniqueInvoices.map((inv) => (
                      <tr key={inv.invoiceNumber} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-blue-700">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">
                          {inv.vendor}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">
                            {inv.disputeCount}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                          ₹{inv.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {inv.latestDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* 4. VENDORS TAB */}
        {/* ==================================================== */}
        {activeTab === 'Vendors' && (
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Vendors</h2>
              <p className="text-xs text-slate-500">
                Suppliers and vendors with logged disputes
              </p>
            </div>

            {uniqueVendors.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  No vendors yet
                </p>
                <p className="text-xs text-slate-400">
                  Vendors will be listed here once disputes are added.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Vendor Name</th>
                      <th className="py-2.5 px-3 text-center">Total Disputes</th>
                      <th className="py-2.5 px-3 text-right">Total Disputed Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {uniqueVendors.map((vnd) => (
                      <tr key={vnd.vendor} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {vnd.vendor}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">
                            {vnd.disputeCount}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                          ₹{vnd.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* 5. REPORTS TAB */}
        {/* ==================================================== */}
        {activeTab === 'Reports' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">Reports</h2>
                <p className="text-xs text-slate-500">
                  Summary breakdown of disputes by reason and status
                </p>
              </div>

              {disputes.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    No report data yet
                  </p>
                  <p className="text-xs text-slate-400">
                    Add disputes to view the breakdown by reason and status.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* By Reason */}
                  <div className="border border-slate-200 rounded-md p-4 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">
                      Disputes by Reason
                    </h3>
                    <div className="space-y-2 text-xs">
                      {reasonsList.map((r) => {
                        const count = disputes.filter(
                          (d) => d.reason === r
                        ).length;
                        const subtotal = disputes
                          .filter((d) => d.reason === r)
                          .reduce((sum, d) => sum + d.amount, 0);

                        return (
                          <div
                            key={r}
                            className="flex items-center justify-between p-2 bg-white rounded border border-slate-100"
                          >
                            <span className="text-slate-700 font-medium">
                              {r}
                            </span>
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-blue-700">
                                {count}
                              </span>
                              <span className="text-slate-500 font-mono">
                                ₹{subtotal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* By Status */}
                  <div className="border border-slate-200 rounded-md p-4 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">
                      Disputes by Status
                    </h3>
                    <div className="space-y-2 text-xs">
                      {(['New', 'In Progress', 'Resolved', 'Closed'] as DisputeStatus[]).map(
                        (st) => {
                          const count = disputes.filter(
                            (d) => d.status === st
                          ).length;

                          return (
                            <div
                              key={st}
                              className="flex items-center justify-between p-2 bg-white rounded border border-slate-100"
                            >
                              <span className="text-slate-700 font-medium">
                                {st}
                              </span>
                              <span className="font-bold text-blue-700">
                                {count}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Simple College Project Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto text-xs text-slate-500 text-center">
        <p>SMART DISPUTE MANAGEMENT &bull; College Project Frontend Prototype</p>
      </footer>

      {/* ==================================================== */}
      {/* NEW DISPUTE MODAL */}
      {/* ==================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-blue-700 flex items-center space-x-1.5">
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span>New Dispute</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDispute} className="space-y-3 mt-4 text-xs">
              {/* Invoice Number */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-1001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Vendor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Supplies"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as DisputeReason)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Wrong Quantity">Wrong Quantity</option>
                  <option value="Wrong Price">Wrong Price</option>
                  <option value="Missing Items">Missing Items</option>
                  <option value="Tax Problem">Tax Problem</option>
                  <option value="Damaged Goods">Damaged Goods</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter details of dispute..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DisputeStatus)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Save Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
