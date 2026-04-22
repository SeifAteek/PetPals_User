import React from 'react';
import { Search, MapPin, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6 overflow-hidden relative">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-bold mb-6 border border-brand-100 animate-bounce">
          <Sparkles size={14} />
          <span>Over 2,000+ happy adoptions this month</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8">
          Find your new <br />
          <span className="text-brand-600">best friend</span> today.
        </h1>
        
        <p className="max-w-2xl text-lg text-slate-600 mb-12 leading-relaxed">
          PetPals connects you with hundreds of local shelters and clinics 
          to find a companion that fits your life and home perfectly.
        </p>
        
        {/* Search Bar Container */}
        <div className="w-full max-w-4xl bg-white p-2 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row items-stretch gap-2">
          <div className="flex-1 flex items-center gap-3 px-6 py-4 border-r border-slate-100">
            <Search className="text-brand-500" size={24} />
            <input 
              type="text" 
              placeholder="Search by breed, age, or personality..." 
              className="w-full bg-transparent border-none focus:ring-0 text-slate-800 font-medium placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex-1 flex items-center gap-3 px-6 py-4">
            <MapPin className="text-tangerine-500" size={24} />
            <select className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 font-medium cursor-pointer">
              <option>Nearby (Your Location)</option>
              <option>Los Angeles, CA</option>
              <option>San Francisco, CA</option>
              <option>New York, NY</option>
            </select>
          </div>
          
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-10 py-5 rounded-[1.8rem] font-bold text-lg transition-all shadow-lg active:scale-95 whitespace-nowrap">
            Search Pets
          </button>
        </div>
        
        {/* Quick Filters */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {['Dogs', 'Cats', 'Birds', 'Rabbits', 'Special Needs'].map((label) => (
            <button 
              key={label}
              className="px-6 py-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 rounded-full text-sm font-semibold text-slate-600 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
