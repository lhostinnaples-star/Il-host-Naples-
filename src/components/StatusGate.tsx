import React from 'react';
import { useAuth, UserStatus, UserRole } from '../contexts/AuthContext';
import { Mail, Clock, AlertCircle, ShieldAlert, Phone } from 'lucide-react';
import { Button, Card } from './UI';
import { useNavigate } from 'react-router-dom';

export const StatusGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <>{children}</>;

  if (user.status === UserStatus.ACTIVE) {
    return <>{children}</>;
  }

  if (user.status === UserStatus.PENDING_VERIFICATION) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
        <Card className="max-w-md text-center border-white/10 bg-white/5 text-white p-12">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#fbbf24]/10 mb-8">
                <Mail className="h-10 w-10 text-[#fbbf24]" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Verify your email</h2>
            <p className="text-neutral-500 mb-8">
                Please verify your email address to access your dashboard. We've sent a link to <span className="text-white">{user.email}</span>.
            </p>
            <div className="space-y-3">
                <Button className="w-full bg-[#fbbf24] text-black">Resend Verification Email</Button>
                <Button variant="ghost" className="w-full text-neutral-400" onClick={logout}>Sign Out</Button>
            </div>
        </Card>
      </div>
    );
  }

  if (user.status === UserStatus.PENDING_APPROVAL) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
        <Card className="max-w-md text-center border-white/10 bg-white/5 text-white p-12">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 mb-8">
                <Clock className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Under Review</h2>
            <p className="text-neutral-500 mb-8">
                Your account is currently under review by our team. This usually takes 24-48 hours. We'll notify you via email once approved.
            </p>
            <div className="space-y-3">
                <Button className="w-full bg-white text-black">Contact Support</Button>
                <Button variant="ghost" className="w-full text-neutral-400" onClick={logout}>Sign Out</Button>
            </div>
        </Card>
      </div>
    );
  }

  if (user.status === UserStatus.REJECTED) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
        <Card className="max-w-md text-center border-red-500/20 bg-white/5 text-white p-12">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 mb-8">
                <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Application Rejected</h2>
            <p className="text-neutral-500 mb-4">
                Unfortunately, your application was not approved at this time.
            </p>
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-8 text-left">
                <p className="text-xs font-bold text-red-400 uppercase mb-1">Reason:</p>
                <p className="text-sm text-red-100 italic">"The provided ID document is expired. Please upload a valid document or contact support."</p>
            </div>
            <div className="space-y-3">
                <Button className="w-full bg-[#fbbf24] text-black">Update Application</Button>
                <Button variant="ghost" className="w-full text-neutral-400" onClick={logout}>Sign Out</Button>
            </div>
        </Card>
      </div>
    );
  }

  if (user.status === UserStatus.SUSPENDED) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
        <Card className="max-w-md text-center border-neutral-800 bg-white/5 text-white p-12">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800 mb-8">
                <ShieldAlert className="h-10 w-10 text-neutral-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Account Suspended</h2>
            <p className="text-neutral-500 mb-8">
                Your account has been suspended for security reasons or violation of our terms. Please contact administration.
            </p>
            <div className="space-y-3">
                <Button className="w-full bg-white text-black">Contact Administration</Button>
                <Button variant="ghost" className="w-full text-neutral-400" onClick={logout}>Sign Out</Button>
            </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
