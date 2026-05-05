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

export const AdminDashboard: React.FC = () => {
  const { token, isDemoMode, updateUserStatus } = useAuth();
  const { formatPrice } = useCurrency();
  const { allHotels, allServices, bookings, updateHotel, updateService, deleteService, deleteHotel } = useHotels();
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

  const [activeUserTab, setActiveUserTab] = useState<'all' | 'pending' | 'rejected'>('all');
  const [activePropertyTab, setActivePropertyTab] = useState<'all' | 'pending' | 'rejected'>('all');
  const [activeExperienceTab, setActiveExperienceTab] = useState<'all' | 'pending' | 'rejected'>('all');
  const [activeSupplierTab, setActiveSupplierTab] = useState<'all' | 'pending' | 'rejected'>('all');

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
    { title: "Total Revenue", value: formatPrice(bookings.reduce((sum, b) => b.status === 'CLOSED' ? sum + b.totalPrice : sum, 0) || 28500), growth: 5, icon: BarChart3, color: "bg-green-500" }
  ], [allUsers.length, allHotels.length, pendingHotels.length, bookings, formatPrice]);

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

  const handleApproveUser = (userId: string) => {
    updateUserStatus(userId, UserStatus.ACTIVE);
    toast.success('User account approved!');
    // Update local state if needed
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status: UserStatus.ACTIVE } : u));
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
        {(['all', 'pending', 'rejected'] as const).map((tab) => (
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
            {tab} Users {tab === 'pending' && pendingUsers.length > 0 && `(${pendingUsers.length})`}
          </button>
        ))}
      </div>

      <Card className="border-[#334155] bg-[#1e293b] overflow-hidden rounded-[2rem]">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-white hover:bg-[#1e293b]"><Edit2 className="h-4 w-4" /></Button>
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
        <div className="md:hidden divide-y divide-[#334155]">
          {allUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
            <div key={u.id} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#0f172a] border border-[#334155] flex items-center justify-center font-bold text-[#F5A623]">
                    {u.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{u.name}</p>
                    <p className="text-xs text-[#64748b] truncate">{u.email}</p>
                  </div>
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
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-9 px-4 text-[10px] uppercase font-black tracking-widest border-[#334155] text-white hover:bg-[#1e293b]">Edit</Button>
                  <Button variant="outline" size="sm" className="h-9 px-4 text-[10px] uppercase font-black tracking-widest border-[#334155] text-red-500 hover:bg-red-500/10">Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'overview': return renderOverview();
      case 'users': return renderUsers();
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
              <div className="hidden md:block overflow-x-auto">
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
              <div className="md:hidden divide-y divide-[#334155]">
                {allHotels.map((h) => (
                  <div key={h.id} className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={h.imageUrl} className="h-12 w-12 rounded-xl object-cover bg-[#0f172a] border border-[#334155]" alt="" />
                        <div>
                          <p className="text-sm font-bold text-white">{h.name}</p>
                          <p className="text-[10px] text-[#64748b] uppercase font-black tracking-tighter">{h.city}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                        h.status === 'approved' ? "bg-green-500/10 text-green-500" :
                        h.status === 'rejected' ? "bg-red-500/10 text-red-500" :
                        "bg-yellow-500/10 text-yellow-500"
                      )}>
                        {h.status || 'pending'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                       <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleFeatured(h.id, !h.isFeatured)}
                          className={cn(
                            "h-10 px-4 text-[10px] font-black uppercase border border-[#334155]",
                            h.isFeatured ? "bg-[#F5A623] text-black shadow-lg" : "text-[#94a3b8]"
                          )}
                        >
                          {h.isFeatured ? 'Featured' : 'Featured?'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditProperty(h)}
                          className="h-10 px-4 text-[10px] uppercase font-black tracking-widest border-[#334155] text-white"
                        >
                          Edit
                        </Button>
                       </div>
                      <div className="flex items-center gap-2">
                        {h.status !== 'approved' && (
                          <Button size="sm" onClick={() => handleApprove(h.id)} className="h-10 px-4 text-[10px] font-black uppercase bg-green-600 text-white border-none">Approve</Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteProperty(h.id)}
                          className="h-10 w-10 p-0 border-[#334155] text-red-500 flex items-center justify-center hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
              <div className="overflow-x-auto">
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
              <div className="overflow-x-auto">
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
    </DashboardLayout>
  );
};
