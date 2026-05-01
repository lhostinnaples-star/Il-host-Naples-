import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, Button } from '../components/UI';
import { Shield, Users, Hotel, CreditCard, AlertCircle, CheckCircle2, Home, Wrench, Car } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import { useHotels } from '../contexts/HotelsContext';
import { UserRole } from '../contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const { hotels } = useHotels();
  const [stats, setStats] = useState({ users: 0, hotels: 0, bookings: 0, revenue: 0 });
  const [activeAdminTab, setActiveAdminTab] = useState<'approvals' | 'users' | 'bookings'>('approvals');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, bookingsRes] = await Promise.all([
          fetch('/api/auth/users', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/bookings/all', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (usersRes.ok && bookingsRes.ok) {
          const users = await usersRes.json();
          const bookings = await bookingsRes.json();
          
          const usersArray = Array.isArray(users) ? users : [];
          const bookingsArray = Array.isArray(bookings) ? bookings : [];
          
          const totalRevenue = bookingsArray
            .filter((b: any) => b.status === 'confirmed')
            .reduce((acc: number, b: any) => acc + b.totalPrice, 0);

          setStats({
            users: usersArray.length,
            hotels: hotels.length,
            bookings: bookingsArray.length,
            revenue: totalRevenue
          });
        }
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      }
    };

    fetchData();
  }, [token, hotels]);

  return (
    <div className="min-h-screen bg-neutral-950 pt-32 pb-20 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-center gap-4">
          <div className="rounded-full bg-white/10 p-3">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">System Administration</h1>
            <p className="text-neutral-500 text-lg">Global platform oversight and management</p>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="mb-12 grid gap-6 md:grid-cols-4">
          {[
            { label: 'Total Users', value: stats.users.toLocaleString(), icon: Users, color: 'text-blue-400' },
            { label: 'Active Hotels', value: stats.hotels.toLocaleString(), icon: Hotel, color: 'text-purple-400' },
            { label: 'Total Bookings', value: stats.bookings.toLocaleString(), icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Platform Revenue', value: formatPrice(stats.revenue), icon: CreditCard, color: 'text-yellow-400' },
          ].map((stat, idx) => (
            <Card key={idx} className="border-white/10 bg-white/5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={cn("h-8 w-8 opacity-40", stat.color)} />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-white/10 bg-white/5 text-white">
              <div className="mb-6 flex space-x-4 border-b border-white/10 pb-4">
                <button 
                  onClick={() => setActiveAdminTab('approvals')}
                  className={`text-sm font-bold ${activeAdminTab === 'approvals' ? 'text-[#fbbf24]' : 'text-neutral-500 hover:text-white'}`}
                >
                  Pending Approvals
                </button>
                <button 
                  onClick={() => setActiveAdminTab('users')}
                  className={`text-sm font-bold ${activeAdminTab === 'users' ? 'text-[#fbbf24]' : 'text-neutral-500 hover:text-white'}`}
                >
                  All Users
                </button>
                <button 
                  onClick={() => setActiveAdminTab('bookings')}
                  className={`text-sm font-bold ${activeAdminTab === 'bookings' ? 'text-[#fbbf24]' : 'text-neutral-500 hover:text-white'}`}
                >
                  All Bookings
                </button>
              </div>

              {activeAdminTab === 'approvals' && (
                <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                  {[
                    { id: 1, name: 'Luigi Esposito', role: UserRole.HOTEL_OWNER, details: { propertyType: 'BnB', address: 'Via Roma, 5', cirCode: '882233', bio: 'Experienced host in the heart of Naples.' }, email: 'luigi@napoli.com' },
                    { id: 2, name: 'Cleaning Pros', role: UserRole.SUPPLIER, details: { companyName: 'Cleaning Pros Naples', vatNumber: 'IT123456789', categories: ['Cleaning', 'Linen'], serviceAreas: ['Centro Storico', 'Chiaia'] }, email: 'contact@cleaningpros.it' },
                    { id: 3, name: 'Vesuvius Tours', role: UserRole.SERVICE_PROVIDER, details: { businessName: 'Vesuvius Tours', serviceType: 'City Tour', basePricing: '€45', license: 'LICENSE-9900' }, email: 'info@vesuviustours.com' }
                  ].map((app) => (
                    <div key={app.id} className="rounded-2xl border border-white/5 bg-white/5 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                            {app.role === UserRole.HOTEL_OWNER ? <Home className="h-6 w-6 text-purple-400" /> : app.role === UserRole.SUPPLIER ? <Wrench className="h-6 w-6 text-yellow-400" /> : <Car className="h-6 w-6 text-green-400" />}
                          </div>
                          <div>
                            <p className="text-lg font-bold">{app.name}</p>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest">{app.role.replace('_', ' ')} • {app.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-500 text-white hover:bg-green-600"
                            onClick={() => {
                                console.log(`[ADMIN] Approved user: ${app.name}. Sending email to ${app.email}`);
                                toast.success(`${app.name} approved successfully`);
                            }}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => {
                                const reason = prompt('Enter rejection reason:');
                                if (reason) {
                                    console.log(`[ADMIN] Rejected user: ${app.name}. Reason: ${reason}. Sending email to ${app.email}`);
                                    toast.error(`Application rejected and email sent.`);
                                }
                            }}
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-neutral-400 hover:text-white"
                            onClick={() => {
                                console.log(`[ADMIN] Requested more info from: ${app.name}. Sending email to ${app.email}`);
                                toast.info('Request for documents sent.');
                            }}
                          >
                            Request Info
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        <div>
                          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Application Details</p>
                          {Object.entries(app.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0">
                                <span className="text-neutral-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="font-medium">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Verification Documents</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="aspect-video rounded-lg bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                                <AlertCircle className="h-6 w-6 text-neutral-500" />
                                <span className="ml-2 text-[10px] font-bold">ID_DOC.JPG</span>
                            </div>
                            <div className="aspect-video rounded-lg bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                                <AlertCircle className="h-6 w-6 text-neutral-500" />
                                <span className="ml-2 text-[10px] font-bold">LICENSE.PDF</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeAdminTab === 'users' && (
                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                  {[
                    {name: 'Admin User', role: 'admin'},
                    {name: 'Luigi Mario', role: 'lister'},
                    {name: 'Mario Bros', role: 'supplier'},
                    {name: 'John Guest', role: 'customer'}
                  ].map((u, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{u.name}</p>
                          <p className="text-xs text-neutral-500">{u.name.toLowerCase().replace(' ', '')}@email.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                          u.role === 'lister' ? 'bg-blue-500/20 text-blue-400' :
                          u.role === 'supplier' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {u.role}
                        </span>
                        <select className="bg-white/10 border border-white/20 text-white text-xs rounded px-2 py-1 outline-none">
                          <option value="customer">Customer</option>
                          <option value="lister">Lister</option>
                          <option value="supplier">Supplier</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeAdminTab === 'bookings' && (
                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0">
                      <div>
                        <p className="text-sm font-bold">Booking #{1000 + i}</p>
                        <p className="text-xs text-neutral-500">Villa Napoli • John Guest</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#fbbf24]">€{150 * i}</p>
                        <p className="text-xs text-green-500">Confirmed</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-yellow-500/20 bg-yellow-500/5 text-white">
              <div className="mb-4 flex items-center gap-2 text-yellow-500">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-bold">System Alerts</h3>
              </div>
              <p className="text-sm text-neutral-400">3 pending hotel verifications required.</p>
              <Button className="mt-4 w-full bg-yellow-500 text-black hover:bg-yellow-400">View Alerts</Button>
            </Card>
            
            <Card className="border-white/10 bg-white/5 text-white">
              <h3 className="mb-4 font-bold">Quick Actions</h3>
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start border-white/10 text-white hover:bg-white/10">Export Data</Button>
                <Button variant="outline" className="justify-start border-white/10 text-white hover:bg-white/10">User Audit</Button>
                <Button variant="outline" className="justify-start border-white/10 text-white hover:bg-white/10">System Settings</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for Admin Dashboard
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
