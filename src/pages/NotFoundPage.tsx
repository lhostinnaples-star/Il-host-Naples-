import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <SEOHead 
        title="404 - Page Not Found"
        description="The page you are looking for does not exist."
        noindex
      />
      <div className="text-center max-w-md">
        <h1 className="text-6xl md:text-8xl font-black text-[#F5A623] mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Page Not Found</h2>
        <p className="text-[#94a3b8] mb-8">
          The page you are looking for does not exist, has been moved, or is temporarily unavailable.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-[#F5A623] text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#F5A623]/90 transition-all shadow-lg shadow-[#F5A623]/20"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

// Must export default for React.lazy
export default NotFoundPage;
