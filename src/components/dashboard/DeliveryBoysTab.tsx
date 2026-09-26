import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Star, 
  BatteryCharging, 
  Edit2, 
  Trash2, 
  UserCheck, 
  UserX,
  ExternalLink
} from 'lucide-react';

import { useDashboard } from '../../context/DashboardContext';
import type { DeliveryRider } from '../../types';

export const DeliveryBoysTab: React.FC = () => {
  const { 
    riders, 
    addRider, 
    updateRider, 
    deleteRider, 
    toggleRiderStatus,
    setActiveTrackingOrderId,
    setActiveTab
  } = useDashboard();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<DeliveryRider | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleType, setVehicleType] = useState<DeliveryRider['vehicleType']>('EV Scooter');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [currentZone, setCurrentZone] = useState('Indiranagar & Central Hub');
  const [avatar, setAvatar] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Fleet stats
  const totalRiders = riders.length;
  const availableRiders = riders.filter(r => r.status === 'available').length;
  const onDeliveryRiders = riders.filter(r => r.status === 'on_delivery').length;
  const offlineRiders = riders.filter(r => r.status === 'offline').length;
  const totalDelivered = riders.reduce((acc, r) => acc + r.totalDeliveries, 0);

  // Filtered riders
  const filteredRiders = useMemo(() => {
    return riders.filter(r => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesPhone = r.phone.includes(q);
        const matchesVeh = r.vehicleNumber.toLowerCase().includes(q);
        const matchesZone = r.currentZone.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesVeh && !matchesZone) return false;
      }
      return true;
    });
  }, [riders, statusFilter, searchQuery]);

  const handleOpenAddModal = () => {
    setName('');
    setPhone('');
    setEmail('');
    setVehicleType('EV Scooter');
    setVehicleNumber('KA 03 ');
    setCurrentZone('Indiranagar 100ft Road');
    setAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80');
    setEmergencyContact('');
    setEditingRider(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (r: DeliveryRider) => {
    setEditingRider(r);
    setName(r.name);
    setPhone(r.phone);
    setEmail(r.email || '');
    setVehicleType(r.vehicleType);
    setVehicleNumber(r.vehicleNumber);
    setCurrentZone(r.currentZone);
    setAvatar(r.avatar);
    setEmergencyContact(r.emergencyContact);
    setIsAddModalOpen(true);
  };

  const handleSaveRider = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRider) {
      updateRider(editingRider.id, {
        name,
        phone,
        email,
        vehicleType,
        vehicleNumber,
        currentZone,
        avatar: avatar || editingRider.avatar,
        emergencyContact
      });
    } else {
      addRider({
        name,
        phone,
        email,
        vehicleType,
        vehicleNumber,
        currentZone,
        status: 'available',
        rating: 5.0,
        totalDeliveries: 0,
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        joinedDate: 'Today',
        batteryLevel: 98,
        isPureVegInsulatedBagVerified: true,
        emergencyContact: emergencyContact || '+91 98450 00000'
      });
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Delivery Fleet & Riders</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {totalRiders} Personnel
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage delivery boys, EV battery status, real-time duty toggle, and contact details
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Delivery Boy
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-gray-400">Total Fleet</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{totalRiders}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">{totalDelivered} trips completed</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-emerald-600">🟢 Ready For Dispatch</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{availableRiders}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">At kitchen depot</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-amber-600">🟡 Out on Trip</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{onDeliveryRiders}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Active delivery runs</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-gray-400">⚪ Offline</div>
          <div className="text-2xl font-black text-gray-500 mt-1">{offlineRiders}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Off duty</p>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Fleet', count: riders.length },
              { id: 'available', label: 'Ready (Available)', count: availableRiders },
              { id: 'on_delivery', label: 'On Trip', count: onDeliveryRiders },
              { id: 'offline', label: 'Offline', count: offlineRiders },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Rider name, Phone, Vehicle..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. Riders Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRiders.map((rider) => (
          <div
            key={rider.id}
            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            {/* Top row */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rider.avatar}
                    alt={rider.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-100 shadow-sm"
                  />
                  <div>
                    <h4 className="text-sm font-black text-gray-900">{rider.name}</h4>
                    <p className="text-[11px] text-gray-500">{rider.vehicleType} • {rider.vehicleNumber}</p>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{rider.rating}</span>
                      <span className="text-gray-400 font-normal">({rider.totalDeliveries} runs)</span>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  rider.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                  rider.status === 'on_delivery' ? 'bg-amber-100 text-amber-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {rider.status === 'available' ? 'Ready' : rider.status === 'on_delivery' ? 'On Trip' : 'Offline'}
                </span>
              </div>

              {/* Details & Telemetry */}
              <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    Phone:
                  </span>
                  <a href={`tel:${rider.phone}`} className="font-bold text-gray-800 hover:text-emerald-700">
                    {rider.phone}
                  </a>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    Zone:
                  </span>
                  <span className="font-medium text-gray-800 truncate max-w-[150px]">
                    {rider.currentZone}
                  </span>
                </div>

                {rider.batteryLevel !== undefined && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                      EV Battery:
                    </span>
                    <span className="font-bold text-emerald-700">{rider.batteryLevel}%</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-1 border-t border-gray-200">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Pure Veg Bag Certified:
                  </span>
                  <span className="font-bold">Verified</span>
                </div>

                {rider.activeOrderId && (
                  <div className="pt-1 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] text-amber-700 font-bold">Active Trip:</span>
                    <button
                      onClick={() => {
                        setActiveTrackingOrderId(rider.activeOrderId!);
                        setActiveTab('tracking');
                      }}
                      className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Track #{rider.activeOrderId}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => toggleRiderStatus(rider.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 text-xs ${
                  rider.status === 'offline'
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rider.status === 'offline' ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Put Online
                  </>
                ) : (
                  <>
                    <UserX className="w-3.5 h-3.5" /> Set Offline
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(rider)}
                  className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit Rider"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove rider ${rider.name}?`)) {
                      deleteRider(rider.id);
                    }
                  }}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Rider"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Add / Edit Rider Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in zoom-in-95">
            <div className="p-6 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">{editingRider ? 'Edit Rider Profile' : 'Add New Delivery Boy'}</h3>
                <p className="text-xs text-emerald-200">Satvik Pure Veg Insulated Delivery Fleet</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white bg-black/20 p-2 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRider} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e: any) => setVehicleType(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-medium"
                  >
                    <option value="EV Scooter">EV Scooter (Electric)</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Bicycle">Eco Bicycle</option>
                    <option value="Electric Cargo">Electric Cargo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Vehicle Reg Number</label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="KA 03 HY 8821"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Operating Zone</label>
                  <input
                    type="text"
                    required
                    value={currentZone}
                    onChange={(e) => setCurrentZone(e.target.value)}
                    placeholder="Indiranagar 100ft Road"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Profile Photo URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+91 98450 99999 (Brother/Family)"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Rider receives standard insulated food container with 100% pure veg security stickers.</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  {editingRider ? 'Save Changes' : 'Register Rider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
