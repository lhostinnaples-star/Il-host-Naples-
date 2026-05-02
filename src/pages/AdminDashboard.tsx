import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';
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
  ChevronRight, LayoutGrid, Eye, SearchCode
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DashboardLayout } from '../components/DashboardLayout';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MOCK_USERS } from '../contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { token, isDemoMode } = useAuth();
  const { formatPrice } = useCurrency();
  const { allHotels, updateHotel } = useHotels();
  const { settings, updateSettings } = useSettings();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';

  const pendingHotels = allHotels.filter(h => h.status === 'pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);

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
    updateHotel(id, { status: 'rejected' });
    toast.error('Property rejected');
  };

  const handleToggleFeatured = (id: string, isFeatured: boolean) => {
    updateHotel(id, { isFeatured });
    toast.success(isFeatured ? 'Property featured' : 'Property unfeatured');
  };

  const StatCard = ({ title, value, growth, icon: Icon, color }: any) => (
    <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between group hover:border-[#fbbf24]/30 transition-all">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold",
          growth > 0 ? "text-green-500" : "text-red-500"
        )}>
          {growth > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(growth)}% from last month
        </div>
      </div>
      <div className={cn("p-4 rounded-2xl bg-opacity-10", color)}>
        <Icon className={cn("h-6 w-6", color.replace('bg-', 'text-'))} />
      </div>
    </Card>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={allUsers.length} growth={12} icon={Users} color="bg-blue-500" />
        <StatCard title="Total Properties" value={allHotels.length} growth={8} icon={Home} color="bg-purple-500" />
        <StatCard title="Pending Approvals" value={pendingHotels.length} growth={5} icon={Clock} color="bg-orange-500" />
        <StatCard title="Total Revenue" value={formatPrice(28500)} growth={-3} icon={BarChart3} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <Button variant="outline" size="sm" className="text-xs h-8 border-white/10 hover:bg-white/5">View All</Button>
          </div>
          <Card className="border-white/5 bg-white/5 overflow-hidden">
            <div className="divide-y divide-white/5">
              {[
                { type: 'user', text: 'New user registered: Marco Rossi', time: '2 mins ago', icon: Users, color: 'text-blue-400' },
                { type: 'booking', text: 'New booking confirmed for Villa Roma', time: '1 hour ago', icon: Calendar, color: 'text-green-400' },
                { type: 'review', text: 'New review posted for Casa Mare', time: '3 hours ago', icon: Star, color: 'text-yellow-400' },
                { type: 'property', text: 'New property submitted: Posillipo View', time: '5 hours ago', icon: Home, color: 'text-purple-400' },
              ].map((item, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg bg-white/5", item.color)}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-[#fbbf24] transition-colors">{item.text}</p>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-tighter mt-0.5">{item.time}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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
              <Card key={h.id} className="p-4 border-white/5 bg-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24] font-bold uppercase overflow-hidden">
                    {h.imageUrl ? <img src={h.imageUrl} className="w-full h-full object-cover" /> : h.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">{h.name}</p>
                    <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-tighter mt-1">{h.city}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(h.id)} className="flex-1 h-8 text-[10px] font-black uppercase bg-green-600 hover:bg-green-700 text-white">Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(h.id)} className="flex-1 h-8 text-[10px] font-black uppercase border-white/10 hover:bg-red-500/10 hover:text-red-500 transition-colors">Reject</Button>
                </div>
              </Card>
            ))}
            {pendingHotels.length === 0 && (
              <p className="text-neutral-500 text-xs text-center py-4">No pending approvals</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input 
            placeholder="Search users..." 
            className="pl-10 h-11 bg-white/5 border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-11 border-white/10 hover:bg-white/5 gap-2 px-4">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button className="h-11 bg-[#fbbf24] text-black font-black uppercase tracking-widest gap-2 px-6">
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <Card className="border-white/5 bg-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {allUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[#fbbf24]">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{u.name}</p>
                      <p className="text-xs text-neutral-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className={cn(
                     "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                     u.role === UserRole.ADMIN ? "bg-red-500/10 text-red-500" :
                     u.role === UserRole.HOTEL_OWNER ? "bg-purple-500/10 text-purple-500" :
                     u.role === UserRole.SUPPLIER ? "bg-yellow-500/10 text-yellow-500" :
                     "bg-blue-500/10 text-blue-500"
                   )}>
                     {u.role === UserRole.ADMIN && <Shield className="h-3 w-3" />}
                     {u.role.replace('_', ' ')}
                   </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-neutral-500">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-white"><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <Card className="p-8 border-white/5 bg-white/5 space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4">SEO Configuration</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Meta Title</label>
                    <Input 
                      value={settings.seo.title} 
                      onChange={(e) => updateSettings({ seo: { ...settings.seo, title: e.target.value } })}
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Meta Description</label>
                    <textarea 
                      className="w-full h-24 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#fbbf24] outline-none" 
                      value={settings.seo.description}
                      onChange={(e) => updateSettings({ seo: { ...settings.seo, description: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={() => toast.success('SEO Settings updated!')} className="w-full bg-[#fbbf24] text-black font-black uppercase py-4">Save SEO Settings</Button>
            </Card>
          </div>
        );
      case 'appearance':
        return (
          <div className="max-w-4xl space-y-8">
            <Card className="p-8 border-white/5 bg-white/5 space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4">Theme Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Primary Color</p>
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
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Platform Logo (URL)</p>
                    <Input 
                      value={settings.logo}
                      onChange={(e) => updateSettings({ logo: e.target.value })}
                      placeholder="https://..."
                      className="h-9 bg-transparent border-white/10 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Homepage Sections</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(settings.sections).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
                        <span className="text-sm text-neutral-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <input 
                          type="checkbox" 
                          checked={value}
                          onChange={(e) => updateSettings({ sections: { ...settings.sections, [key]: e.target.checked } })}
                          className="w-5 h-5 accent-[#fbbf24]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={() => toast.success('Branding applied!')} className="w-full bg-[#fbbf24] text-black font-black uppercase py-4">Apply Branding</Button>
            </Card>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-4xl space-y-8">
            <Card className="p-8 border-white/5 bg-white/5 space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4">General Platform Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Site Name</label>
                    <Input 
                      value={settings.siteName}
                      onChange={(e) => updateSettings({ siteName: e.target.value })}
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Tagline</label>
                    <Input 
                      value={settings.tagline}
                      onChange={(e) => updateSettings({ tagline: e.target.value })}
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Hero Title</label>
                    <Input 
                      value={settings.heroTitle}
                      onChange={(e) => updateSettings({ heroTitle: e.target.value })}
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Hero Subtitle</label>
                    <Input 
                      value={settings.heroSubtitle}
                      onChange={(e) => updateSettings({ heroSubtitle: e.target.value })}
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                </div>
              </div>
              <Button onClick={() => toast.success('General Settings updated!')} className="w-full bg-[#fbbf24] text-black font-black uppercase py-4">Save General Settings</Button>
            </Card>
          </div>
        );
      case 'properties':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">All Properties</h2>
              <span className="text-xs text-neutral-500">{allHotels.length} total</span>
            </div>
            <Card className="border-white/5 bg-white/5 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Property</th>
                    <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Featured</th>
                    <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allHotels.map((h) => (
                    <tr key={h.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={h.imageUrl} className="h-10 w-10 rounded-lg object-cover bg-white/5" alt="" />
                          <div>
                            <p className="text-sm font-bold text-white">{h.name}</p>
                            <p className="text-xs text-neutral-500">{h.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className={cn(
                           "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                           h.status === 'approved' ? "bg-green-500/10 text-green-500" :
                           h.status === 'rejected' ? "bg-red-500/10 text-red-500" :
                           "bg-yellow-500/10 text-yellow-500"
                         )}>
                           {h.status || 'pending'}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleFeatured(h.id, !h.isFeatured)}
                          className={cn(
                            "h-8 px-3 text-[10px] font-black uppercase border border-white/10",
                            h.isFeatured ? "bg-[#fbbf24] text-black hover:bg-[#fbbf24]/90" : "text-neutral-500 hover:text-white"
                          )}
                        >
                          {h.isFeatured ? 'Featured' : 'Make Featured'}
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {h.status !== 'approved' && (
                            <Button size="sm" onClick={() => handleApprove(h.id)} className="h-8 text-[10px] font-black uppercase bg-green-600 text-white hover:bg-green-700">Approve</Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <ShieldCheck className="h-10 w-10 text-neutral-600" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{section.toUpperCase()} Command</h2>
             <p className="text-neutral-500 max-w-sm">This professional management module is currently being optimized for WordPress style admin control.</p>
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
             <p className="text-neutral-500 text-sm mt-1">Full control over the platform's infrastructure and users.</p>
           </div>
        </div>

        {renderContent()}
      </div>
    </DashboardLayout>
  );
};
