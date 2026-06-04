import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'sonner';
import { Button, Input, Textarea, Card } from './UI';
import { Mail } from 'lucide-react';

interface ContactFormProps {
  entityId: string | undefined;
  entityName: string | undefined;
  entityType: 'hotel' | 'service' | 'supplier';
  adminEmail?: string;
  theme?: 'light' | 'dark';
}

export const ContactForm: React.FC<ContactFormProps> = ({ entityId, entityName, entityType, adminEmail = 'admin@lhostinnaples.com', theme = 'light' }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'contact_requests'), {
        ...formData,
        entityId: entityId || 'unknown',
        entityName: entityName || 'Unknown Entity',
        entityType,
        createdAt: serverTimestamp(),
        adminEmail,   // Using Cloud Function to send email if desired, or just triggering your log.
      });

      console.log('EMAIL TO ADMIN:', `New contact request for ${entityType} - ${entityName} from ${formData.name} (${formData.email})`);

      toast.success('Your message has been sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bgClass = theme === 'dark' ? 'bg-[#1e293b] border-[#334155]' : 'bg-neutral-50/50 border-neutral-100';
  const textClass = theme === 'dark' ? 'text-white' : 'text-[#1e293b]';
  const inputClass = theme === 'dark' ? 'bg-[#0f172a] border-[#334155] text-white' : 'bg-white';

  return (
    <Card className={`p-6 md:p-8 border rounded-3xl mt-8 ${bgClass}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center">
          <Mail className="h-5 w-5 text-[#fbbf24]" />
        </div>
        <div>
          <h3 className={`font-bold text-lg ${textClass}`}>Send a Message</h3>
          <p className="text-sm text-neutral-500">Have questions about {entityName}? Send us a message directly.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            placeholder="Your Name" 
            value={formData.name} 
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            className={inputClass}
          />
          <Input 
            type="email" 
            placeholder="Your Email" 
            value={formData.email} 
            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
            className={inputClass}
          />
        </div>
        <Textarea 
          placeholder="What would you like to ask?" 
          value={formData.message} 
          onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
          className={`${inputClass} min-h-[100px]`}
        />
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-[#fbbf24] text-[#1e293b] hover:bg-[#1e293b] hover:text-[#fbbf24]"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </Card>
  );
};
