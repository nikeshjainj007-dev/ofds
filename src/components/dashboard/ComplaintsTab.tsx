import React, { useState } from 'react';
import {
  CheckCircle2,
  Search,
  Building,
  CreditCard
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useToast } from '../../context/ToastContext';
import type { Complaint } from '../../types';

export const ComplaintsTab: React.FC = () => {
  const { complaints, updateComplaintStatus } = useDashboard();
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<'all' | Complaint['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.orderId.toLowerCase().includes(q) ||
        (c.customerUsn && c.customerUsn.toLowerCase().includes(q)) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (id: string, newStatus: Complaint['status'], note?: string) => {
    updateComplaintStatus(id, newStatus, note);
    showToast(`Complaint #${id} updated to "${newStatus}"`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Customer Food Complaints</span>
            <span className="text-xs font-black bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
              {complaints.filter((c) => c.status !== 'Resolved').length} Pending
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Resolve student complaints regarding food quality, delayed floor delivery, or cold food (Phase 8)
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search complaint, USN, Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-rose-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'Pending', 'Investigating', 'Resolved', 'Refunded'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Complaints' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-900 text-sm">No complaints found</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            All customer issues have been addressed or no complaints match current filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 hover:border-rose-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                    #{c.id}
                  </span>
                  <div>
                    <div className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                      <span>{c.customerName}</span>
                      {c.customerUsn && (
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                          USN: {c.customerUsn}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                      <span>Order: {c.orderId}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-gray-400" /> {c.pickupZone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {c.category}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'Refunded'
                        ? 'bg-blue-100 text-blue-800'
                        : c.status === 'Investigating'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed">
                <strong>Complaint:</strong> {c.description}
                {c.resolutionNote && (
                  <div className="mt-2 pt-2 border-t border-gray-200/60 text-emerald-800 font-semibold">
                    ✓ Resolution Note: {c.resolutionNote}
                  </div>
                )}
              </div>

              {/* Action Controls for Canteen Staff */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-gray-400">
                  Logged: {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <div className="flex items-center gap-2">
                  {c.status !== 'Investigating' && c.status !== 'Resolved' && (
                    <button
                      onClick={() => handleStatusChange(c.id, 'Investigating', 'Kitchen supervisor checking batch preparation')}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Investigate
                    </button>
                  )}

                  {c.status !== 'Resolved' && (
                    <button
                      onClick={() => handleStatusChange(c.id, 'Resolved', 'Kitchen contacted student; fresh replacement delivered')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}

                  {c.status !== 'Refunded' && (
                    <button
                      onClick={() => handleStatusChange(c.id, 'Refunded', 'Full Razorpay refund credited to student account')}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Issue Refund</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
