import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, Button } from '../components/UI';
import { Shield, Users, Hotel, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

import { useHotels } from '../contexts/HotelsContext';

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const { hotels } = useHotels();
  const [stats, setStats] = useState({ users: 0, hotels: 0, bookings: 0, revenue: 0 });

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
          <div className="lg:col-span-2">
            <Card className="border-white/10 bg-white/5 text-white">
              <h3 className="mb-6 text-xl font-bold">Recent System Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-white/10" />
                      <div>
                        <p className="text-sm font-bold">New Hotel Registration</p>
                        <p className="text-xs text-neutral-500">Grand Plaza Resort requested approval</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">Review</Button>
                  </div>
                ))}
              </div>
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
