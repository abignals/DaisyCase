import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError, type BookingResponse, type Course, type Slot, type Studio } from './api';
import { formatDay, formatPrice, formatTime } from './format';

export type Draft = {
  first_name: string; last_name: string; email: string; phone: string; seats: number; notes: string;
};
export const emptyDraft: Draft = { first_name: '', last_name: '', email: '', phone: '', seats: 1, notes: '' };

type Problem =
  | { kind: 'full'; available: number }
  | { kind: 'cancelled' }
  | { kind: 'ratelimit' }
  | { kind: 'uncertain' }
  | { kind: 'invalid'; message: string };

type Props = {
  course: Course; slot: Slot; studio: Studio;
  draft: Draft; onDraftChange: (d: Draft) => void;
  onConfirmed: (r: BookingResponse) => void;
  onChangeSlot: () => void;
};

export function BookingForm({ course, slot, studio, draft, onDraftChange, onConfirmed, onChangeSlot }: Props) {
  const policy = studio.booking_policy;
  const tz = studio.timezone;
  const maxSeats = Math.min(policy.max_seats_per_booking, slot.seats_available);

  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [slow, setSlow] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => onDraftChange({ ...draft, [key]: value });

  useEffect(() => {
    if (draft.seats > maxSeats) set('seats', Math.max(1, maxSeats));
  }, [maxSeats]);

  useEffect(() => {
    if (!submitting) { setSlow(false); return; }
    const t = setTimeout(() => setSlow(true), 2000);
    return () => clearTimeout(t);
  }, [submitting]);

  function validate() {
    const e: typeof errors = {};
    if (!draft.first_name.trim()) e.first_name = 'Indiquez votre prénom.';
    if (!draft.last_name.trim()) e.last_name = 'Indiquez votre nom.';
    if (!/^\S+@\S+\.\S+$/.test(draft.email.trim())) e.email = 'Indiquez une adresse e-mail valide.';
    if (policy.requires_phone && draft.phone.replace(/\D/g, '').length < 9) {
      e.phone = "L'atelier demande un numéro de téléphone pour vous joindre en cas d'imprévu.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev?: FormEvent) {
    ev?.preventDefault();
    if (submitting || !validate()) return;
    setProblem(null);
    setSubmitting(true);
    try {
      const res = await api.createBooking({
        slot_id: slot.slot_id,
        seats: draft.seats,
        notes: draft.notes.trim() || undefined,
        customer: {
          first_name: draft.first_name.trim(),
          last_name: draft.last_name.trim(),
          email: draft.email.trim(),
          phone: draft.phone.trim() || undefined,
        },
      });
      onConfirmed(res);
    } catch (e) {
      setProblem(toProblem(e));
    } finally {
      setSubmitting(false);
    }
  }

  const total = formatPrice(slot.price_cents * draft.seats, studio.currency);
  const input = 'w-full rounded-lg border border-gray-300 px-3 py-2';

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-3 text-sm">
        <p className="font-medium">{course.name}</p>
        <p className="capitalize">
          {formatDay(slot.starts_at, tz)} à {formatTime(slot.starts_at, tz)}
        </p>
        <button type="button" onClick={onChangeSlot} className="mt-1 underline">← Changer de créneau</button>
      </div>

      <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2">
        <Field label="Prénom" error={errors.first_name}>
          <input className={input} autoComplete="given-name" value={draft.first_name}
                 onChange={(e) => set('first_name', e.target.value)} />
        </Field>
        <Field label="Nom" error={errors.last_name}>
          <input className={input} autoComplete="family-name" value={draft.last_name}
                 onChange={(e) => set('last_name', e.target.value)} />
        </Field>
        <Field label="E-mail" error={errors.email}>
          <input className={input} type="email" inputMode="email" autoComplete="email" value={draft.email}
                 onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label={policy.requires_phone ? 'Téléphone' : 'Téléphone (facultatif)'} error={errors.phone}>
          <input className={input} type="tel" inputMode="tel" autoComplete="tel" value={draft.phone}
                 onChange={(e) => set('phone', e.target.value)} />
        </Field>
      </div>

      <Field label="Nombre de places">
        <select className={input} value={draft.seats} onChange={(e) => set('seats', Number(e.target.value))}>
          {Array.from({ length: Math.max(1, maxSeats) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </Field>

      <Field label="Une précision pour l'atelier ? (facultatif)">
        <textarea className={input} rows={2} value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>

      {problem && (
        <ProblemMessage
          problem={problem}
          onUseSeats={(n) => { set('seats', n); setProblem(null); }}
          onChangeSlot={onChangeSlot}
          onRetry={() => submit()}
        />
      )}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="w-full rounded-lg bg-[var(--daisy-primary)] px-4 py-3 font-medium text-white disabled:opacity-70"
      >
        {submitting ? 'Réservation en cours…' : `Confirmer la réservation · ${total}`}
      </button>

      {slow && (
        <p className="text-center text-sm text-gray-600" role="status">
          Nous finalisons votre réservation et vous envoyons la confirmation par e-mail. Merci de ne pas fermer la page.
        </p>
      )}
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-red-700">{error}</span>}
    </label>
  );
}

function toProblem(e: unknown): Problem {
  if (!(e instanceof ApiError)) return { kind: 'uncertain' };
  switch (e.code) {
    case 'slot_full':
      return { kind: 'full', available: Number((e.body as { available?: number } | null)?.available ?? 0) };
    case 'slot_cancelled': return { kind: 'cancelled' };
    case 'rate_limited': return { kind: 'ratelimit' };
    case 'phone_required': return { kind: 'invalid', message: "L'atelier demande un numéro de téléphone." };
    case 'too_many_seats': return { kind: 'invalid', message: 'Trop de places demandées pour une seule réservation.' };
    default:
      return e.status === 0 || e.status >= 500
        ? { kind: 'uncertain' }
        : { kind: 'invalid', message: "La réservation n'a pas pu être enregistrée. Vérifiez vos informations." };
  }
}

function ProblemMessage({ problem, onUseSeats, onChangeSlot, onRetry }: {
  problem: Problem; onUseSeats: (n: number) => void; onChangeSlot: () => void; onRetry: () => void;
}) {
  const box = 'rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900';
  const action = 'mt-2 rounded-lg border border-amber-400 bg-white px-3 py-1.5 font-medium';

  switch (problem.kind) {
    case 'full':
      return problem.available > 0 ? (
        <div className={box} role="alert">
          <p>
            Entre-temps, d'autres personnes ont réservé : il ne reste que {problem.available} place
            {problem.available > 1 ? 's' : ''} sur ce créneau.
          </p>
          <button type="button" className={action} onClick={() => onUseSeats(problem.available)}>
            Réserver {problem.available} place{problem.available > 1 ? 's' : ''}
          </button>
        </div>
      ) : (
        <div className={box} role="alert">
          <p>
            La dernière place de ce créneau vient d'être réservée par quelqu'un d'autre. Vos informations sont
            conservées : choisissez un autre créneau, vous n'aurez rien à ressaisir.
          </p>
          <button type="button" className={action} onClick={onChangeSlot}>Choisir un autre créneau</button>
        </div>
      );
    case 'cancelled':
      return (
        <div className={box} role="alert">
          <p>L'atelier vient d'annuler ce créneau. Vos informations sont conservées : choisissez une autre date.</p>
          <button type="button" className={action} onClick={onChangeSlot}>Choisir une autre date</button>
        </div>
      );
    case 'ratelimit':
      return (
        <div className={box} role="alert">
          <p>Trop de tentatives de réservation depuis votre connexion. Réessayez dans quelques minutes.</p>
        </div>
      );
    case 'uncertain':
      return (
        <div className={box} role="alert">
          <p className="font-medium">Nous n'avons pas pu confirmer votre réservation.</p>
          <p className="mt-1">
            La connexion a été interrompue : votre réservation a peut-être été enregistrée. Avant de réessayer,
            vérifiez votre boîte mail (et vos courriers indésirables) pour éviter une double réservation.
          </p>
          <button type="button" className={action} onClick={onRetry}>
            Je n'ai rien reçu, réessayer
          </button>
        </div>
      );
    case 'invalid':
      return <div className={box} role="alert"><p>{problem.message}</p></div>;
  }
}