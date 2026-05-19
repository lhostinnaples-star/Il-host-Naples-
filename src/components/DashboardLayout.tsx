
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Home, Map, Wrench, Calendar, 
  Star, MessageSquare, BarChart3, Globe, Settings, Eye,
  Palette, FileText, ChevronLeft, ChevronRight, Bell, Search, 
  Plus, User as UserIcon, LogOut, Menu, X, CheckCircle2, AlertCircle, Heart
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Button } from './UI';
import { toast } from 'sonner';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  badge?: number;
  subItems?: { id: string, label: string, href: string }[];
}

export const DashboardSidebar: React.FC<{ 
  isCollapsed: boolean, 
  setIsCollapsed: (v: boolean) => void,
  mobileOpen: boolean,
  setMobileOpen: (v: boolean) => void
}> = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigate = useNavigate();

  const handleSupplierNavigation = (e: React.MouseEvent, href?: string) => {
    if (href === '/supplier-directory' && user?.role === UserRole.HOTEL_OWNER) {
      if (user?.supplierAccess === 'approved') {
        return; // default behavior
      }
      e.preventDefault();
      if (user?.supplierAccess === 'pending') {
        toast.info("Your request is pending admin approval");
      } else if (user?.supplierAccess === 'rejected') {
        toast.error("Your request was rejected. Contact us.");
      } else {
        navigate('/owner?supplier_modal=true');
      }
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    switch (user.role) {
      case UserRole.ADMIN:
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
          { 
            id: 'users', label: 'Users', icon: Users, 
            subItems: [
              { id: 'all-users', label: 'All Users', href: '/admin?section=users' },
              { id: 'pending-users', label: 'Pending Approvals', href: '/admin?section=users&tab=pending' }
            ]
          },
          { 
            id: 'properties', label: 'Properties', icon: Home,
            subItems: [
              { id: 'all-props', label: 'All Properties', href: '/admin?section=properties' },
              { id: 'pending-props', label: 'Pending Review', href: '/admin?section=properties&tab=pending' }
            ]
          },
          { id: 'experiences', label: 'Experiences', icon: Map, href: '/admin?section=experiences' },
          { 
            id: 'suppliers', label: 'Suppliers', icon: Wrench,
            subItems: [
              { id: 'all-suppliers', label: 'All B2B Services', href: '/admin?section=suppliers' },
              { id: 'supplier-dir', label: 'View Supplier Directory', href: '/supplier-directory' }
            ]
          },
          { id: 'bookings', label: 'Bookings', icon: Calendar, href: '/admin?section=bookings' },
          { id: 'reviews', label: 'Reviews', icon: Star, href: '/admin?section=reviews' },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin?section=analytics' },
          { id: 'testimonials', label: 'Testimonials', icon: MessageSquare, href: '/admin?section=testimonials' },
          { id: 'cityGuide', label: 'City Guide', icon: Map, href: '/admin?section=cityGuide' },
          { id: 'joinSection', label: 'Join Section', icon: Users, href: '/admin?section=joinSection' },
          { id: 'seo', label: 'SEO Settings', icon: Globe, href: '/admin?section=seo' },
          { id: 'appearance', label: 'Appearance', icon: Palette, href: '/admin?section=appearance' },
          { id: 'settings', label: 'Settings', icon: Settings, href: '/admin?section=settings' },
        ];
      case UserRole.HOTEL_OWNER:
        return [
          { id: 'overview', label: 'My Properties', icon: Home, href: '/owner' },
          { id: 'bookings', label: 'Bookings', icon: Calendar, href: '/owner?section=bookings' },
          { id: 'suppliers', label: 'Suppliers', icon: Wrench, href: '/supplier-directory' },
          { id: 'revenue', label: 'Revenue', icon: BarChart3, href: '/owner?section=revenue' },
          { id: 'profile', label: 'Profile', icon: UserIcon, href: '/owner?section=profile' },
        ];
      case UserRole.CUSTOMER:
        return [
          { id: 'overview', label: 'Overview', icon: Home, href: '/dashboard' },
          { id: 'trips', label: 'Trips', icon: Calendar, href: '/dashboard?section=trips' },
          { id: 'experiences', label: 'Experiences', icon: Star, href: '/dashboard?section=experiences' },
          { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/dashboard?section=wishlist' },
          { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard?section=settings' },
        ];
      case UserRole.SERVICE_PROVIDER:
        return [
          { id: 'overview', label: 'My Services', icon: Map, href: '/service-dashboard' },
          { id: 'bookings', label: 'Bookings', icon: Calendar, href: '/service-dashboard?section=bookings' },
          { id: 'profile', label: 'Profile', icon: UserIcon, href: '/service-dashboard?section=profile' },
        ];
      case UserRole.SUPPLIER:
        return [
          { id: 'overview', label: 'My Services', icon: Wrench, href: '/supplier' },
          { id: 'orders', label: 'Orders', icon: Calendar, href: '/supplier?section=orders' },
          { id: 'profile', label: 'Profile', icon: UserIcon, href: '/supplier?section=profile' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#1e293b] text-[#94a3b8]">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 text-white">
          <div className="bg-[#fbbf24] p-2 rounded-lg">
            <Home className="h-5 w-5 text-black" />
          </div>
          {!isCollapsed && <span className="font-serif font-bold text-xl tracking-tight">Il Host in Naples</span>}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname + location.search === item.href;
          const isExpanded = expandedItems.includes(item.id);

          return (
            <div key={item.id}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-white/5",
                      isExpanded && "text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left text-sm font-bold text-white uppercase tracking-wider">{item.label}</span>
                        {isExpanded ? <ChevronLeft className="h-4 w-4 rotate-[-90deg]" /> : <ChevronRight className="h-4 w-4" />}
                      </>
                    )}
                  </button>
                  {!isCollapsed && isExpanded && (
                    <div className="mt-1 ml-8 space-y-1">
                      {item.subItems.map(sub => (
                        <Link
                          key={sub.id}
                          to={sub.href}
                          className={cn(
                            "block px-3 py-1.5 text-xs rounded-md transition-colors hover:text-white",
                            location.pathname + location.search === sub.href ? "text-white font-bold" : "text-neutral-500"
                          )}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.href || '#'}
                  onClick={(e) => handleSupplierNavigation(e, item.href)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    isActive ? "bg-white/10 text-white shadow-sm" : "hover:bg-white/5 hover:text-neutral-200"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-[#F5A623]")} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-bold uppercase tracking-wider">{item.label}</span>
                      {item.badge && (
                        <span className="bg-[#F5A623] text-[#0f172a] text-[10px] font-black px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 space-y-2">
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!isCollapsed && <span className="text-sm font-medium">Collapse Menu</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:block h-screen fixed top-0 left-0 z-30 transition-all duration-300 border-r border-white/5",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {SidebarContent}
      </div>
    </>
  );
};

export const DashboardHeader: React.FC<{ 
  setMobileOpen: (v: boolean) => void,
  title: string
}> = ({ setMobileOpen, title }) => {
  const { user, isDemoMode } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#0f172a] border-b border-[#334155] px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMobileOpen(true)}
          className="p-2 md:hidden text-neutral-400 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#64748b]">
          <Link to="/" className="hover:text-white transition-colors">Site</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#94a3b8]">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isDemoMode && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#F5A623] text-[10px] font-black uppercase">
            <AlertCircle className="h-3 w-3" />
            Demo Mode
          </div>
        )}

        <div className="relative group">
          <button className="p-2 text-neutral-400 hover:text-white transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-[#121826]"></span>
          </button>
        </div>

        <div className="h-8 w-px bg-white/5 mx-1"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-none">{user?.name}</p>
            <p className="text-[10px] font-medium text-[#64748b] uppercase tracking-tighter mt-1">{user?.role.replace('_', ' ')}</p>
          </div>
          <button 
            onClick={() => navigate('?section=profile')}
            className="h-10 w-10 rounded-xl bg-[#1e293b] border border-[#334155] flex items-center justify-center text-white hover:border-[#F5A623]/50 transition-all overflow-hidden"
          >
            <UserIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export const DashboardLayout: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSupplierNavigation = (e: React.MouseEvent, href?: string) => {
    if (href === '/supplier-directory' && user?.role === UserRole.HOTEL_OWNER) {
      if (user?.supplierAccess === 'approved') {
        return; // default behavior
      }
      e.preventDefault();
      if (user?.supplierAccess === 'pending') {
        toast.info("Your request is pending admin approval");
      } else if (user?.supplierAccess === 'rejected') {
        toast.error("Your request was rejected. Contact us.");
      } else {
        navigate('/owner?supplier_modal=true');
      }
    }
  };

  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    switch (user.role) {
      case UserRole.ADMIN:
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
          { id: 'users', label: 'Users', icon: Users, href: '/admin?section=users' },
          { id: 'properties', label: 'Properties', icon: Home, href: '/admin?section=properties' },
          { id: 'experiences', label: 'Experiences', icon: Map, href: '/admin?section=experiences' },
          { id: 'suppliers', label: 'Suppliers', icon: Wrench, href: '/admin?section=suppliers' },
        ];
      case UserRole.HOTEL_OWNER:
        return [
          { id: 'overview', label: 'Home', icon: Home, href: '/owner' },
          { id: 'bookings', label: 'Bookings', icon: Calendar, href: '/owner?section=bookings' },
          { id: 'revenue', label: 'Revenue', icon: BarChart3, href: '/owner?section=revenue' },
          { id: 'profile', label: 'Profile', icon: UserIcon, href: '/owner?section=profile' },
        ];
      case UserRole.CUSTOMER:
        return [
          { id: 'overview', label: 'Overview', icon: Home, href: '/dashboard' },
          { id: 'trips', label: 'Trips', icon: Calendar, href: '/dashboard?section=trips' },
          { id: 'experiences', label: 'Experiences', icon: Star, href: '/dashboard?section=experiences' },
          { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/dashboard?section=wishlist' },
          { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard?section=settings' },
        ];
      case UserRole.SERVICE_PROVIDER:
        return [
          { id: 'overview', label: 'Services', icon: Map, href: '/service-dashboard' },
          { id: 'bookings', label: 'Bookings', icon: Calendar, href: '/service-dashboard?section=bookings' },
          { id: 'profile', label: 'Profile', icon: UserIcon, href: '/service-dashboard?section=profile' },
        ];
      case UserRole.SUPPLIER:
        return [
          { id: 'overview', label: 'Services', icon: Wrench, href: '/supplier' },
          { id: 'orders', label: 'Orders', icon: Calendar, href: '/supplier?section=orders' },
          { id: 'profile', label: 'Profile', icon: UserIcon, href: '/supplier?section=profile' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24 md:pb-0">
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#1e293b] border-t border-[#334155] px-2 py-3 flex items-center justify-between shadow-2xl">
        {navItems.slice(0, navItems.length > 5 ? 4 : 5).map((item) => {
          const isActive = location.pathname + location.search === item.href;
          return (
            <Link 
              key={item.id} 
              to={item.href || '#'} 
              onClick={(e) => handleSupplierNavigation(e, item.href)}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors flex-1 text-center truncate",
                isActive ? "text-[#F5A623]" : "text-[#94a3b8]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-tighter w-full truncate px-0.5">{item.label}</span>
            </Link>
          );
        })}
        {navItems.length > 5 && (
          <button 
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center gap-1 text-[#94a3b8] flex-1 text-center"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">More</span>
          </button>
        )}
      </div>

      <DashboardSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "md:pl-20" : "md:pl-64"
      )}>
        <DashboardHeader title={title} setMobileOpen={setMobileOpen} />
        
        <main className="p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
