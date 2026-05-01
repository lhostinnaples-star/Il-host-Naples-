import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, User, Briefcase, MessageSquare, Map, 
  Settings, LogOut, CheckCircle2, AlertCircle, 
  Smartphone, Trash2, Plus, ArrowRight,
  Sparkles, Hammer, Camera, Paintbrush, HardHat, 
  Truck, ShieldAlert, Wifi, WifiOff, Phone
} from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { ImageUpload } from '../components/ImageUpload';

const SERVICES = [
  { id: 'cleaning', label: 'Cleaning service', icon: Sparkles },
  { id: 'laundry', label: 'Laundry service', icon: Truck },
  { id: 'plumber', label: 'Plumber', icon: Hammer },
  { id: 'photographer', label: 'Photographer', icon: Camera },
  { id: 'interior_designer', label: 'Interior designer', icon: Paintbrush },
  { id: 'furniture', label: 'Furniture', icon: Hammer },
  { id: 'construction', label: 'Construction', icon: HardHat },
  { id: 'sos', label: 'SOS Emergency', icon: ShieldAlert, priority: true }
];

const AREAS = [
  { id: 'center', label: 'Center' },
  { id: 'islands', label: 'Islands' },
  { id: 'seafront', label: 'Seafront' },
  { id: 'station', label: 'Station' },
  { id: 'stadium', label: 'Stadium' },
  { id: 'vomero', label: 'Vomero' }
];

const MOCK_LEADS = [
  { 
    id: '1', 
    listerName: 'Marco Rossi', 
    propertyArea: 'Seafront', 
    date: '2024-04-16', 
    message: 'Need general cleaning for a 2-bedroom apartment after check-out.',
    phone: '+393331234567'
  },
  { 
    id: '2', 
    listerName: 'Giulia Bianchi', 
    propertyArea: 'Center', 
    date: '2024-04-15', 
    message: 'Broken pipe in the bathroom, urgent repair needed!',
    phone: '+393339876543'
  },
  { 
    id: '3', 
    listerName: 'Antonio Esposito', 
    propertyArea: 'Vomero', 
    date: '2024-04-14', 
    message: 'Looking for a professional photographer for a new listing.',
    phone: '+393330001111'
  }
];

