import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MapPin, Heart, ArrowRight, Loader2 } from 'lucide-react';

const PetGallery = ({ onSelectPet }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        // Joining with shelter_profiles to get location/org name
        const { data, error } = await supabase
          .from('pets')
          .select(`
            *,
            shelter_profiles(org_name)
          `)
          .eq('status', 'Available')
          .limit(8);

        if (error) throw error;
        setPets(data || []);
      } catch (err) {
        console.error('Error fetching pets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 italic">Newly Added Pals</h2>
            <p className="text-slate-500 font-medium tracking-wide">Meet the newest arrivals waiting for a home.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-brand-600 font-bold hover:gap-3 transition-all">
            See All Pets <ArrowRight size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {pets.map((pet) => (
              <div key={pet.pet_id} className="group relative" onClick={() => onSelectPet(pet)}>
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-100 relative shadow-soft cursor-pointer">
                  {pet.avatar_url ? (
                    <img 
                      src={pet.avatar_url} 
                      alt={pet.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 italic font-bold">No Photo</div>
                  )}
                  
                  {/* Tags */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-slate-900 text-[10px] uppercase font-black tracking-widest rounded-full shadow-sm">
                      {pet.species}
                    </span>
                  </div>
                  
                  <button className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur text-slate-400 hover:text-red-500 rounded-full shadow-sm transition-colors">
                    <Heart size={18} />
                  </button>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Quick Action */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-2xl shadow-xl hover:bg-brand-600 hover:text-white transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>

                <div className="mt-5 px-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{pet.name}</h3>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                        <MapPin size={14} className="text-tangerine-500" />
                        {pet.shelter_profiles?.org_name || 'PetPals Shelter'}
                      </p>
                    </div>
                    <span className="text-lg font-black text-brand-600">
                      {pet.age} <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">yrs</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PetGallery;
