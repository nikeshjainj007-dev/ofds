import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  Printer, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import type { PaymentRecord } from '../../types';

export const PaymentsTab: React.FC = () => {
  const { payments, refundPayment, verifyPayment } = useDashboard();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  // Financial calculations
  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'REFUNDED')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  const razorpayShare = payments
    .filter((p) => p.status === 'PAID' && (p.method === 'Razorpay' || p.method === 'Credit/Debit Card'))
    .reduce((sum, p) => sum + p.amount, 0);

  const upiShare = payments
    .filter((p) => p.status === 'PAID' && p.method === 'UPI')
    .reduce((sum, p) => sum + p.amount, 0);


  // Filtered transactions
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesOrder = p.orderId.toLowerCase().includes(q);
        const matchesRef = p.transactionRef.toLowerCase().includes(q);
        const matchesCust = p.customerName.toLowerCase().includes(q);
        if (!matchesOrder && !matchesRef && !matchesCust) return false;
      }
      return true;
    });
  }, [payments, filterStatus, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Transaction ID,Order ID,Customer,Amount (INR),Method,Status,Ref,Timestamp'];
    const rows = payments.map(
      p => `${p.id},${p.orderId},"${p.customerName}",${p.amount},${p.method},${p.status},${p.transactionRef},"${p.timestamp}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satvikbite-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Financial Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Payments & Revenue Analytics</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {payments.length} Transactions
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Razorpay gateway settlement, instant UPI collections, counter cash, and refunds
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="self-start sm:self-auto px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Financial Report (CSV)
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Settled */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
            <span>Settled Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">₹{totalPaid.toLocaleString()}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Successfully captured</p>
        </div>

        {/* Razorpay Online */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
            <span>Razorpay Cards & Netbanking</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">₹{razorpayShare.toLocaleString()}</div>
          <p className="text-[11px] text-gray-400 mt-1">Direct bank verification</p>
        </div>

        {/* UPI Volume */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
            <span>UPI Instant Settlement</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">₹{upiShare.toLocaleString()}</div>
          <p className="text-[11px] text-gray-400 mt-1">GPay, PhonePe, Paytm</p>
        </div>

        {/* Refunds / Pending */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
            <span>Refunds & Adjustments</span>
            <RotateCcw className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">₹{totalRefunded.toLocaleString()}</div>
          <p className="text-[11px] text-gray-400 mt-1">Pending verification: ₹{totalPending}</p>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Transactions' },
              { id: 'PAID', label: 'Paid & Settled' },
              { id: 'PENDING', label: 'Pending Verification' },
              { id: 'REFUNDED', label: 'Refunded' },
              { id: 'FAILED', label: 'Failed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === tab.id
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order #, Transaction Ref..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. Transactions Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Transaction Ref / Order</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No transactions match the criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-gray-900">{txn.orderId}</div>
                      <div className="text-[11px] text-gray-400 truncate max-w-[180px]">{txn.transactionRef}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-gray-800">{txn.customerName}</div>
                      {txn.customerPhone && <div className="text-[11px] text-gray-400">{txn.customerPhone}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-sm font-black text-gray-900">₹{txn.amount}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {txn.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        txn.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        txn.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        txn.status === 'REFUNDED' ? 'bg-rose-100 text-rose-800' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          txn.status === 'PAID' ? 'bg-emerald-600' :
                          txn.status === 'PENDING' ? 'bg-amber-600' :
                          txn.status === 'REFUNDED' ? 'bg-rose-600' : 'bg-gray-600'
                        }`}></span>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {txn.timestamp}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedReceipt(txn)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Receipt
                      </button>

                      {txn.status === 'PAID' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Initiate refund of ₹${txn.amount} for Order ${txn.orderId}?`)) {
                              refundPayment(txn.id);
                            }
                          }}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          Refund
                        </button>
                      )}

                      {txn.status === 'PENDING' && (
                        <button
                          onClick={() => verifyPayment(txn.id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          Verify & Settle
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Payment Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100 animate-in zoom-in-95">
            <div className="p-6 bg-emerald-800 text-white text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-white/20 mx-auto flex items-center justify-center text-white mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black">Payment Receipt</h3>
              <p className="text-xs text-emerald-200">SatvikBite Pure Veg Delivery</p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center py-2 border-b border-gray-100">
                <div className="text-3xl font-black text-gray-900">₹{selectedReceipt.amount}</div>
                <div className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">
                  {selectedReceipt.status}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Order ID:</span>
                  <strong className="text-gray-900">#{selectedReceipt.orderId}</strong>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Customer:</span>
                  <strong className="text-gray-900">{selectedReceipt.customerName}</strong>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Method:</span>
                  <strong className="text-gray-900">{selectedReceipt.method}</strong>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Gateway Ref:</span>
                  <span className="font-mono text-[10px] text-gray-700">{selectedReceipt.transactionRef}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Date & Time:</span>
                  <span className="text-gray-700">{selectedReceipt.timestamp}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST Tax (Included):</span>
                  <span className="text-gray-700">₹{Math.round(selectedReceipt.amount * 0.05)} (5%)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2 border border-emerald-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Verified 100% Satvik Pure Veg Merchant Account</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
