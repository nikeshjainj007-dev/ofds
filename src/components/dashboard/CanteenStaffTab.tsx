import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ChefHat, 
  ShieldCheck, 
  Phone, 
  Clock, 
  Thermometer, 
  Edit2, 
  Trash2, 
  UserCheck, 
  UserX
} from 'lucide-react';

import { useDashboard } from '../../context/DashboardContext';
import type { CanteenStaff } from '../../types';

export const CanteenStaffTab: React.FC = () => {
  const { 
    canteenStaff, 
    addStaff, 
    updateStaff, 
    deleteStaff, 
    toggleStaffDuty, 
    toggleStaffTempCheck 
  } = useDashboard();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stationFilter, setStationFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<CanteenStaff | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<CanteenStaff['role']>('Sous Chef');
  const [shift, setShift] = useState<CanteenStaff['shift']>('Morning (06:00 AM - 02:00 PM)');
  const [station, setStation] = useState<CanteenStaff['station']>('Thali & Curry Prep');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [medicalFitnessValidUntil, setMedicalFitnessValidUntil] = useState('31 Dec 2026');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Stats
  const totalStaff = canteenStaff.length;
  const onDutyStaff = canteenStaff.filter(s => s.status === 'on_duty').length;
  const tempCheckedStaff = canteenStaff.filter(s => s.dailyTempChecked).length;

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return canteenStaff.filter(s => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (stationFilter !== 'ALL' && s.station !== stationFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesRole = s.role.toLowerCase().includes(q);
        const matchesStation = s.station.toLowerCase().includes(q);
        const matchesPhone = s.phone.includes(q);
        if (!matchesName && !matchesRole && !matchesStation && !matchesPhone) return false;
      }
      return true;
    });
  }, [canteenStaff, statusFilter, stationFilter, searchQuery]);

  const handleOpenAddModal = () => {
    setName('');
    setRole('Sous Chef');
    setShift('Morning (06:00 AM - 02:00 PM)');
    setStation('Thali & Curry Prep');
    setPhone('+91 98');
    setEmail('');
    setAvatar('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80');
    setMedicalFitnessValidUntil('31 Dec 2026');
    setEmergencyContact('');
    setEditingStaff(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (s: CanteenStaff) => {
    setEditingStaff(s);
    setName(s.name);
    setRole(s.role);
    setShift(s.shift);
    setStation(s.station);
    setPhone(s.phone);
    setEmail(s.email);
    setAvatar(s.avatar);
    setMedicalFitnessValidUntil(s.medicalFitnessValidUntil);
    setEmergencyContact(s.emergencyContact);
    setIsAddModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name,
        role,
        shift,
        station,
        phone,
        email,
        avatar: avatar || editingStaff.avatar,
        medicalFitnessValidUntil,
        emergencyContact
      });
    } else {
      addStaff({
        name,
        role,
        shift,
        station,
        phone,
        email,
        status: 'on_duty',
        joinedDate: 'Today',
        avatar: avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        hygieneCertified: true,
        medicalFitnessValidUntil,
        pureVegTrained: true,
        emergencyContact: emergencyContact || '+91 98450 00000',
        dailyTempChecked: true
      });
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Canteen Staff & Kitchen Profiles</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {totalStaff} Members
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Chefs, hygiene inspectors, packaging specialists, duty shifts, and health compliance
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Canteen Staff Profile
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-gray-400">Total Kitchen Roster</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{totalStaff}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Permanent staff</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-emerald-600">Active On Shift</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{onDutyStaff}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Across 6 stations</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-purple-600">Daily Health Audit</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{tempCheckedStaff} / {totalStaff}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Temp & sanitizer checked</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-emerald-600">Satvik Pure Veg Trained</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">100%</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Zero cross-contamination</p>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Duty Status tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Staff' },
              { id: 'on_duty', label: 'On Duty' },
              { id: 'off_duty', label: 'Off Duty' },
              { id: 'on_leave', label: 'On Leave' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Station dropdown */}
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2 rounded-xl outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Kitchen Stations</option>
              <option value="Main Kadai & Tandoor">Main Kadai & Tandoor</option>
              <option value="Thali & Curry Prep">Thali & Curry Prep</option>
              <option value="South Indian Dosai">South Indian Dosai</option>
              <option value="Mithai & Chaat Counter">Mithai & Chaat Counter</option>
              <option value="Hygiene & Quality Control">Hygiene & Quality Control</option>
              <option value="Dispatch & Packaging">Dispatch & Packaging</option>
            </select>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            {/* Top row */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-100 shadow-sm"
                  />
                  <div>
                    <h4 className="text-sm font-black text-gray-900">{staff.name}</h4>
                    <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5">
                      {staff.role}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  staff.status === 'on_duty' ? 'bg-emerald-100 text-emerald-800' :
                  staff.status === 'off_duty' ? 'bg-gray-100 text-gray-600' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {staff.status === 'on_duty' ? 'On Duty' : staff.status === 'off_duty' ? 'Off Duty' : 'On Leave'}
                </span>
              </div>

              {/* Station, Shift & Details */}
              <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5 font-bold text-gray-500">
                    <ChefHat className="w-3.5 h-3.5 text-orange-500" />
                    Station:
                  </span>
                  <span className="font-semibold text-gray-900 text-right">{staff.station}</span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5 font-bold text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    Shift:
                  </span>
                  <span className="text-gray-700 text-right font-medium">{staff.shift}</span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5 font-bold text-gray-500">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    Phone:
                  </span>
                  <a href={`tel:${staff.phone}`} className="font-bold text-gray-800 hover:text-emerald-700">
                    {staff.phone}
                  </a>
                </div>

                {/* Health & Hygiene Badges */}
                <div className="pt-2 border-t border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Medical Fitness:</span>
                    <span className="font-semibold text-gray-800">{staff.medicalFitnessValidUntil}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Daily Temp & Sanitized:</span>
                    <button
                      onClick={() => toggleStaffTempCheck(staff.id)}
                      className={`font-bold px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                        staff.dailyTempChecked
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      <Thermometer className="w-3 h-3" />
                      {staff.dailyTempChecked ? 'Checked 98.4°F ✓' : 'Pending Audit ✕'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => toggleStaffDuty(staff.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 text-xs ${
                  staff.status === 'on_duty'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {staff.status === 'on_duty' ? (
                  <>
                    <UserX className="w-3.5 h-3.5" /> End Shift
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Start Shift
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(staff)}
                  className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit Profile"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove staff profile for ${staff.name}?`)) {
                      deleteStaff(staff.id);
                    }
                  }}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Staff"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Add / Edit Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in zoom-in-95">
            <div className="p-6 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">{editingStaff ? 'Edit Staff Profile' : 'Add Canteen Staff Profile'}</h3>
                <p className="text-xs text-emerald-200">Satvik Pure Veg Canteen Kitchen Team</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white bg-black/20 p-2 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chef Radhey Shyam"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Role / Designation</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-medium"
                  >
                    <option value="Head Chef">Head Chef</option>
                    <option value="Sous Chef">Sous Chef</option>
                    <option value="Kitchen Manager">Kitchen Manager</option>
                    <option value="Hygiene Inspector">Hygiene Inspector</option>
                    <option value="Packing Specialist">Packing Specialist</option>
                    <option value="Billing Desk">Billing Desk</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Shift</label>
                  <select
                    value={shift}
                    onChange={(e: any) => setShift(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-medium"
                  >
                    <option value="Morning (06:00 AM - 02:00 PM)">Morning (06AM - 02PM)</option>
                    <option value="Evening (02:00 PM - 10:00 PM)">Evening (02PM - 10PM)</option>
                    <option value="Full Day (09:00 AM - 09:00 PM)">Full Day (09AM - 09PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Kitchen Station</label>
                <select
                  value={station}
                  onChange={(e: any) => setStation(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-medium"
                >
                  <option value="Main Kadai & Tandoor">Main Kadai & Tandoor</option>
                  <option value="Thali & Curry Prep">Thali & Curry Prep</option>
                  <option value="South Indian Dosai">South Indian Dosai</option>
                  <option value="Mithai & Chaat Counter">Mithai & Chaat Counter</option>
                  <option value="Hygiene & Quality Control">Hygiene & Quality Control</option>
                  <option value="Dispatch & Packaging">Dispatch & Packaging</option>
                </select>
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
                  <label className="block font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="chef@satvikbite.com"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Medical Fitness Valid Until</label>
                  <input
                    type="text"
                    value={medicalFitnessValidUntil}
                    onChange={(e) => setMedicalFitnessValidUntil(e.target.value)}
                    placeholder="31 Dec 2026"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+91 98450 99887 (Family)"
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

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Staff conforms to FSSAI Pure Vegetarian Food Safety Standards & hygiene protocols.</span>
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
                  {editingStaff ? 'Save Profile' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