export const SupplierDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>(['cleaning']);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['center', 'seafront']);
  const [portfolio, setPortfolio] = useState<string[]>(Array(6).fill('https://picsum.photos/seed/work/500/500'));

  const navItems = [
    { id: 'home', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Service Profile', icon: User },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'leads', label: 'Leads', icon: MessageSquare },
    { id: 'coverage', label: 'Coverage', icon: Map }
  ];

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row pt-32">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-[#1e293b] text-white flex-col fixed inset-y-0 left-0 pt-16 mt-28 z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-12 w-12 rounded-full bg-[#fbbf24] flex items-center justify-center text-[#1e293b] font-bold text-xl">
              {user?.name?.[0] || 'S'}
            </div>
            <div>
              <p className="font-bold truncate">{user?.name || 'Supplier Name'}</p>
              <p className="text-xs text-neutral-400">Professional Supplier</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === item.id ? 'bg-[#fbbf24] text-[#1e293b]' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/10">
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-red-400 font-bold hover:text-red-300 transition-colors w-full px-4 py-3"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 pb-24 md:pb-12 px-4 md:px-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1e293b] capitalize">{activeTab.replace('_', ' ')}</h1>
            <p className="text-neutral-500 text-sm md:text-base">Manage your B2B service presence</p>
          </div>

          {/* Online/Offline Toggle */}
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all border-2 ${
              isOnline 
                ? 'border-green-500 bg-green-50 text-green-600 shadow-lg shadow-green-500/10' 
                : 'border-neutral-200 bg-white text-neutral-400'
            }`}
          >
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </button>
        </header>

        {/* Home/Overview Section */}
        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 border-none shadow-sm flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#fbbf24]/10 text-[#fbbf24] flex items-center justify-center">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Leads Received</p>
                  <p className="text-2xl font-bold text-[#1e293b]">24</p>
                </div>
              </Card>
              <Card className="p-6 border-none shadow-sm flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Profile Status</p>
                  <p className="text-2xl font-bold text-[#1e293b]">Active</p>
                </div>
              </Card>
            </div>

            <Card className="p-8 border-none shadow-sm bg-[#1e293b] text-white">
              <h3 className="text-xl font-bold mb-2">Welcome Back, {user?.name || 'Partner'}!</h3>
              <p className="text-neutral-400 mb-6 max-w-lg">Your business profile is currently visible to property listers across Naples. Keep your portfolio updated to attract more leads.</p>
              <Button onClick={() => setActiveTab('leads')} className="bg-[#fbbf24] text-[#1e293b] font-bold rounded-xl px-8">
                Check New Leads
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Service Profile Section */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-8">
            <Card className="p-8 border-none shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Business Name</label>
                <Input placeholder="e.g. Naples Luxury Cleaning" defaultValue={user?.name} className="h-14 rounded-2xl" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Short Bio</label>
                <textarea 
                  className="w-full rounded-2xl border border-neutral-200 p-4 text-sm outline-none focus:border-[#fbbf24] transition-colors min-h-[120px]"
                  placeholder="Tell property listers why they should choose your services..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block">Mandatory Service Categories</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICES.map(service => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedServices(prev => 
                          prev.includes(service.id) ? prev.filter(id => id !== service.id) : [...prev, service.id]
                        )
                      }}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left group ${
                        selectedServices.includes(service.id) 
                          ? 'border-[#fbbf24] bg-amber-50 shadow-lg shadow-amber-500/5' 
                          : 'border-neutral-100 hover:border-neutral-200 bg-neutral-50'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                        selectedServices.includes(service.id) ? 'bg-[#fbbf24] text-[#1e293b]' : 'bg-white text-neutral-400 group-hover:text-[#fbbf24]'
                      }`}>
                        <service.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-bold block ${selectedServices.includes(service.id) ? 'text-[#1e293b]' : 'text-neutral-600'}`}>
                          {service.label}
                        </span>
                        {service.priority && (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                            Priority
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-[#1e293b] text-white font-bold h-14 rounded-2xl">
                Save Profile Changes
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Portfolio Section */}
        {activeTab === 'portfolio' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1e293b]">Work Portfolio</h3>
              <p className="text-xs font-bold text-[#fbbf24] bg-amber-50 px-3 py-1.5 rounded-full uppercase tracking-widest">6 Slots Available</p>
            </div>
            
            <ImageUpload 
              maxImages={5}
              storagePath={`suppliers/${user?.id || 'new'}`}
              initialImages={portfolio}
              onImagesChange={(images) => {
                setPortfolio(images);
              }}
            />
          </motion.div>
        )}

        {/* Leads Section */}
        {activeTab === 'leads' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-4">
              {MOCK_LEADS.map(lead => (
                <Card key={lead.id} className="p-6 border-none shadow-sm hover:shadow-xl transition-shadow group flex flex-col sm:flex-row gap-6 sm:items-center">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg text-[#1e293b]">{lead.listerName}</h4>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{lead.date}</span>
                    </div>
                    <p className="text-neutral-500 text-sm leading-relaxed">{lead.message}</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#fbbf24]">
                      <Map className="h-3 w-3" />
                      {lead.propertyArea}
                    </div>
                  </div>
                  
                  <div className="sm:border-l border-neutral-100 sm:pl-6 space-y-3">
                    <div className="flex gap-2">
                       <button 
                         onClick={() => console.log(`[JOB]: Accepted job from ${lead.listerName}`)}
                         className="flex-1 flex items-center justify-center gap-2 px-4 h-10 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all text-sm"
                       >
                         Accept Job
                       </button>
                       <button 
                         onClick={() => console.log(`[JOB]: Rejected job from ${lead.listerName}`)}
                         className="flex-1 flex items-center justify-center gap-2 px-4 h-10 rounded-xl bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-all text-sm"
                       >
                         Reject
                       </button>
                    </div>
                    <button 
                      onClick={() => handleWhatsApp(lead.phone)}
                      className="w-full flex items-center justify-center gap-2 px-6 h-10 rounded-xl border border-neutral-200 text-[#1e293b] font-bold hover:border-[#fbbf24] transition-all text-sm"
                    >
                      <Phone className="h-4 w-4" />
                      WhatsApp Contact
                    </button>
                    <button 
                      onClick={() => console.log(`[INVOICE GENERATOR]: Generating auto-invoice for job ID ${lead.id}...`)}
                      className="w-full flex items-center justify-center gap-2 px-6 h-10 rounded-xl bg-[#1e293b] text-white font-bold transition-all text-sm"
                    >
                      Generate Invoice
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Coverage Section */}
        {activeTab === 'coverage' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <Card className="p-8 border-none shadow-sm space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#1e293b]">Service Coverage</h3>
                <p className="text-sm text-neutral-500">Define which areas of Naples you provide services to.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AREAS.map(area => (
                  <label 
                    key={area.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                      selectedAreas.includes(area.id) ? 'border-[#fbbf24] bg-amber-50' : 'border-neutral-100 hover:border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-md flex items-center justify-center transition-colors ${
                        selectedAreas.includes(area.id) ? 'bg-[#fbbf24] text-[#1e293b]' : 'bg-neutral-200 text-white'
                      }`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-[#1e293b]">{area.label}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={selectedAreas.includes(area.id)}
                      onChange={() => {
                        setSelectedAreas(prev => 
                          prev.includes(area.id) ? prev.filter(id => id !== area.id) : [...prev, area.id]
                        )
                      }}
                    />
                  </label>
                ))}
              </div>

              <Button className="w-full bg-[#1e293b] text-white font-bold h-14 rounded-2xl">
                Update Coverage
              </Button>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1e293b] border-t border-white/5 px-4 pb-6 pt-3 flex justify-around items-center">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === item.id ? 'text-[#fbbf24]' : 'text-neutral-500'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">{item.label.split(' ')[0]}</span>
          </button>
        ))}
        <button 
          onClick={logout}
          className="flex flex-col items-center gap-1 text-red-400 group"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-tight">Exit</span>
        </button>
      </div>
    </div>
  );
};
