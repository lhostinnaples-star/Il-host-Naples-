import React from 'react';
import { motion } from 'motion/react';
import { Clock, ShieldAlert, XCircle, LogOut } from 'lucide-react';
import { Button } from './UI';
import { useAuth, UserStatus } from '../contexts/AuthContext';

interface PendingApprovalScreenProps {
  status: UserStatus;
  rejectionReason?: string;
}

export const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({ status, rejectionReason }) => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#1e293b] border border-[#334155] rounded-[2.5rem] p-10 shadow-2xl text-center"
      >
        <div className="mb-8">
          {status === UserStatus.PENDING_APPROVAL ? (
            <div className="h-20 w-20 rounded-3xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center mx-auto mb-6">
              <Clock className="h-10 w-10 text-[#fbbf24] animate-pulse" />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-white mb-4">
            {status === UserStatus.PENDING_APPROVAL ? 'Account Under Review' : 'Account Rejected'}
          </h1>
          
          <p className="text-[#94a3b8] font-medium leading-relaxed mb-8">
            {status === UserStatus.PENDING_APPROVAL 
              ? "Welcome to the Il Host network! Our team is currently reviewing your registration to maintain our premium quality standards. This usually takes 24-48 hours."
              : "We're sorry, but your application to join the Il Host network has been declined at this time."
            }
          </p>

          {status === UserStatus.REJECTED && rejectionReason && (
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl mb-8 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Reason for Rejection:</p>
              <p className="text-sm text-neutral-300 italic">"{rejectionReason}"</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center text-[10px] font-black uppercase tracking-widest text-[#64748b] bg-[#0f172a] py-3 rounded-xl border border-[#334155]">
              <ShieldAlert className="h-4 w-4 text-[#fbbf24]" />
              Il Host Trust & Safety Team
            </div>
            
            <Button 
              onClick={logout}
              variant="outline"
              className="w-full h-14 border-[#334155] text-white hover:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
        
        <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">
          Expected Review Time: 24-48 Business Hours
        </p>
      </motion.div>
    </div>
  );
};
