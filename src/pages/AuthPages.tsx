import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole, UserStatus } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { Hotel, User, Home, Wrench, Car, ArrowRight, ArrowLeft, CheckCircle2, Mail, Loader2, AlertCircle } from 'lucide-react';
import { ImageUpload } from '../components/ImageUpload';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        login(data.token, data.user);
        
        // Handle redirection based on role and status
        const { role, status } = data.user;
        
        if (status === UserStatus.ACTIVE || status === UserStatus.PENDING_APPROVAL || status === UserStatus.REJECTED || status === UserStatus.SUSPENDED) {
           if (role === UserRole.ADMIN) navigate('/admin');
           else if (role === UserRole.HOTEL_OWNER) navigate('/owner');
           else if (role === UserRole.SUPPLIER) navigate('/supplier');
           else if (role === UserRole.SERVICE_PROVIDER) navigate('/service-dashboard');
           else navigate('/dashboard');
        } else if (status === UserStatus.PENDING_VERIFICATION) {
           // We will stay on a verification screen or navigate to dashboard where StatusGate handles it
           navigate('/dashboard');
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-3xl font-bold tracking-tighter text-white">
            <Hotel className="h-10 w-10 text-[#fbbf24]" />
            <span className="text-[#fbbf24]">Lhost</span><span>in Naples</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-neutral-500">Enter your credentials to access your account</p>
        </div>

        <Card className="border-white/10 bg-white/5 text-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-400">Email Address</label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#fbbf24]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-400">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#fbbf24]"
              />
            </div>
            <Button className="w-full bg-[#fbbf24] text-black hover:bg-yellow-400 font-bold h-12" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Sign In'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Don't have an account? <Link to="/register" className="font-bold text-[#fbbf24] hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

type Step = 'role-selection' | 'basic-info' | 'role-specific' | 'verification';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>('role-selection');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: UserRole.CUSTOMER,
    acceptTerms: false,
    roleDetails: {} as any
  });

  const roles = [
    { id: UserRole.CUSTOMER, title: 'Guest / Customer', desc: 'Book unique stays and services', icon: User, color: 'text-blue-400' },
    { id: UserRole.HOTEL_OWNER, title: 'Property Lister', desc: 'List your BnB or Holiday House', icon: Home, color: 'text-purple-400' },
    { id: UserRole.SUPPLIER, title: 'Supplier', desc: 'Provide cleaning, linen or kits', icon: Wrench, color: 'text-yellow-400' },
    { id: UserRole.SERVICE_PROVIDER, title: 'Service Provider', desc: 'Excursions, rentals & more', icon: Car, color: 'text-green-400' },
  ];

  const handleRoleSelect = (roleId: UserRole) => {
    setFormData(prev => ({ ...prev, role: roleId }));
    setStep('basic-info');
  };

  const nextStep = () => {
    if (step === 'basic-info') {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }
      if (!formData.acceptTerms) {
        toast.error("Please accept terms & conditions");
        return;
      }
      
      if (formData.role === UserRole.CUSTOMER) {
        handleFinalSubmit();
      } else {
        setStep('role-specific');
      }
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Simulate registration
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: formData.role === UserRole.CUSTOMER ? UserStatus.ACTIVE : UserStatus.PENDING_APPROVAL
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        console.log('Sending verification email to:', formData.email);
        login(data.token, data.user);
        setStep('verification');
      } else {
        setError(data.error);
        toast.error(data.error);
      }
    } catch (err) {
      setError('Registration failed');
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-20">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-2 text-3xl font-bold tracking-tighter text-white">
                <Hotel className="h-10 w-10 text-[#fbbf24]" />
                <span className="text-[#fbbf24]">Lhost</span><span>in Naples</span>
            </Link>
            
            {/* Progress Bar */}
            <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-2">
                {['role-selection', 'basic-info', 'role-specific', 'verification'].map((s, idx) => {
                    const stepOrder = ['role-selection', 'basic-info', 'role-specific', 'verification'];
                    const currentIdx = stepOrder.indexOf(step);
                    const isCompleted = stepOrder.indexOf(s as Step) < currentIdx;
                    const isActive = s === step;
                    
                    if (s === 'role-specific' && formData.role === UserRole.CUSTOMER) return null;

                    return (
                        <div key={s} className="flex items-center flex-1 last:flex-none">
                            <div className={`h-2 flex-1 rounded-full ${isCompleted ? 'bg-[#fbbf24]' : isActive ? 'bg-[#fbbf24]/50' : 'bg-white/10'}`} />
                        </div>
                    );
                })}
            </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'role-selection' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6 md:grid-cols-2"
            >
              <div className="md:col-span-2 text-center mb-4">
                <h2 className="text-3xl font-bold text-white">Join as a...</h2>
                <p className="text-neutral-500">Pick the role that fits your goals on our platform</p>
              </div>
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  className="group relative flex flex-col items-start rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all hover:border-[#fbbf24] hover:bg-white/10"
                >
                  <div className={`mb-4 rounded-2xl bg-white/5 p-4 ${r.color}`}>
                    <r.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#fbbf24] transition-colors">{r.title}</h3>
                  <p className="mt-2 text-neutral-500">{r.desc}</p>
                  <ArrowRight className="absolute bottom-8 right-8 h-6 w-6 text-neutral-700 transition-all group-hover:translate-x-2 group-hover:text-[#fbbf24]" />
                </button>
              ))}
            </motion.div>
          )}

          {step === 'basic-info' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-xl"
            >
              <Card className="border-white/10 bg-white/5 text-white">
                <div className="mb-8 flex items-center gap-4">
                    <button onClick={() => setStep('role-selection')} className="text-neutral-500 hover:text-white transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h2 className="text-2xl font-bold">Account Details</h2>
                </div>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Full Name</label>
                        <Input 
                            placeholder="John Doe" 
                            className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#fbbf24]" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Phone Number</label>
                        <Input 
                            placeholder="+39 333..." 
                            className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#fbbf24]" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            required
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Email Address</label>
                      <Input 
                        type="email"
                        placeholder="john@example.com" 
                        className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#fbbf24]" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Password</label>
                        <Input 
                            type="password"
                            placeholder="••••••••" 
                            className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#fbbf24]" 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Confirm Password</label>
                        <Input 
                            type="password"
                            placeholder="••••••••" 
                            className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#fbbf24]" 
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            required
                        />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-4">
                    <input 
                        type="checkbox" 
                        id="terms" 
                        className="mt-1"
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                        required
                    />
                    <label htmlFor="terms" className="text-sm text-neutral-400 leading-tight">
                        I agree to the <span className="text-[#fbbf24] hover:underline cursor-pointer">Terms of Service</span> and <span className="text-[#fbbf24] hover:underline cursor-pointer">Privacy Policy</span>
                    </label>
                  </div>

                  <Button className="w-full bg-[#fbbf24] text-black hover:bg-yellow-400 font-bold h-12 mt-4" type="submit">
                    {formData.role === UserRole.CUSTOMER ? 'Create Account' : 'Continue to Next Step'}
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {step === 'role-specific' && (
            <motion.div
              key="specific"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-2xl"
            >
              <Card className="border-white/10 bg-white/5 text-white">
                <div className="mb-8 flex items-center gap-4">
                    <button onClick={() => setStep('basic-info')} className="text-neutral-500 hover:text-white transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h2 className="text-2xl font-bold">Business Context</h2>
                </div>

                <div className="space-y-8">
                    {formData.role === UserRole.HOTEL_OWNER && (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Property Type</label>
                                    <select 
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#fbbf24]"
                                        onChange={(e) => setFormData({...formData, roleDetails: {...formData.roleDetails, propertyType: e.target.value}})}
                                    >
                                        <option value="BnB">BnB (Bed & Breakfast)</option>
                                        <option value="Holiday House">Holiday House</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">CIR Code</label>
                                    <Input 
                                        placeholder="12345678" 
                                        className="bg-white/5 border-white/10 text-white focus:border-[#fbbf24]" 
                                        onChange={(e) => setFormData({...formData, roleDetails: {...formData.roleDetails, cirCode: e.target.value}})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Property Address (Naples)</label>
                                <Input 
                                    placeholder="Via Toledo, 12, Napoli" 
                                    className="bg-white/5 border-white/10 text-white focus:border-[#fbbf24]" 
                                    onChange={(e) => setFormData({...formData, roleDetails: {...formData.roleDetails, address: e.target.value}})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Short Bio / Description</label>
                                <textarea 
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#fbbf24]"
                                    rows={3}
                                    placeholder="Tell us about yourself and your property"
                                    onChange={(e) => setFormData({...formData, roleDetails: {...formData.roleDetails, bio: e.target.value}})}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">ID Document Upload</label>
                                <ImageUpload 
                                    maxImages={1} 
                                    onImagesChange={(imgs) => setFormData({...formData, roleDetails: {...formData.roleDetails, idDocument: imgs[0]}})}
                                    storagePath="id_documents"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Initial Property Photos (Max 3)</label>
                                <ImageUpload 
                                    maxImages={3} 
                                    onImagesChange={(imgs) => setFormData({...formData, roleDetails: {...formData.roleDetails, propertyPhotos: imgs}})}
                                    storagePath="temp_properties"
                                />
                            </div>
                        </div>
                    )}

                    {formData.role === UserRole.SUPPLIER && (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Company Name</label>
                                    <Input 
                                        placeholder="Supplier SpA" 
                                        className="bg-white/5 border-white/10 text-white focus:border-[#fbbf24]" 
                                        onChange={(e) => setFormData({...formData, roleDetails: {...formData.roleDetails, companyName: e.target.value}})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">VAT Number (P. IVA)</label>
                                    <Input 
                                        placeholder="IT12345678901" 
                                        className="bg-white/5 border-white/10 text-white focus:border-[#fbbf24]" 
                                        onChange={(e) => setFormData({...formData, roleDetails: {...formData.roleDetails, vatNumber: e.target.value}})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Service Categories</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Cleaning', 'Linen & Towels', 'Welcome Kits', 'Furniture', 'Maintenance', 'Other'].map(cat => (
                                        <label key={cat} className="flex items-center gap-2 p-3 rounded-lg border border-white/10 text-sm hover:border-[#fbbf24]/50 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                onChange={(e) => {
                                                    const current = formData.roleDetails.categories || [];
                                                    const updated = e.target.checked ? [...current, cat] : current.filter((c: string) => c !== cat);
                                                    setFormData({...formData, roleDetails: {...formData.roleDetails, categories: updated}});
                                                }}
                                            />
                                            {cat}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Business License / Registration</label>
                                <ImageUpload 
                                    maxImages={1} 
                                    onImagesChange={(imgs) => setFormData({...formData, roleDetails: {...formData.roleDetails, businessLicense: imgs[0]}})}
                                    storagePath="licenses"
                                />
                            </div>
                        </div>
                    )}

                    {formData.role === UserRole.SERVICE_PROVIDER && (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Business / Personal Name</label>
                                    <Input 
                                        placeholder="Naples Tours" 
                                        className="bg-white/5 border-white/10 text-white focus:border-[#fbbf24]" 
                                        onChange={(e) => setFormData({...formData, roleDetails: {...formData.roleDetails, businessName: e.target.value}})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Service Type</label>
                                    <select 
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#fbbf24]"
                                        onChange={(e) => setFormData({...formData, roleDetails: {...formData.roleDetails, serviceType: e.target.value}})}
                                    >
                                        <option value="Car Rental">Car Rental</option>
                                        <option value="Bike Rental">Bike Rental</option>
                                        <option value="Boat Tour">Boat Tour</option>
                                        <option value="City Tour">City Tour</option>
                                        <option value="Airport Transfer">Airport Transfer</option>
                                        <option value="Private Chef">Private Chef</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Base Pricing (Starting from)</label>
                                <Input 
                                    placeholder="€50.00" 
                                    className="bg-white/5 border-white/10 text-white focus:border-[#fbbf24]" 
                                    onChange={(e) => setFormData({...formData, roleDetails: {...formData.roleDetails, basePricing: e.target.value}})}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">License / Permit Upload</label>
                                <ImageUpload 
                                    maxImages={1} 
                                    onImagesChange={(imgs) => setFormData({...formData, roleDetails: {...formData.roleDetails, license: imgs[0]}})}
                                    storagePath="service_permits"
                                />
                            </div>
                        </div>
                    )}
                    
                    <Button 
                        className="w-full bg-[#fbbf24] text-black hover:bg-yellow-400 font-bold h-12" 
                        onClick={handleFinalSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Submit for Approval'}
                    </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-md text-center bg-white/5 border border-white/10 p-12 rounded-[40px] backdrop-blur-xl"
            >
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#fbbf24]/10 mb-8">
                    <Mail className="h-10 w-10 text-[#fbbf24]" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Check your email</h2>
                <p className="text-neutral-500 mb-8">
                    We've sent a verification link to <span className="text-white font-bold">{formData.email}</span>. 
                    Please click the link to verify your account.
                </p>
                <div className="space-y-3">
                    <Button 
                        className="w-full bg-[#fbbf24] text-black hover:bg-yellow-400 font-bold" 
                        onClick={() => toast.success('Verification email resent!')}
                    >
                        Resend Email
                    </Button>
                    <Button 
                        variant="ghost" 
                        className="w-full text-neutral-400 hover:text-white"
                        onClick={() => navigate('/login')}
                    >
                        Return to Login
                    </Button>
                </div>
                
                {/* Mock Verification Button for Preview */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <p className="text-xs text-neutral-600 mb-4">Preview Only: Fast-track email verification</p>
                    <Button 
                        variant="outline" 
                        className="w-full border-white/10 text-white hover:bg-white/10 text-xs"
                        onClick={() => {
                            toast.success('Email verified successfully!');
                            navigate(formData.role === UserRole.CUSTOMER ? '/dashboard' : '/dashboard'); // Nav to dashboard where status gate will show pending
                        }}
                    >
                        Simulate Email Verification
                    </Button>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'verification' && (
            <p className="mt-8 text-center text-sm text-neutral-500">
                Already have an account? <Link to="/login" className="font-bold text-[#fbbf24] hover:underline">Sign in</Link>
            </p>
        )}
      </div>
    </div>
  );
};
