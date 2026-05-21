import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  PawPrint, User, Phone, Mail, AlertCircle, Loader2, Nfc,
  Heart, ArrowLeft
} from 'lucide-react';
import { fetchPublicPet, resolvePetImageUrl } from '../lib/petProfile';

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value ?? '—'}</p>
    </div>
  );
}

export default function PetPublicPage() {
  const { petId: routePetId } = useParams();
  const [searchParams] = useSearchParams();
  const petId = routePetId || searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pet, setPet] = useState(null);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    if (!petId) {
      setError('No pet ID provided. Scan a valid PetPals NFC tag.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchPublicPet(petId)
      .then((result) => {
        if (!result) {
          setError('Pet not found. This tag may be outdated or the profile was removed.');
          setPet(null);
          setOwner(null);
        } else {
          setPet(result.pet);
          setOwner(result.owner);
        }
      })
      .catch(() => setError('Unable to load this pet profile. Please try again later.'))
      .finally(() => setLoading(false));
  }, [petId]);

  const imageUrl = resolvePetImageUrl(pet?.avatar_url);
  const ownerName = owner?.user_name || pet?.guest_owner_name;
  const ownerPhone = owner?.phone_number || pet?.guest_phone;
  const ownerEmail = owner?.email;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5">
        <Loader2 size={40} className="animate-spin text-brand-400" />
        <p className="text-sm font-bold text-slate-400">Loading pet profile…</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-black">Profile unavailable</h1>
        <p className="mt-3 text-slate-400">{error}</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white"
        >
          <ArrowLeft size={16} />
          Back to PetPals
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* NFC badge */}
      <div className="border-b border-white/10 bg-brand-500/10 px-5 py-3 md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 text-sm font-bold text-brand-200">
          <Nfc size={18} />
          Opened via PetPals NFC · Verified pet profile
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 pt-8 md:px-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white">
          <ArrowLeft size={16} />
          PetPals home
        </Link>

        {/* Pet hero */}
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-900">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={pet.name}
                className="h-full w-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <PawPrint size={80} className="text-brand-500/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-300">
                {pet.status || 'Active'}
              </span>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{pet.name}</h1>
              <p className="mt-1 text-lg text-slate-300">
                {[pet.breed, pet.species].filter(Boolean).join(' · ') || 'Companion'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-6">
            <StatPill label="Age" value={pet.age != null ? `${pet.age} yr${pet.age === 1 ? '' : 's'}` : null} />
            <StatPill label="Species" value={pet.species} />
            <StatPill label="Status" value={pet.status} />
          </div>

          {pet.medical_history && (
            <div className="border-t border-white/10 px-6 py-5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">About</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{pet.medical_history}</p>
            </div>
          )}
        </div>

        {/* Owner contact — mirrors iOS public view */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Heart size={20} className="text-brand-400" />
            <h2 className="text-xl font-black">Owner contact</h2>
          </div>

          {ownerName || ownerPhone || ownerEmail ? (
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              {ownerName && (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-300">
                    <User size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Guardian</p>
                    <p className="text-lg font-black">{ownerName}</p>
                    {owner?.user_type && (
                      <p className="text-xs text-slate-500">{owner.user_type}</p>
                    )}
                  </div>
                </div>
              )}
              {ownerPhone && (
                <a
                  href={`tel:${ownerPhone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 transition hover:bg-white/10"
                >
                  <Phone size={18} className="shrink-0 text-brand-400" />
                  <span className="font-semibold text-white">{ownerPhone}</span>
                </a>
              )}
              {ownerEmail && (
                <a
                  href={`mailto:${ownerEmail}`}
                  className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 transition hover:bg-white/10"
                >
                  <Mail size={18} className="shrink-0 text-brand-400" />
                  <span className="font-semibold text-white break-all">{ownerEmail}</span>
                </a>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center text-slate-400">
              <p className="text-sm">Owner contact details are not public for this pet yet.</p>
              <p className="mt-2 text-xs">If this is your pet, add contact info in the PetPals app.</p>
            </div>
          )}
        </section>

        <p className="mt-10 text-center text-xs text-slate-500">
          If you found a lost pet, please contact the owner above. Powered by PetPals.
        </p>
      </div>
    </div>
  );
}
