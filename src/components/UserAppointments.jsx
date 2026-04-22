import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useToast } from './Toast';
import {
    Calendar,
    Clock,
    MapPin,
    Search,
    Phone,
    Plus,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Stethoscope,
    Building2,
    MessageSquare
} from 'lucide-react';

// ─── Status badge helper ────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        Pending:   'bg-amber-50   text-amber-600  border-amber-200',
        Confirmed: 'bg-brand-50   text-brand-600  border-brand-200',
        Completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        Cancelled: 'bg-red-50     text-red-500    border-red-200',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${map[status] || 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            {status}
        </span>
    );
};

// ─── Skeleton loader ─────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-slate-100 rounded-3xl ${className}`} />
);

// ─── Main Component ──────────────────────────────────────────────────────────
const UserAppointments = ({ user }) => {
    const toast = useToast();
    const navigate = useNavigate();
    const [clinics,       setClinics]       = useState([]);
    const [appointments,  setAppointments]  = useState([]);
    const [myPets,        setMyPets]        = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [clinicsLoading, setClinicsLoading] = useState(true);
    const [searchQuery,   setSearchQuery]   = useState('');
    const [bookingOpen,   setBookingOpen]   = useState(false);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [bookingStep,   setBookingStep]   = useState(1);  // 1=details, 2=success
    const [submitting,    setSubmitting]    = useState(false);
    const [tab,           setTab]           = useState('upcoming'); // upcoming | history

    // Booking form state
    const [form, setForm] = useState({
        pet_id:           '',
        appointment_date: '',
        appointment_time: '10:00',
        reason:           '',
    });

    // ── Fetch on mount ────────────────────────────────────────────────────────
    useEffect(() => {
        fetchClinics();
        fetchAppointments();
        fetchMyPets();
    }, [user]);

    const fetchClinics = async () => {
        try {
            setClinicsLoading(true);
            const { data, error } = await supabase
                .from('clinics')
                .select('clinic_id, name, location, phone, logo_url');
            if (error) throw error;
            setClinics(data || []);
        } catch (err) {
            console.error('Clinics fetch error:', err);
        } finally {
            setClinicsLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('appointments')
                .select('*, clinics(clinic_id, name, location)')
                .eq('user_id', user.id)
                .order('appointment_date', { ascending: false });
            if (error) throw error;
            setAppointments(data || []);
        } catch (err) {
            console.error('Appointments fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyPets = async () => {
        try {
            const { data } = await supabase
                .from('pets')
                .select('pet_id, name, species')
                .eq('owner_id', user.id);
            setMyPets(data || []);
        } catch (err) {
            console.error('Pets fetch error:', err);
        }
    };

    // ── Booking logic ─────────────────────────────────────────────────────────
    const openBooking = (clinic) => {
        setSelectedClinic(clinic);
        setForm({ pet_id: '', appointment_date: '', appointment_time: '10:00', reason: '' });
        setBookingStep(1);
        setBookingOpen(true);
    };

    const closeBooking = () => {
        setBookingOpen(false);
        setSelectedClinic(null);
        setBookingStep(1);
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Combine date + time into ISO string
            const combined = new Date(`${form.appointment_date}T${form.appointment_time}:00`);

            const { error } = await supabase.from('appointments').insert({
                user_id:          user.id,
                clinic_id:        selectedClinic.clinic_id,
                appointment_date: combined.toISOString(),
                reason:           form.reason || null,
                status:           'Pending',
            });
            if (error) throw error;

            setBookingStep(2);
            // Refresh list in background
            fetchAppointments();
        } catch (err) {
            toast({ type: 'error', message: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Derived data ──────────────────────────────────────────────────────────
    const now = new Date().toISOString();
    const upcoming = appointments.filter(a => a.appointment_date >= now && a.status !== 'Cancelled' && a.status !== 'Completed');
    const history  = appointments.filter(a => a.appointment_date < now || a.status === 'Completed' || a.status === 'Cancelled');

    const filteredClinics = clinics.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayedAppointments = tab === 'upcoming' ? upcoming : history;

    // Minimum bookable date = today
    const todayStr = new Date().toISOString().split('T')[0];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="p-6 md:p-10 space-y-10 bg-slate-50 min-h-full pb-24 md:pb-10">

            {/* ── Page Header ── */}
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Appointments</h1>
                <p className="text-slate-500 font-medium italic">Book a vet visit or check your history.</p>
            </div>

            {/* ── My Appointments ── */}
            <section>
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'upcoming', label: `Upcoming (${upcoming.length})` },
                        { id: 'history',  label: `History (${history.length})` },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${tab === t.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 border border-slate-100 hover:border-brand-200'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => <Skeleton key={i} className="h-28" />)}
                    </div>
                ) : displayedAppointments.length > 0 ? (
                    <div className="space-y-4">
                        {displayedAppointments.map(appt => {
                            const apptDate = new Date(appt.appointment_date);
                            return (
                                <div
                                    key={appt.appointment_id}
                                    className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-soft flex flex-col md:flex-row md:items-center gap-6 hover:shadow-md transition-all"
                                >
                                    {/* Date block */}
                                    <div className="w-16 h-16 bg-brand-50 rounded-2xl flex flex-col items-center justify-center text-brand-600 shrink-0">
                                        <span className="text-xl font-black leading-none">{apptDate.getDate()}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                                            {apptDate.toLocaleString('en-US', { month: 'short' })}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-900 text-lg truncate">
                                            {appt.clinics?.name || 'Clinic'}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                            {appt.clinics?.location && (
                                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                    <MapPin size={12} className="text-tangerine-500" />
                                                    {appt.clinics.location}
                                                </p>
                                            )}
                                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <Clock size={12} className="text-brand-500" />
                                                {apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {appt.reason && (
                                            <p className="text-xs text-slate-500 font-medium mt-2 italic truncate">
                                                Reason: {appt.reason}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={appt.status} />
                                        <button
                                            onClick={() => navigate('/messages')}
                                            className="p-2 text-slate-300 hover:text-brand-600 transition-colors"
                                        >
                                            <MessageSquare size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-14 text-center">
                        <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
                        <h3 className="text-lg font-black text-slate-900 mb-1">
                            {tab === 'upcoming' ? 'No upcoming visits' : 'No past visits'}
                        </h3>
                        <p className="text-slate-400 font-medium italic text-sm">
                            {tab === 'upcoming' ? 'Browse the clinics below and book one!' : 'Your completed appointments will appear here.'}
                        </p>
                    </div>
                )}
            </section>

            {/* ── Clinic Browser ── */}
            <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Find a Clinic</h2>
                    </div>
                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or location…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full md:w-72 pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-soft focus:ring-2 focus:ring-brand-500 font-medium transition-all text-sm"
                        />
                    </div>
                </div>

                {clinicsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
                    </div>
                ) : filteredClinics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredClinics.map(clinic => (
                            <div
                                key={clinic.clinic_id}
                                className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-soft hover:shadow-xl transition-all group flex flex-col gap-5"
                            >
                                {/* Clinic logo / icon */}
                                <div className="flex items-center gap-4">
                                    {clinic.logo_url ? (
                                        <img
                                            src={clinic.logo_url}
                                            alt={clinic.name}
                                            className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                                            <Stethoscope size={28} />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-900 text-lg truncate">{clinic.name}</h3>
                                        {clinic.location && (
                                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                                <MapPin size={11} className="text-tangerine-500 shrink-0" />
                                                {clinic.location}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {clinic.phone && (
                                    <a
                                        href={`tel:${clinic.phone}`}
                                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors"
                                    >
                                        <Phone size={14} />
                                        {clinic.phone}
                                    </a>
                                )}

                                <div className="mt-auto flex gap-2">
                                    <button
                                        onClick={() => openBooking(clinic)}
                                        className="flex-1 py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-2 group-hover:gap-3"
                                    >
                                        <Plus size={18} />
                                        Book
                                    </button>
                                    <button
                                        onClick={() => navigate('/messages')}
                                        className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl flex items-center justify-center transition-all shrink-0"
                                    >
                                        <MessageSquare size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-14 text-center">
                        <Building2 className="mx-auto text-slate-200 mb-4" size={48} />
                        <h3 className="text-lg font-black text-slate-900 mb-1">No clinics found</h3>
                        <p className="text-slate-400 font-medium italic text-sm">Try a different search term.</p>
                    </div>
                )}
            </section>

            {/* ── Booking Modal ── */}
            {bookingOpen && selectedClinic && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-t-[3rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500 max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="p-8 pb-6 border-b border-slate-100 flex items-start justify-between shrink-0">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                    {bookingStep === 2 ? 'Booked!' : 'Book Appointment'}
                                </p>
                                <h2 className="text-2xl font-black text-slate-900">{selectedClinic.name}</h2>
                                {selectedClinic.location && (
                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1">
                                        <MapPin size={11} className="text-tangerine-500" />
                                        {selectedClinic.location}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={closeBooking}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* ── Step 1: Form ── */}
                        {bookingStep === 1 && (
                            <form onSubmit={handleBooking} className="overflow-y-auto no-scrollbar p-8 space-y-6">

                                {/* Date + Time row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                            Date
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input
                                                type="date"
                                                required
                                                min={todayStr}
                                                value={form.appointment_date}
                                                onChange={e => setForm({ ...form, appointment_date: e.target.value })}
                                                className="w-full pl-10 pr-3 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                            Time
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input
                                                type="time"
                                                required
                                                value={form.appointment_time}
                                                onChange={e => setForm({ ...form, appointment_time: e.target.value })}
                                                className="w-full pl-10 pr-3 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Pet selector (optional — only if user has pets) */}
                                {myPets.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                            Which Pet? <span className="normal-case text-slate-300 font-medium">(optional)</span>
                                        </label>
                                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, pet_id: '' })}
                                                className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all border-2 ${!form.pet_id ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                                            >
                                                General
                                            </button>
                                            {myPets.map(pet => (
                                                <button
                                                    type="button"
                                                    key={pet.pet_id}
                                                    onClick={() => setForm({ ...form, pet_id: pet.pet_id })}
                                                    className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all border-2 ${form.pet_id === pet.pet_id ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                                                >
                                                    {pet.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reason */}
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        Reason <span className="normal-case text-slate-300 font-medium">(optional)</span>
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder="e.g. Annual check-up, vaccination, skin issue…"
                                        value={form.reason}
                                        onChange={e => setForm({ ...form, reason: e.target.value })}
                                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-sm italic resize-none"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeBooking}
                                        className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {submitting
                                            ? <Loader2 size={20} className="animate-spin" />
                                            : (<><Calendar size={18} /><span>Confirm Booking</span></>)
                                        }
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── Step 2: Success ── */}
                        {bookingStep === 2 && (
                            <div className="p-10 flex flex-col items-center text-center gap-6 animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-2">You're Booked!</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto italic">
                                        Your appointment at <strong className="text-slate-800 not-italic">{selectedClinic.name}</strong> has been submitted.
                                        The clinic will confirm shortly.
                                    </p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-3xl w-full flex items-center gap-4 text-left">
                                    <AlertCircle size={18} className="text-amber-500 shrink-0" />
                                    <p className="text-xs font-bold text-slate-500">
                                        Check your appointment status in the <em>Upcoming</em> tab above.
                                    </p>
                                </div>
                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={() => setSelectedClinic(null) || setBookingStep(1) || setBookingOpen(false)}
                                        className="flex-1 py-3.5 bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95 text-sm"
                                    >
                                        Done
                                    </button>
                                    <button
                                        onClick={() => navigate('/messages')}
                                        className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl flex items-center justify-center transition-all shrink-0"
                                    >
                                        <MessageSquare size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAppointments;
