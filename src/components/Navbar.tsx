import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useHotels } from '../contexts/HotelsContext';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from './UI';
import { 
  Bed, User, LogOut, LayoutDashboard, Home, Coffee, 
  MapPin, Menu, X, Share2, Briefcase, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const { user, logout, isDemoMode } = useAuth();
  const { globalCategory, setGlobalCategory } = useHotels();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case UserRole.ADMIN: return '/admin';
      case UserRole.HOTEL_OWNER: return '/owner';
      case UserRole.SUPPLIER: return '/supplier';
      case UserRole.SERVICE_PROVIDER: return '/service-dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e293b] text-white shadow-lg">
      {/* Demo Mode Badge */}
      {isDemoMode && (
        <div className="bg-[#fbbf24] text-[#1e293b] text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center animate-pulse">
          Active Demo Mode — No Database Connection
        </div>
      )}
      {/* Top Header */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-1.5 md:gap-2 text-xl md:text-2xl font-serif font-bold tracking-tight shrink-0">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.siteName} className="h-8 md:h-10 object-contain" />
          ) : (
            <Logo className="h-8 md:h-10 w-auto" />
          )}
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden items-center gap-4 md:flex">
            <Link to="/owner" className="text-sm font-medium hover:bg-white/10 px-3 py-2 rounded-md transition-colors text-neutral-300">
              List your Property
            </Link>
            <Link to="/service-dashboard" className="text-sm font-medium text-[#fbbf24] hover:bg-white/10 px-3 py-2 rounded-md transition-colors">
              List your Service
            </Link>
            <Link to="/supplier" className="text-sm font-medium hover:bg-white/10 px-3 py-2 rounded-md transition-colors text-neutral-300">
              Join as Supplier
            </Link>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 text-[#fbbf24] transition-all active:scale-95"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <Link to={getDashboardLink()} className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm font-medium hover:text-[#fbbf24]">
                  <LayoutDashboard className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 md:px-4 py-1">
                  <User className="h-3 w-3 md:h-4 md:w-4 text-[#fbbf24]" />
                  <span className="text-[10px] md:text-sm font-medium">{user.name.split(' ')[0]}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/10 h-8 w-8 p-0"
                  onClick={() => { logout(); navigate('/'); }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 md:gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10 font-bold text-[10px] md:text-sm px-2 md:px-4">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-[#fbbf24] text-[#1e293b] hover:bg-[#fbbf24]/90 font-bold border-none text-[10px] md:text-sm px-3 md:px-6 h-9 md:h-10">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-[70] w-full max-w-xs bg-[#1e293b] shadow-2xl overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <span className="text-xl font-serif font-bold text-[#fbbf24]">Menu</span>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="flex-1 px-4 py-8 space-y-4">
                  <Link 
                    to="/owner" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#fbbf24] transition-all"
                  >
                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-[#fbbf24] shrink-0">
                      <Home className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">List your Property</p>
                      <p className="text-xs text-neutral-400">For BnB and Holiday House owners</p>
                    </div>
                  </Link>

                  <Link 
                    to="/service-dashboard" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 w-full p-4 rounded-2xl bg-[#fbbf24]/5 border border-[#fbbf24]/20 hover:border-[#fbbf24] transition-all"
                  >
                    <div className="h-12 w-12 rounded-xl bg-[#fbbf24] flex items-center justify-center text-[#1e293b] shrink-0">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">List your Service</p>
                      <p className="text-xs text-[#fbbf24]">Transport, Tours & Food</p>
                    </div>
                  </Link>

                  <Link 
                    to="/supplier" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#fbbf24] transition-all"
                  >
                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-[#fbbf24] shrink-0">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">Join as Supplier</p>
                      <p className="text-xs text-neutral-400">Services for property owners</p>
                    </div>
                  </Link>

                  <div className="pt-8 space-y-4 border-t border-white/10">
                    {user ? (
                      <>
                        <Link 
                          to={getDashboardLink()} 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-4 text-white hover:text-[#fbbf24] transition-colors p-2"
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          <span className="font-bold">Dashboard</span>
                        </Link>
                        <button 
                          onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}
                          className="flex items-center gap-4 text-red-400 hover:text-red-300 transition-colors p-2 w-full text-left"
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="font-bold">Logout</span>
                        </button>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="ghost" className="w-full text-white border border-white/20 h-12">Sign in</Button>
                        </Link>
                        <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                          <Button className="w-full bg-[#fbbf24] text-[#1e293b] h-12">Register</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lower Navigation Bar */}
      <div className="border-t border-white/10 overflow-x-auto scrollbar-hide">
        <div className="mx-auto flex h-10 md:h-12 max-w-7xl items-center gap-1.5 md:gap-2 px-4 md:px-6 min-w-max">
          <button 
            onClick={() => {
              setGlobalCategory(globalCategory === 'holiday_house' ? null : 'holiday_house');
              navigate('/');
            }}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-1 text-[10px] md:text-sm font-bold transition-all rounded-full border cursor-pointer ${
              globalCategory === 'holiday_house' 
                ? 'border-[#fbbf24] bg-[#fbbf24]/10 text-[#fbbf24]' 
                : 'border-transparent hover:bg-white/5 text-white'
            }`}
          >
            <Home className="h-3 w-3 md:h-4 md:w-4" />
            Holiday House
          </button>
          <button 
            onClick={() => {
              setGlobalCategory(globalCategory === 'bnb' ? null : 'bnb');
              navigate('/');
            }}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-1 text-[10px] md:text-sm font-bold transition-all rounded-full border cursor-pointer ${
              globalCategory === 'bnb' 
                ? 'border-[#fbbf24] bg-[#fbbf24]/10 text-[#fbbf24]' 
                : 'border-transparent hover:bg-white/5 text-white'
            }`}
          >
            <Coffee className="h-3 w-3 md:h-4 md:w-4" />
            Bed & Breakfast
          </button>
          <Link 
            to="/map"
            className={`flex items-center gap-1.5 px-3 md:px-4 py-1 text-[10px] md:text-sm font-bold transition-all rounded-full border cursor-pointer ${
              location.pathname === '/map'
                ? 'border-[#fbbf24] bg-[#fbbf24]/10 text-[#fbbf24]' 
                : 'border-transparent hover:bg-white/5 text-white'
            }`}
          >
            <MapPin className="h-3 w-3 md:h-4 md:w-4" />
            Map
          </Link>
          <Link 
            to="/services"
            className={`flex items-center gap-1.5 px-3 md:px-4 py-1 text-[10px] md:text-sm font-bold transition-all rounded-full border cursor-pointer ${
              location.pathname === '/services'
                ? 'border-[#fbbf24] bg-[#fbbf24]/10 text-[#fbbf24]' 
                : 'border-transparent hover:bg-white/5 text-white'
            }`}
          >
            <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
            Experiences
          </Link>
        </div>
      </div>
    </nav>
  );
};
