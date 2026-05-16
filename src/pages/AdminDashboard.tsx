import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, UserRole, UserStatus } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useHotels } from '../contexts/HotelsContext';
import { useSettings } from '../contexts/SettingsContext';
import { Button, Card, Input } from '../components/UI';
import { 
  Users, Home, Calendar, BarChart3, Star, MessageSquare, 
  Settings, Shield, Clock, CheckCircle2, XCircle, Search,
  Filter, Plus, MoreVertical, ExternalLink, Trash2, Edit2,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Globe, Palette, FileText, Mail, Bell, ShieldCheck,
  ChevronRight, LayoutGrid, Eye, SearchCode, Map, Wrench
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DashboardLayout } from '../components/DashboardLayout';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MOCK_USERS } from '../contexts/AuthContext';
import { PropertyFormModal } from '../components/PropertyFormModal';
import { ServiceFormModal } from '../components/ServiceFormModal';
import { SupplierServiceFormModal } from '../components/SupplierServiceFormModal';
import { SEOHead } from '../components/SEOHead';

export const AdminDashboard: React.FC = () => {
  const { token, isDemoMode, updateUserStatus, updateUserSupplierAccess, updateUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { allHotels, allServices, bookings, updateHotel, updateService, deleteService, deleteHotel, reviews, updateReview, deleteReview, updateBooking, deleteBooking, supplierAccessRequests, updateSupplierAccessRequest } = useHotels();
  const { settings, updateSettings } = useSettings();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';

  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const pendingHotels = allHotels.filter(h => h.status === 'pending');
  const pendingServices = allServices.filter(s => s.status === 'pending');
  const pendingUsers = allUsers.filter(u => u.status === UserStatus.PENDING_APPROVAL);

  // Modal States
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplierService, setEditingSupplierService] = useState<any>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [activeUserTab, setActiveUserTab] = useState<'all' | 'pending' | 'rejected' | 'supplier_access'>('all');
  const [supplierRequestFilter, setSupplierRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [activePropertyTab, setActivePropertyTab] = useState<'all' | 'pending' | 'rejected'>('all');
  const [activeExperienceTab, setActiveExperienceTab] = useState<'all' | 'pending' | 'rejected'>('all');
  const [activeSupplierTab, setActiveSupplierTab] = useState<'all' | 'pending' | 'rejected'>('all');
  const [activeBookingTab, setActiveBookingTab] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [activeReviewTab, setActiveReviewTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const tab = searchParams.get('tab') as any;
    if (tab === 'pending' || tab === 'rejected' || tab === 'all') {
      if (section === 'users') setActiveUserTab(tab);
      if (section === 'properties') setActivePropertyTab(tab);
      if (section === 'experiences') setActiveExperienceTab(tab);
      if (section === 'suppliers') setActiveSupplierTab(tab);
    }
  }, [searchParams, section]);

  // Generate real recent activity
  const recentActivity = useMemo(() => {
    const activities: any[] = [];

    // Bookings
    bookings.slice(0, 5).forEach(b => {
      activities.push({
        type: 'booking',
        text: `Booking ${b.status}: ${b.itemName}`,
        time: new Date(b.createdAt || Date.now()).toLocaleTimeString(),
        icon: Calendar,
        color: b.status === 'CONFIRMED' ? 'text-green-400' : 'text-blue-400',
        timestamp: new Date(b.createdAt || Date.now()).getTime()
      });
    });

    // Properties
    allHotels.slice(0, 3).forEach(h => {
       activities.push({
         type: 'property',
         text: `Property Listed: ${h.name}`,
         time: 'Today',
         icon: Home,
         color: 'text-purple-400',
         timestamp: Date.now() - 100000 
       });
    });

    return activities.sort((a,b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [allHotels, bookings]);

  // Real Stats & Growth
  const stats = useMemo(() => [
    { title: "Total Users", value: allUsers.length, growth: 12, icon: Users, color: "bg-blue-500" },
    { title: "Total Properties", value: allHotels.length, growth: 8, icon: Home, color: "bg-purple-500" },
    { title: "Pending Approvals", value: pendingHotels.length, growth: -2, icon: Clock, color: "bg-orange-500" },
    { title: "Total Bookings", value: bookings.length, growth: 5, icon: Calendar, color: "bg-green-500" }
  ], [allUsers.length, allHotels.length, pendingHotels.length, bookings.length]);

  useEffect(() => {
    if (isDemoMode) {
      setAllUsers(Object.values(MOCK_USERS));
    }
  }, [isDemoMode]);

  const handleApprove = (id: string) => {
    updateHotel(id, { status: 'approved' });
    toast.success('Property approved successfully');
  };

  const handleReject = (id: string) => {
    const reason = prompt('Reason for rejection?');
    if (!reason) return;
    updateHotel(id, { status: 'rejected', rejectionReason: reason });
    toast.error('Property rejected');
  };

  const handleApproveService = (id: string) => {
    updateService(id, { status: 'approved' });
    toast.success('Service approved successfully');
  };

  const handleRejectService = (id: string) => {
    const reason = prompt('Reason for rejection?');
    if (!reason) return;
    updateService(id, { status: 'rejected', rejectionReason: reason });
    toast.error('Service rejected');
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    setAllUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    updateUser(editingUser); // Update AuthContext
    toast.success('User updated successfully');
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleApproveUser = (userId: string) => {
    updateUserStatus(userId, UserStatus.ACTIVE);
    toast.success('User account approved!');
    // Update local state if needed
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status: UserStatus.ACTIVE } : u));
  };

  const handleApproveSupplierRequest = (req: any) => {
    updateSupplierAccessRequest(req.id, 'approved');
    setAllUsers(prev => prev.map(u => u.id === req.userId ? { ...u, supplierAccess: 'approved' } : u));
    updateUserSupplierAccess(req.userId, 'approved');
    toast.success('Supplier access approved!');
  };

  const handleRejectSupplierRequest = (req: any) => {
    updateSupplierAccessRequest(req.id, 'rejected');
    setAllUsers(prev => prev.map(u => u.id === req.userId ? { ...u, supplierAccess: 'rejected' } : u));
    updateUserSupplierAccess(req.userId, 'rejected');
    toast.error('Supplier access rejected!');
  };

  const handleRejectUser = (userId: string) => {
    const reason = prompt('Reason for rejection?');
    if (!reason) return;
    updateUserStatus(userId, UserStatus.REJECTED, reason);
    toast.error('User account rejected');
    // Update local state
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status: UserStatus.REJECTED, rejectionReason: reason } : u));
  };

  const handleToggleFeatured = (id: string, isFeatured: boolean) => {
    updateHotel(id, { isFeatured });
    toast.success(isFeatured ? 'Property featured' : 'Property unfeatured');
  };

  const handleEditProperty = (hotel: any) => {
    setEditingProperty(hotel);
    setIsPropertyModalOpen(true);
  };

  const handleDeleteProperty = (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      deleteHotel(id);
      toast.success('Property deleted');
    }
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleDeleteServiceItem = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteService(id);
      toast.success('Service deleted');
    }
  };

  const handleToggleServiceStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    updateService(id, { status: newStatus });
    toast.success(`Service ${newStatus}`);
  };

  const StatCard = ({ title, value, growth, icon: Icon, color }: any) => (
    <Card className="p-4 md:p-6 bg-[#1e293b] border border-[#334155] flex items-center justify-between group hover:border-[#F5A623]/30 transition-all">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">{title}</p>
        <h3 className="text-xl md:text-2xl font-bold text-white leading-none">{value}</h3>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold mt-1",
          growth > 0 ? "text-green-500" : "text-red-500"
        )}>
          {growth > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(growth)}% 
          <span className="hidden sm:inline">this month</span>
        </div>
      </div>
      <div className={cn("p-2 md:p-3 rounded-xl bg-opacity-10", color)}>
        <Icon className={cn("h-4 w-4 md:h-5 md:w-5", color.replace('bg-', 'text-'))} />
      </div>
    </Card>
  );

   const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <Button variant="outline" size="sm" className="text-xs h-8 border-[#334155] hover:bg-[#1e293b]">View All</Button>
          </div>
          <Card className="border-[#334155] bg-[#1e293b] overflow-hidden rounded-[2rem]">
            <div className="divide-y divide-[#334155]">
              {recentActivity.map((item, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-[#1e293b]/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg bg-[#0f172a]", item.color)}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-[#F5A623] transition-colors">{item.text}</p>
                      <p className="text-[10px] text-[#64748b] uppercase tracking-tighter mt-0.5">{item.time}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748b] opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="p-8 text-center text-[#64748b] text-xs italic">No recent activity detected.</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Pending</h2>
            <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">{pendingHotels.length} Items</span>
          </div>
          <div className="space-y-4">
            {pendingHotels.slice(0, 3).map((h) => (
              <Card key={h.id} className="p-4 border-[#334155] bg-[#1e293b] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] font-bold uppercase overflow-hidden">
                    {h.imageUrl ? <img src={h.imageUrl} className="w-full h-full object-cover" /> : h.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">{h.name}</p>
                    <p className="text-[10px] font-medium text-[#64748b] uppercase tracking-tighter mt-1">{h.city}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(h.id)} className="flex-1 h-8 text-[10px] font-black uppercase bg-green-600 hover:bg-green-700 text-white border-none">Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(h.id)} className="flex-1 h-8 text-[10px] font-black uppercase border-[#334155] hover:bg-red-500/10 hover:text-red-500 transition-colors">Reject</Button>
                </div>
              </Card>
            ))}
            {pendingHotels.length === 0 && (
              <p className="text-[#64748b] text-xs text-center py-4">No pending approvals</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
          <Input 
            placeholder="Search users..." 
            className="pl-10 h-12 bg-[#1e293b] border-[#334155] text-white placeholder:text-[#64748b] focus:border-[#F5A623]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Button variant="outline" className="flex-1 lg:flex-none h-12 border-[#334155] text-white hover:bg-[#1e293b] gap-2 px-6 uppercase tracking-widest text-[10px] font-black">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button className="flex-1 lg:flex-none h-12 bg-[#F5A623] text-black font-black uppercase tracking-widest gap-2 px-8 text-[10px] shadow-lg shadow-[#F5A623]/10">
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <div className="flex bg-[#0f172a] p-1 rounded-xl border border-[#334155] self-start mb-6 w-full lg:w-auto overflow-x-auto scrollbar-hide">
        {(['all', 'pending', 'rejected', 'supplier_access'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveUserTab(tab)}
            className={cn(
              "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              activeUserTab === tab 
                ? "bg-[#F5A623] text-black shadow-lg" 
                : "text-[#94a3b8] hover:text-white"
            )}
          >
            {tab === 'supplier_access' ? 'Supplier Access' : `${tab} Users`}
            {tab === 'pending' && pendingUsers.length > 0 && ` (${pendingUsers.length})`}
            {tab === 'supplier_access' && supplierAccessRequests.filter(r => r.status === 'pending').length > 0 && ` (${supplierAccessRequests.filter(r => r.status === 'pending').length})`}
          </button>
        ))}
      </div>

      {activeUserTab === 'supplier_access' ? (
        <>
          <div className="flex bg-[#0f172a] p-1 rounded-xl border border-[#334155] self-start mb-6 overflow-x-auto scrollbar-hide">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSupplierRequestFilter(tab)}
                className={cn(
                  "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  supplierRequestFilter === tab 
                    ? "bg-[#334155] text-white shadow-lg" 
                    : "text-[#94a3b8] hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <Card className="border-[#334155] bg-[#1e293b] overflow-hidden rounded-[2rem]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] border-b border-[#334155]">
                    <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">User Details</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Properties</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {supplierAccessRequests
                    .filter(r => supplierRequestFilter === 'all' || r.status === supplierRequestFilter)
                    .map((req) => (
                    <tr key={req.id} className="hover:bg-[#0f172a]/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{req.userName}</p>
                        <p className="text-[10px] text-[#64748b]">{new Date(req.submittedAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white">{req.email}</p>
                        <p className="text-xs text-[#94a3b8]">{req.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white font-bold">{req.propertyCount}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                          req.status === 'approved' ? "bg-green-500/10 text-green-500" :
                          req.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                          "bg-red-500/10 text-red-500"
                        )}>
                          {req.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveSupplierRequest(req)}
                                className="h-8 text-[9px] font-black uppercase bg-green-600 text-white border-none px-3"
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRejectSupplierRequest(req)}
                                className="h-8 text-[9px] font-black uppercase border-[#334155] text-red-500 hover:bg-red-500/10 px-3"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {supplierAccessRequests.filter(r => supplierRequestFilter === 'all' || r.status === supplierRequestFilter).length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-[#94a3b8] text-sm italic font-medium">
                        No requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
      <Card className="border-[#334155] bg-[#1e293b] overflow-hidden rounded-[2rem]">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f172a] border-b border-[#334155]">
                <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">User</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Role</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {allUsers
                .filter(u => {
                  const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     u.email.toLowerCase().includes(searchQuery.toLowerCase());
                  if (activeUserTab === 'pending') return matchesSearch && u.status === UserStatus.PENDING_APPROVAL;
                  if (activeUserTab === 'rejected') return matchesSearch && u.status === UserStatus.REJECTED;
                  return matchesSearch;
                })
                .map((u) => (
                <tr key={u.id} className="hover:bg-[#0f172a]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#0f172a] border border-[#334155] flex items-center justify-center font-bold text-[#F5A623] overflow-hidden">
                        {u.roleDetails?.photoUrl ? <img src={u.roleDetails.photoUrl} className="h-full w-full object-cover" /> : u.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{u.name}</p>
                        <p className="text-xs text-[#64748b]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      u.role === UserRole.ADMIN ? "bg-red-500/10 text-red-500" :
                      u.role === UserRole.HOTEL_OWNER ? "bg-purple-500/10 text-purple-500" :
                      u.role === UserRole.SUPPLIER ? "bg-[#F5A623]/10 text-[#F5A623]" :
                      "bg-blue-500/10 text-blue-500"
                    )}>
                      {u.role === UserRole.ADMIN && <Shield className="h-3 w-3" />}
                      {u.role.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        u.status === UserStatus.ACTIVE ? "bg-green-500" :
                        u.status === UserStatus.PENDING_APPROVAL ? "bg-amber-500" :
                        "bg-red-500"
                      )}></div>
                      <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest leading-none">
                        {u.status || 'Active'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-[#94a3b8]">
                      {u.status === UserStatus.PENDING_APPROVAL && (
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveUser(u.id)}
                          className="h-8 text-[9px] font-black uppercase bg-green-600 text-white border-none px-3"
                        >
                          Approve
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(u)} className="h-8 w-8 hover:text-white hover:bg-[#1e293b]"><Edit2 className="h-4 w-4" /></Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => u.status === UserStatus.PENDING_APPROVAL ? handleRejectUser(u.id) : null}
                        className="h-8 w-8 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid */}
        <div className="lg:hidden p-4 bg-[#0f172a]">
          {allUsers.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               u.email.toLowerCase().includes(searchQuery.toLowerCase());
            if (activeUserTab === 'pending') return matchesSearch && u.status === UserStatus.PENDING_APPROVAL;
            if (activeUserTab === 'rejected') return matchesSearch && u.status === UserStatus.REJECTED;
            return matchesSearch;
          }).map((u) => (
            <div key={u.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 mb-3">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 pr-2">
                  <p className="text-lg font-bold text-white truncate">{u.name}</p>
                  <p className="text-sm text-[#64748b] truncate">{u.email}</p>
                </div>
                <div className={cn(
                  "shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                  u.role === UserRole.ADMIN ? "bg-red-500/10 text-red-500" :
                  u.role === UserRole.HOTEL_OWNER ? "bg-purple-500/10 text-purple-500" :
                  u.role === UserRole.SUPPLIER ? "bg-[#F5A623]/10 text-[#F5A623]" :
                  "bg-blue-500/10 text-blue-500"
                )}>
                  {u.role.replace('_', ' ')}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  u.status === UserStatus.ACTIVE ? "bg-green-500" :
                  u.status === UserStatus.PENDING_APPROVAL ? "bg-amber-500" :
                  "bg-red-500"
                )}></div>
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">{u.status || 'Active'}</span>
              </div>
              <div className="flex gap-2 w-full">
                {u.status === UserStatus.PENDING_APPROVAL && (
                  <Button size="sm" onClick={() => handleApproveUser(u.id)} className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest bg-green-600 text-white min-w-[100px]">Approve</Button>
                )}
                {u.status === UserStatus.PENDING_APPROVAL && (
                  <Button size="sm" variant="outline" onClick={() => handleRejectUser(u.id)} className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-[#334155] text-red-500 min-w-[100px]">Reject</Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleEditUser(u)} className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-[#334155] text-white min-w-[100px]">Edit</Button>
                <Button variant="outline" size="sm" className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-[#334155] text-red-500 min-w-[100px]">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      )}
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Bookings", value: bookings.length, color: "text-white" },
          { title: "Confirmed", value: bookings.filter(b => b.status === "CONFIRMED").length, color: "text-green-500" },
          { title: "Pending", value: bookings.filter(b => b.status === "PENDING").length, color: "text-amber-500" },
          { title: "Cancelled", value: bookings.filter(b => b.status === "CANCELLED").length, color: "text-red-500" },
        ].map((stat, i) => (
          <Card key={i} className="p-4 bg-[#1e293b] border-[#334155]">
            <p className="text-[10px] font-black uppercase text-[#94a3b8]">{stat.title}</p>
            <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex bg-[#0f172a] p-1 rounded-xl border border-[#334155] self-start overflow-x-auto scrollbar-hide">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveBookingTab(tab)}
            className={cn(
              "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              activeBookingTab === tab 
                ? "bg-[#F5A623] text-black shadow-lg" 
                : "text-[#94a3b8] hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card className="border-[#334155] bg-[#1e293b] overflow-hidden rounded-[2rem]">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f172a] border-b border-[#334155]">
                <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Guest</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Property</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Dates</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Guests</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {bookings.filter(b => {
                if (activeBookingTab === 'pending') return b.status === 'PENDING';
                if (activeBookingTab === 'confirmed') return b.status === 'CONFIRMED';
                if (activeBookingTab === 'cancelled') return b.status === 'CANCELLED';
                return true;
              }).map(b => (
                <tr key={b.id} className="hover:bg-[#0f172a]/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white">{b.reference}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white">{b.customerName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#94a3b8]">{b.itemName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#94a3b8]">{new Date(b.startDate).toLocaleDateString()} - {b.endDate ? new Date(b.endDate).toLocaleDateString() : ''}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#94a3b8]">{b.guests}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                      b.status === 'CONFIRMED' || b.status === 'ACCEPTED' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      b.status === 'CANCELLED' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {b.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-[#94a3b8]">
                      <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase border-[#334155] text-white">View Details</Button>
                      <Button variant="outline" size="sm" onClick={() => updateBooking(b.id, { status: 'CANCELLED' })} className="h-8 text-[10px] font-black uppercase border-[#334155] text-red-500">Cancel</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden p-4 bg-[#0f172a]">
          {bookings.filter(b => {
             if (activeBookingTab === 'pending') return b.status === 'PENDING';
             if (activeBookingTab === 'confirmed') return b.status === 'CONFIRMED';
             if (activeBookingTab === 'cancelled') return b.status === 'CANCELLED';
             return true;
          }).map((b) => (
            <div key={b.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 mb-3">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 pr-2">
                  <p className="text-lg font-bold text-white truncate">{b.reference}</p>
                  <p className="text-sm text-[#64748b] truncate">{b.customerName} - {b.itemName}</p>
                </div>
                <div className={cn(
                  "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                  b.status === 'CONFIRMED' || b.status === 'ACCEPTED' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                  b.status === 'CANCELLED' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  {b.status}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-[#64748b]">Dates: {new Date(b.startDate).toLocaleDateString()} - {b.endDate ? new Date(b.endDate).toLocaleDateString() : ''}</span>
                <span className="text-[10px] text-[#64748b] uppercase font-medium">Guests: {b.guests}</span>
              </div>
              <div className="flex flex-wrap gap-2 w-full mt-4">
                <Button variant="outline" size="sm" className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-[#334155] text-white min-w-[100px]">View Details</Button>
                <Button variant="outline" size="sm" onClick={() => updateBooking(b.id, { status: 'CANCELLED' })} className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-[#334155] text-red-500 min-w-[100px]">Cancel</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Reviews Moderation</h2>
        <div className="flex bg-[#0f172a] p-1 rounded-xl border border-[#334155] overflow-x-auto scrollbar-hide">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveReviewTab(tab)}
               className={cn(
                 "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                 activeReviewTab === tab 
                   ? "bg-[#F5A623] text-black shadow-lg" 
                   : "text-[#94a3b8] hover:text-white"
               )}
             >
               {tab === 'pending' ? 'Pending Moderation' : tab}
             </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.filter(r => {
          if (activeReviewTab === 'pending') return r.status === 'pending';
          if (activeReviewTab === 'approved') return r.status === 'approved';
          if (activeReviewTab === 'rejected') return r.status === 'rejected';
          return true;
        }).map(r => (
          <Card key={r.id} className="p-4 bg-[#1e293b] border-[#334155] space-y-4">
             <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{r.reviewerName}</p>
                  <p className="text-[10px] text-[#94a3b8]">{r.propertyName} &bull; {new Date(r.date).toLocaleDateString()}</p>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black uppercase border",
                  r.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                  r.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                   {r.status}
                </div>
             </div>
             <div className="flex gap-1 text-[#F5A623]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-4 w-4", i < r.rating ? "fill-[#F5A623]" : "fill-neutral-600 outline-none stroke-transparent")} />
                ))}
             </div>
             <p className="text-sm text-[#e2e8f0] italic">"{r.text}"</p>
             <div className="flex gap-2">
                {r.status !== 'approved' && (
                  <Button size="sm" onClick={() => updateReview(r.id, { status: 'approved' })} className="flex-1 h-8 text-[10px] font-black uppercase bg-green-600 text-white border-none">Approve</Button>
                )}
                {r.status === 'pending' && (
                  <Button size="sm" variant="outline" onClick={() => updateReview(r.id, { status: 'rejected' })} className="flex-1 h-8 text-[10px] font-black uppercase border-red-500/30 text-red-500">Reject</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => deleteReview(r.id)} className="flex-none h-8 w-8 p-0 border-[#334155] text-[#94a3b8] hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-4 bg-[#1e293b] border-[#334155]">
          <p className="text-[10px] font-black uppercase text-[#94a3b8]">Total Users</p>
          <p className="text-2xl font-bold mt-1 text-white">47</p>
        </Card>
        <Card className="p-4 bg-[#1e293b] border-[#334155]">
          <p className="text-[10px] font-black uppercase text-[#94a3b8]">Total Properties</p>
          <p className="text-2xl font-bold mt-1 text-white">6</p>
        </Card>
        <Card className="p-4 bg-[#1e293b] border-[#334155]">
          <p className="text-[10px] font-black uppercase text-[#94a3b8]">Total Bookings</p>
          <p className="text-2xl font-bold mt-1 text-white">23</p>
        </Card>
        <Card className="p-4 bg-[#1e293b] border-[#334155]">
          <p className="text-[10px] font-black uppercase text-[#94a3b8]">Active Listers</p>
          <p className="text-2xl font-bold mt-1 text-white">8</p>
        </Card>
        <Card className="p-4 bg-[#1e293b] border-[#334155]">
          <p className="text-[10px] font-black uppercase text-[#94a3b8]">Active Providers</p>
          <p className="text-2xl font-bold mt-1 text-white">12</p>
        </Card>
        <Card className="p-4 bg-[#1e293b] border-[#334155]">
          <p className="text-[10px] font-black uppercase text-[#94a3b8]">Active Suppliers</p>
          <p className="text-2xl font-bold mt-1 text-white">5</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="p-6 bg-[#1e293b] border-[#334155] space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Bookings by Month (Last 6 Months)</h3>
            <div className="flex items-end h-40 gap-2">
              {[
                { label: 'Jan', value: 30 },
                { label: 'Feb', value: 45 },
                { label: 'Mar', value: 60 },
                { label: 'Apr', value: 40 },
                { label: 'May', value: 75 },
                { label: 'Jun', value: 90 },
              ].map((m, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                   <div className="w-full bg-[#F5A623] rounded-t-sm transition-all" style={{ height: `${m.value}%` }} />
                   <p className="text-[10px] text-[#94a3b8] uppercase font-bold">{m.label}</p>
                </div>
              ))}
            </div>
         </Card>
         <Card className="p-6 bg-[#1e293b] border-[#334155] space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Top Performing Areas</h3>
            <div className="flex items-end h-40 gap-2">
              {[
                { label: 'Centro', value: 80 },
                { label: 'Vomero', value: 50 },
                { label: 'Chiaia', value: 100 },
                { label: 'Posillipo', value: 40 },
                { label: 'Ischia', value: 60 },
              ].map((m, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                   <div className="w-full bg-purple-500 rounded-t-sm transition-all" style={{ height: `${m.value}%` }} />
                   <p className="text-[10px] text-[#94a3b8] uppercase font-bold truncate w-full text-center">{m.label}</p>
                </div>
              ))}
            </div>
         </Card>
         <Card className="p-6 bg-[#1e293b] border-[#334155] space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">User Growth by Role</h3>
            <div className="flex items-end h-40 gap-2">
              {[
                { label: 'Users', value: 95 },
                { label: 'Listers', value: 40 },
                { label: 'Providers', value: 25 },
                { label: 'Suppliers', value: 15 },
              ].map((m, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                   <div className="w-full bg-blue-500 rounded-t-sm transition-all" style={{ height: `${m.value}%` }} />
                   <p className="text-[10px] text-[#94a3b8] uppercase font-bold text-center">{m.label}</p>
                </div>
              ))}
            </div>
         </Card>
         <Card className="p-6 bg-[#1e293b] border-[#334155] space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Popular Properties</h3>
            <div className="space-y-4">
               {[
                 { name: 'Luxury Suite Chiaia', area: 'Seafront (Chiaia - Posillipo)', count: 31 },
                 { name: 'Villa Partenope', area: 'Seafront (Chiaia - Posillipo)', count: 24 },
                 { name: 'Island Retreat Ischia', area: 'Islands (Ischia & Procida)', count: 22 },
               ].map((p, idx) => (
                 <div key={idx} className="flex justify-between items-center border-b border-[#334155] pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-[#94a3b8] uppercase tracking-widest">{p.area}</p>
                    </div>
                    <div className="bg-[#0f172a] px-2 py-1 rounded text-xs font-black text-[#F5A623]">
                      {p.count} Bookings
                    </div>
                 </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'overview': return renderOverview();
      case 'users': return renderUsers();
      case 'bookings': return renderBookings();
      case 'reviews': return renderReviews();
      case 'analytics': return renderAnalytics();
      case 'seo':
        return (
          <div className="max-w-4xl space-y-8">
            <Card className="p-8 border-[#334155] bg-[#1e293b] space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-[#334155] pb-4">SEO Configuration</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">Meta Title</label>
                    <Input 
                      value={settings.seo.title} 
                      onChange={(e) => updateSettings({ seo: { ...settings.seo, title: e.target.value } })}
                      className="bg-[#0f172a] border-[#334155]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">Meta Description</label>
                    <textarea 
                      className="w-full h-24 rounded-xl border border-[#334155] bg-[#0f172a] px-4 py-3 text-sm text-white focus:border-[#F5A623] outline-none" 
                      value={settings.seo.description}
                      onChange={(e) => updateSettings({ seo: { ...settings.seo, description: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={() => toast.success('SEO Settings updated!')} className="w-full bg-[#F5A623] text-black font-black uppercase py-4">Save SEO Settings</Button>
            </Card>
          </div>
        );
      case 'appearance':
        return (
          <div className="max-w-4xl space-y-8">
            <Card className="p-8 border-[#334155] bg-[#1e293b] space-y-8 rounded-[2rem]">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-[#334155] pb-4">Theme Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#0f172a] border border-[#334155]">
                    <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Primary Color</p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={settings.primaryColor}
                        onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                        className="h-8 w-8 rounded bg-transparent border-none" 
                      />
                      <span className="font-mono text-xs text-white uppercase">{settings.primaryColor}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0f172a] border border-[#334155]">
                    <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Platform Logo (URL)</p>
                    <Input 
                      value={settings.logo}
                      onChange={(e) => updateSettings({ logo: e.target.value })}
                      placeholder="https://..."
                      className="h-9 bg-transparent border-[#334155] text-xs focus:border-[#F5A623]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Homepage Sections</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(settings.sections).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-[#334155]">
                        <span className="text-sm text-[#e2e8f0] capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <input 
                          type="checkbox" 
                          checked={value}
                          onChange={(e) => updateSettings({ sections: { ...settings.sections, [key]: e.target.checked } })}
                          className="w-5 h-5 accent-[#F5A623]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={() => toast.success('Branding applied!')} className="w-full bg-[#F5A623] text-black font-black uppercase py-4 shadow-lg shadow-[#F5A623]/10">Apply Branding</Button>
            </Card>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-4xl space-y-8">
            <Card className="p-8 border-[#334155] bg-[#1e293b] space-y-8 rounded-[2rem]">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-[#334155] pb-4">General Platform Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">Site Name</label>
                    <Input 
                      value={settings.siteName}
                      onChange={(e) => updateSettings({ siteName: e.target.value })}
                      className="bg-[#0f172a] border-[#334155] text-white focus:border-[#F5A623]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">Tagline</label>
                    <Input 
                      value={settings.tagline}
                      onChange={(e) => updateSettings({ tagline: e.target.value })}
                      className="bg-[#0f172a] border-[#334155] text-white focus:border-[#F5A623]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">Hero Title</label>
                    <Input 
                      value={settings.heroTitle}
                      onChange={(e) => updateSettings({ heroTitle: e.target.value })}
                      className="bg-[#0f172a] border-[#334155] text-white focus:border-[#F5A623]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">Hero Subtitle</label>
                    <Input 
                      value={settings.heroSubtitle}
                      onChange={(e) => updateSettings({ heroSubtitle: e.target.value })}
                      className="bg-[#0f172a] border-[#334155] text-white focus:border-[#F5A623]" 
                    />
                  </div>
                </div>
              </div>
              <Button onClick={() => toast.success('General Settings updated!')} className="w-full bg-[#F5A623] text-black font-black uppercase py-4 shadow-lg shadow-[#F5A623]/10">Save General Settings</Button>
            </Card>
          </div>
        );
      case 'properties':
        return (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white">All Properties</h2>
              <div className="flex bg-[#0f172a] p-1 rounded-xl border border-[#334155] overflow-x-auto scrollbar-hide">
                {(['all', 'pending', 'rejected'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActivePropertyTab(tab)}
                    className={cn(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                      activePropertyTab === tab 
                        ? "bg-[#F5A623] text-black shadow-lg" 
                        : "text-[#94a3b8] hover:text-white"
                    )}
                  >
                    {tab} {tab === 'pending' && pendingHotels.length > 0 && `(${pendingHotels.length})`}
                  </button>
                ))}
              </div>
            </div>
            <Card className="border-[#334155] bg-[#1e293b] overflow-hidden rounded-[2rem]">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0f172a] border-b border-[#334155]">
                      <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Property</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Featured</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {allHotels
                      .filter(h => {
                        if (activePropertyTab === 'pending') return h.status === 'pending';
                        if (activePropertyTab === 'rejected') return h.status === 'rejected';
                        return true;
                      })
                      .map((h) => (
                      <tr key={h.id} className="hover:bg-[#0f172a]/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={h.imageUrl} className="h-10 w-10 rounded-lg object-cover bg-[#0f172a] border border-[#334155]" alt="" />
                            <div>
                              <p className="text-sm font-bold text-white leading-tight">{h.name}</p>
                              <p className="text-[10px] text-[#64748b] uppercase font-black tracking-tighter">{h.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                            h.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                            h.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}>
                            {h.status === 'approved' ? 'Active' : h.status || 'pending'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleToggleFeatured(h.id, !h.isFeatured)}
                            className={cn(
                              "h-8 px-3 text-[10px] font-black uppercase border border-[#334155]",
                              h.isFeatured ? "bg-[#F5A623] text-black hover:bg-[#F5A623]/90" : "text-[#94a3b8] hover:text-white"
                            )}
                          >
                            {h.isFeatured ? 'Featured' : 'Make Featured'}
                          </Button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {h.status !== 'approved' && (
                              <Button size="sm" onClick={() => handleApprove(h.id)} className="h-8 text-[10px] font-black uppercase bg-green-600 text-white hover:bg-green-700 border-none px-4">Approve</Button>
                            )}
                            {h.status === 'pending' && (
                              <Button size="sm" variant="outline" onClick={() => handleReject(h.id)} className="h-8 text-[10px] font-black uppercase border-red-500/30 text-red-500 hover:bg-red-500/10 px-4">Reject</Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditProperty(h)}
                              className="h-8 w-8 text-[#94a3b8] hover:text-[#F5A623]"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteProperty(h.id)}
                              className="h-8 w-8 text-[#64748b] hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Grid */}
              <div className="lg:hidden p-4 bg-[#0f172a]">
                {allHotels.filter(h => {
                  if (activePropertyTab === 'pending') return h.status === 'pending';
                  if (activePropertyTab === 'rejected') return h.status === 'rejected';
                  return true;
                }).map((h) => (
                  <div key={h.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 mb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 pr-2">
                        <p className="text-lg font-bold text-white truncate">{h.name}</p>
                        <p className="text-sm text-[#64748b] truncate">{h.city}</p>
                      </div>
                      <div className={cn(
                        "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                        h.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        h.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {h.status === 'approved' ? 'Active' : h.status || 'pending'}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full mt-4">
                      {h.status !== 'approved' && (
                        <Button size="sm" onClick={() => handleApprove(h.id)} className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest bg-green-600 text-white min-w-[100px]">Approve</Button>
                      )}
                      {h.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => handleReject(h.id)} className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest border-red-500/30 text-red-500 min-w-[100px]">Reject</Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleToggleFeatured(h.id, !h.isFeatured)}
                        className={cn("flex-1 h-10 text-[10px] uppercase font-black tracking-widest min-w-[100px]", h.isFeatured ? "bg-[#F5A623] text-black border-transparent" : "border-[#334155] text-white")}
                      >
                        {h.isFeatured ? 'Featured' : 'Make Feat.'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditProperty(h)} className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-[#334155] text-white min-w-[100px]">Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteProperty(h.id)} className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-[#334155] text-red-500 min-w-[100px]">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      case 'experiences':
        const experiences = allServices.filter(s => s.serviceType !== 'B2B');
        return (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white">Experiences & Services</h2>
              <div className="flex bg-[#0f172a] p-1 rounded-xl border border-[#334155] overflow-x-auto scrollbar-hide">
                {(['all', 'pending', 'rejected'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveExperienceTab(tab)}
                    className={cn(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                      activeExperienceTab === tab 
                        ? "bg-[#F5A623] text-black shadow-lg" 
                        : "text-[#94a3b8] hover:text-white"
                    )}
                  >
                    {tab} {tab === 'pending' && pendingServices.filter(s => s.serviceType !== 'B2B').length > 0 && `(${pendingServices.filter(s => s.serviceType !== 'B2B').length})`}
                  </button>
                ))}
              </div>
            </div>
            <Card className="border-[#334155] bg-[#1e293b] overflow-hidden rounded-[2rem]">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0f172a] border-b border-[#334155]">
                      <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Experience</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Pricing</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {experiences
                      .filter(s => {
                        if (activeExperienceTab === 'pending') return s.status === 'pending';
                        if (activeExperienceTab === 'rejected') return s.status === 'rejected';
                        return true;
                      })
                      .map((s) => (
                      <tr key={s.id} className="hover:bg-[#0f172a]/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={s.imageUrl} className="h-10 w-10 rounded-lg object-cover bg-[#0f172a] border border-[#334155]" alt="" />
                            <div>
                              <p className="text-sm font-bold text-white">{s.name}</p>
                              <p className="text-[10px] text-[#64748b] uppercase font-black tracking-tighter">{s.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-[#F5A623]">{formatPrice(s.price)}</p>
                          <p className="text-[10px] text-[#64748b] uppercase font-medium">{s.priceUnit}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                            s.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                            s.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}>
                            {s.status || 'pending'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {s.status !== 'approved' && (
                              <Button size="sm" onClick={() => handleApproveService(s.id)} className="h-8 text-[10px] font-black uppercase bg-green-600 text-white hover:bg-green-700 border-none px-4">Approve</Button>
                            )}
                            {s.status === 'pending' && (
                              <Button size="sm" variant="outline" onClick={() => handleRejectService(s.id)} className="h-8 text-[10px] font-black uppercase border-red-500/30 text-red-500 hover:bg-red-500/10 px-4">Reject</Button>
                            )}
                             <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditService(s)}
                              className="h-8 w-8 text-[#94a3b8] hover:text-[#F5A623]"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteServiceItem(s.id)}
                              className="h-8 w-8 text-[#64748b] hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Grid */}
              <div className="lg:hidden p-4 bg-[#0f172a]">
                {experiences
                  .filter(s => {
                    if (activeExperienceTab === 'pending') return s.status === 'pending';
                    if (activeExperienceTab === 'rejected') return s.status === 'rejected';
                    return true;
                  }).map((s) => (
                  <div key={s.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 mb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 pr-2">
                        <p className="text-lg font-bold text-white truncate">{s.name}</p>
                        <p className="text-sm text-[#64748b] truncate">{s.category}</p>
                      </div>
                      <div className={cn(
                        "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                        s.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                        s.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {s.status || 'pending'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-bold text-[#F5A623]">{formatPrice(s.price)}</span>
                      <span className="text-[10px] text-[#64748b] uppercase font-medium">{s.priceUnit}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full mt-4">
                      {s.status !== 'approved' && (
                        <Button size="sm" onClick={() => handleApproveService(s.id)} className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest bg-green-600 text-white min-w-[100px]">Approve</Button>
                      )}
                      {s.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => handleRejectService(s.id)} className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest border-red-500/30 text-red-500 min-w-[100px]">Reject</Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleEditService(s)} className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-[#334155] text-white min-w-[100px]">Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteServiceItem(s.id)} className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-[#334155] text-red-500 min-w-[100px]">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      case 'suppliers':
        const supplierServices = allServices.filter(s => s.serviceType === 'B2B');
        return (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white">B2B Supplier Services</h2>
              <div className="flex bg-[#0f172a] p-1 rounded-xl border border-[#334155] overflow-x-auto scrollbar-hide">
                {(['all', 'pending', 'rejected'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSupplierTab(tab)}
                    className={cn(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                      activeSupplierTab === tab 
                        ? "bg-[#F5A623] text-black shadow-lg" 
                        : "text-[#94a3b8] hover:text-white"
                    )}
                  >
                    {tab} {tab === 'pending' && pendingServices.filter(s => s.serviceType === 'B2B').length > 0 && `(${pendingServices.filter(s => s.serviceType === 'B2B').length})`}
                  </button>
                ))}
              </div>
            </div>
            <Card className="border-[#334155] bg-[#1e293b] overflow-hidden rounded-[2rem]">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0f172a] border-b border-[#334155]">
                      <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Service</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Pricing</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {supplierServices
                      .filter(s => {
                        if (activeSupplierTab === 'pending') return s.status === 'pending';
                        if (activeSupplierTab === 'rejected') return s.status === 'rejected';
                        return true;
                      })
                      .map((s) => (
                      <tr key={s.id} className="hover:bg-[#0f172a]/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#0f172a] border border-[#334155] flex items-center justify-center text-[#94a3b8]">
                               <Wrench className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-white leading-tight">{s.name}</p>
                               <p className="text-[10px] text-[#64748b] uppercase font-black tracking-tighter">{s.category}</p>
                            </div>
                          </div>
                        </td>
                         <td className="px-6 py-4">
                          <p className="text-sm font-bold text-[#F5A623]">{formatPrice(s.price)}</p>
                          <p className="text-[10px] text-[#64748b] uppercase font-medium">{s.priceUnit}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                            s.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                            s.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}>
                            {s.status || 'pending'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             {s.status !== 'approved' && (
                              <Button size="sm" onClick={() => handleApproveService(s.id)} className="h-8 text-[10px] font-black uppercase bg-green-600 text-white hover:bg-green-700 border-none px-4">Approve</Button>
                            )}
                            {s.status === 'pending' && (
                              <Button size="sm" variant="outline" onClick={() => handleRejectService(s.id)} className="h-8 text-[10px] font-black uppercase border-red-500/30 text-red-500 hover:bg-red-500/10 px-4">Reject</Button>
                            )}
                             <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                setEditingSupplierService(s);
                                setIsSupplierModalOpen(true);
                              }}
                              className="h-8 w-8 text-[#94a3b8] hover:text-[#F5A623]"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteServiceItem(s.id)}
                              className="h-8 w-8 text-[#64748b] hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Grid */}
              <div className="lg:hidden p-4 bg-[#0f172a]">
                {supplierServices
                  .filter(s => {
                    if (activeSupplierTab === 'pending') return s.status === 'pending';
                    if (activeSupplierTab === 'rejected') return s.status === 'rejected';
                    return true;
                  }).map((s) => (
                  <div key={s.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 mb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 pr-2">
                        <p className="text-lg font-bold text-white truncate">{s.name}</p>
                        <p className="text-sm text-[#64748b] truncate">{s.category}</p>
                      </div>
                      <div className={cn(
                        "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                        s.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                        s.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {s.status || 'pending'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-bold text-[#F5A623]">{formatPrice(s.price)}</span>
                      <span className="text-[10px] text-[#64748b] uppercase font-medium">{s.priceUnit}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full mt-4">
                      {s.status !== 'approved' && (
                        <Button size="sm" onClick={() => handleApproveService(s.id)} className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest bg-green-600 text-white min-w-[100px]">Approve</Button>
                      )}
                      {s.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => handleRejectService(s.id)} className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest border-red-500/30 text-red-500 min-w-[100px]">Reject</Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => { setEditingSupplierService(s); setIsSupplierModalOpen(true); }} className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-[#334155] text-white min-w-[100px]">Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteServiceItem(s.id)} className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-[#334155] text-red-500 min-w-[100px]">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-20 w-20 rounded-3xl bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center mb-6">
                <ShieldCheck className="h-10 w-10 text-[#F5A623]" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{section.toUpperCase()} Command</h2>
             <p className="text-[#94a3b8] max-w-sm font-medium">This professional management module is currently being optimized for WordPress style admin control.</p>
           </div>
        );
    }
  };

  return (
    <>
    <SEOHead noindex />
    <DashboardLayout title={section === 'overview' ? 'Admin Central' : section.charAt(0).toUpperCase() + section.slice(1)}>
      <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h1 className="text-3xl font-bold text-white capitalize">{section === 'overview' ? 'Dashboard' : section}</h1>
               <p className="text-[#94a3b8] text-sm mt-1 font-medium">Full control over the platform's infrastructure and users.</p>
             </div>
          </div>

        {renderContent()}
      </div>

      <PropertyFormModal 
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setEditingProperty(null);
        }}
        initialData={editingProperty}
        onSubmit={(data) => {
          if (editingProperty) {
            updateHotel(editingProperty.id, data);
            toast.success('Property updated successfully');
          }
        }}
      />

      <ServiceFormModal 
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setEditingService(null);
        }}
        initialData={editingService}
        onSubmit={(data) => {
          if (editingService) {
            updateService(editingService.id, data);
            toast.success('Service updated successfully');
          }
        }}
      />

      <SupplierServiceFormModal 
        isOpen={isSupplierModalOpen}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setEditingSupplierService(null);
        }}
        initialData={editingSupplierService}
        onSubmit={(data) => {
          if (editingSupplierService) {
            updateService(editingSupplierService.id, data);
            toast.success('Supplier service updated successfully');
          }
        }}
      />

      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e293b] p-6 rounded-2xl border border-[#334155] w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-white">Edit User</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Name</label>
                <Input 
                  value={editingUser.name} 
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="bg-[#0f172a] border-[#334155] text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email</label>
                <Input 
                  value={editingUser.email} 
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="bg-[#0f172a] border-[#334155] text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Phone</label>
                <Input 
                  value={editingUser.phone} 
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="bg-[#0f172a] border-[#334155] text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Role</label>
                <select 
                  value={editingUser.role} 
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full h-10 px-3 bg-[#0f172a] border border-[#334155] rounded-lg text-sm text-white"
                >
                  <option value={UserRole.CUSTOMER}>Customer</option>
                  <option value={UserRole.HOTEL_OWNER}>Property Manager</option>
                  <option value={UserRole.SERVICE_PROVIDER}>Experience Provider</option>
                  <option value={UserRole.SUPPLIER}>Supplier</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveUser} className="bg-[#F5A623] text-black">Save</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
    </>
  );
};
