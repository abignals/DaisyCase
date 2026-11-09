import type { BookingResponse, Course, Slot, Studio } from './api';
import type { Draft } from './bookingForm';
import { formatDay, formatPrice, formatTime } from './format';

type Props = {
  booking: BookingResponse; course: Course; slot: Slot; studio: Studio; draft: Draft; onRestart: () => void;
};

export function Confirmation({ booking, course, slot, studio, draft, onRestart }: Props) {
  const tz = studio.timezone;
  return (
    <div className="space-y-3" role="status">
      <p className="text-lg font-semibold">Réservation confirmée ✓</p>
      <p className="rounded-lg bg-gray-50 p-3 text-sm">
        Votre code : <strong className="font-mono text-base">{booking.confirmation_code}</strong>
      </p>
      <ul className="space-y-1 text-sm">
        <li>{course.name}</li>
        <li className="capitalize">{formatDay(slot.starts_at, tz)} à {formatTime(slot.starts_at, tz)}</li>
        <li>{draft.seats} place{draft.seats > 1 ? 's' : ''} · {formatPrice(booking.total_cents, studio.currency)}</li>
      </ul>
      <p className="text-sm text-gray-600">
        Un e-mail de confirmation a été envoyé à {draft.email}. Annulation possible jusqu'à{' '}
        {studio.booking_policy.cancellation_hours} h avant le cours.
      </p>
      <button onClick={onRestart} className="text-sm underline">Faire une autre réservation</button>
    </div>
  );
}