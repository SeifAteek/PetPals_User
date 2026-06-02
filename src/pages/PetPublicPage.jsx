import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  PawPrint, User, Phone, Mail, AlertCircle, Loader2, Nfc, Heart, ArrowLeft,
} from 'lucide-react';
import { fetchPublicPet, resolvePetImageUrl } from '../lib/petProfile';

function StatPill({ label, value }) {
  return (
    <div className="pp-auto-glass rounded-[var(--pp-r-lg)] px-4 py-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--pp-text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-black">{value ?? '—'}</p>
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-[var(--pp-blush)]" />
        <p className="text-sm font-bold text-[var(--pp-text-muted)]">Loading pet profile…</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="pp-card mx-auto mb-6 flex h-16 w-16 items-center justify-center text-red-400">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-black">Profile unavailable</h1>
        <p className="mt-3 text-[var(--pp-text-secondary)]">{error}</p>
        <Link to="/" className="btn-primary mt-8 inline-flex">
          <ArrowLeft size={16} />
          Back to PetPals
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-8">
      <div className="pp-glass-chip mb-6 w-full justify-center">
        <Nfc size={16} />
        Opened via PetPals NFC · Verified pet profile
      </div>

      <Link
        to="/"
        className="pp-nav-idle mb-6 inline-flex items-center gap-2 px-3 py-2 text-sm font-bold"
      >
        <ArrowLeft size={16} />
        PetPals home
      </Link>

      <div className="pp-card overflow-hidden">
        <div className="relative aspect-[16/10] bg-[var(--pp-navy)]">
          {imageUrl ? (
            <img src={imageUrl} alt={pet.name} className="h-full w-full object-cover" loading="eager" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <PawPrint size={80} className="text-[var(--pp-blush)] opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--pp-navy)]/90 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <span className="pp-glass-chip">{pet.status || 'Active'}</span>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{pet.name}</h1>
            <p className="mt-1 text-lg text-[var(--pp-text-secondary)]">
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
          <div className="border-t border-[var(--pp-card-border)] px-6 py-5">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--pp-text-muted)]">About</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--pp-text-secondary)]">{pet.medical_history}</p>
          </div>
        )}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Heart size={20} className="text-[var(--pp-blush)]" />
          <h2 className="text-xl font-black">Owner contact</h2>
        </div>

        {ownerName || ownerPhone || ownerEmail ? (
          <div className="pp-card space-y-3 p-6">
            {ownerName && (
              <div className="flex items-center gap-4">
                <div className="pp-liquid-glass pp-liquid-glass--md pp-liquid-glass--resting flex h-12 w-12 items-center justify-center text-[var(--pp-blush)]">
                  <User size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--pp-text-muted)]">Guardian</p>
                  <p className="text-lg font-black">{ownerName}</p>
                </div>
              </div>
            )}
            {ownerPhone && (
              <a
                href={`tel:${ownerPhone.replace(/\s/g, '')}`}
                className="pp-nav-idle flex items-center gap-3 px-4 py-3"
              >
                <Phone size={18} className="shrink-0 text-[var(--pp-cerulean)]" />
                <span className="font-semibold">{ownerPhone}</span>
              </a>
            )}
            {ownerEmail && (
              <a
                href={`mailto:${ownerEmail}`}
                className="pp-nav-idle flex items-center gap-3 px-4 py-3"
              >
                <Mail size={18} className="shrink-0 text-[var(--pp-cerulean)]" />
                <span className="break-all font-semibold">{ownerEmail}</span>
              </a>
            )}
          </div>
        ) : (
          <div className="pp-card border border-dashed p-8 text-center text-[var(--pp-text-secondary)]">
            <p className="text-sm">Owner contact details are not public for this pet yet.</p>
            <p className="mt-2 text-xs">If this is your pet, add contact info in the PetPals iOS app.</p>
          </div>
        )}
      </section>

      <p className="mt-10 text-center text-xs text-[var(--pp-text-muted)]">
        If you found a lost pet, please contact the owner above. Powered by PetPals.
      </p>
    </div>
  );
}
