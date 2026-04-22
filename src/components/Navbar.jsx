import React from 'react';
import { Heart, User, MessageCircle, Menu } from 'lucide-react';

const Navbar = ({ onOpenDashboard }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/70 backdrop-blur-lg border border-white/20 shadow-soft rounded-2xl px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <Heart size={24} fill="currentColor" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">PetPals</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#" className="hover:text-brand-600 transition-colors">Find a Pet</a>
          <a href="#" className="hover:text-brand-600 transition-colors">Shelters</a>
          <a href="#" className="hover:text-brand-600 transition-colors">Clinics</a>
          <a href="#" className="hover:text-brand-600 transition-colors">Stories</a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenDashboard}
            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
          >
            <MessageCircle size={22} />
          </button>
          <button 
            onClick={onOpenDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <User size={18} />
            <span>Login</span>
          </button>
          <button className="md:hidden p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
