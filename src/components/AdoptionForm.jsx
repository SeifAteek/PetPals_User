import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, CheckCircle2, Loader2, Home, PawPrint, MessageSquare } from 'lucide-react';

const AdoptionForm = ({ pet, user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Profile Info, 2: Application Text/Finalize
  
  const [formData, setFormData] = useState({
    housing_type: 'Apartment',
    has_other_pets: false,
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit an application.");
      return;
    }

    try {
      setLoading(true);

      // 1. Check/Create Adopter Profile
      let adopter_id = null;
      const { data: profileCheck } = await supabase
        .from('adopter_profiles')
        .select('adopter_id')
        .eq('user_id', user.id)
        .single();

      if (!profileCheck) {
        // Create profile
        const { data: newProfile, error: profileError } = await supabase
          .from('adopter_profiles')
          .insert({
            user_id: user.id,
            housing_type: formData.housing_type,
            has_other_pets: formData.has_other_pets
          })
          .select()
          .single();
        
        if (profileError) throw profileError;
        adopter_id = newProfile.adopter_id;
      } else {
        adopter_id = profileCheck.adopter_id;
      }

      // 2. Submit Application
      const { error: appError } = await supabase
        .from('applications')
        .insert({
          pet_id: pet.pet_id,
          adopter_id: adopter_id,
          status: 'Under Review'
        });

      if (appError) throw appError;

      onSuccess();
      setStep(3); // Success step
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative">
        {/* Header Image/Banner */}
        <div className="h-32 bg-brand-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-tangerine-600 opacity-80"></div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all z-10"
          >
            <X size={20} />
          </button>
          
          <div className="absolute -bottom-10 left-10 w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-white overflow-hidden">
             {pet?.avatar_url ? (
               <img src={pet.avatar_url} alt={pet.name} className="w-full h-full object-cover" />
             ) : (
               <PawPrint className="text-brand-500" size={40} />
             )}
          </div>
        </div>

        <div className="px-10 pt-16 pb-10">
          {step === 1 && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Apply for {pet?.name}</h2>
              <p className="text-slate-500 font-medium mb-8 italic">Let the shelter know a little about your home.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                    <Home size={14} /> Housing Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Apartment', 'House', 'Farm'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFormData({...formData, housing_type: type})}
                        className={`py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all ${
                          formData.housing_type === type 
                          ? 'border-brand-600 bg-brand-50 text-brand-600' 
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-brand-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div>
                     <h4 className="font-bold text-slate-800">Other Pets?</h4>
                     <p className="text-xs text-slate-500 font-medium mt-0.5">Do you currently have other animals?</p>
                   </div>
                   <button 
                     onClick={() => setFormData({...formData, has_other_pets: !formData.has_other_pets})}
                     className={`w-14 h-8 rounded-full relative transition-colors ${formData.has_other_pets ? 'bg-brand-600' : 'bg-slate-300'}`}
                   >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.has_other_pets ? 'left-7' : 'left-1'}`}></div>
                   </button>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-95"
                >
                  Continue to Application
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Final Step</h2>
              <p className="text-slate-500 font-medium mb-8 italic">Why would you be a great match for {pet?.name}?</p>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                    <MessageSquare size={14} /> Adoption Msg
                  </label>
                  <textarea 
                    rows="4"
                    placeholder="Tell us about your lifestyle and experience with pets..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium text-slate-800"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-[2] py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-lg hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Application'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-8 text-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Application Sent!</h2>
              <p className="max-w-xs mx-auto text-slate-500 font-medium leading-relaxed mb-10">
                {pet?.name}'s shelter has received your application. We'll notify you as soon as they review it!
              </p>
              <button 
                onClick={onClose}
                className="px-10 py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-lg hover:bg-brand-700 transition-all active:scale-95"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdoptionForm;
