import { useMemo, useState } from 'react';
import { api, type Course, type Slot, type Studio } from './api';
import { useAsync } from './useAsync';
import { dayKey, formatDay, formatMonth, formatPrice, formatTime } from './format';
import { LoadError } from './loadError';

const MAX_MONTHS_AHEAD = 2;


function monthRange(offset: number) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset + 1, 0));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { month: start, from: iso(offset === 0 ? now : start), to: iso(end) };
}

type Props = {
  course: Course;
  studio: Studio;
  onSelect: (slot: Slot) => void;
  onBack: () => void;
};

export function SlotPicker({ course, studio, onSelect, onBack }: Props) {
  const [offset, setOffset] = useState(0);
  const range = monthRange(offset);
  const tz = studio.timezone;

  const { state, retry } = useAsync(
    () => api.slots(course.course_id, range.from, range.to),
    [course.course_id, offset],
  );

  const days = useMemo(() => {
    const slots = state.status === 'success' ? state.data : [];
    const groups = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = dayKey(s.starts_at, tz);
      groups.set(key, [...(groups.get(key) ?? []), s]);
    }
    return [...groups.values()];
  }, [state, tz]);

  const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="space-y-4">
      <div>
        <button onClick={onBack} className="text-sm underline">← Changer de cours</button>
        <h3 className="mt-2 font-semibold">{course.name}</h3>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setOffset(offset - 1)}
          disabled={offset === 0}
          aria-label="Mois précédent"
          className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-30"
        >
          ←
        </button>
        <span className="font-medium capitalize">{formatMonth(range.month)}</span>
        <button
          onClick={() => setOffset(offset + 1)}
          disabled={offset === MAX_MONTHS_AHEAD}
          aria-label="Mois suivant"
          className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-30"
        >
          →
        </button>
      </div>

      {visitorTz !== tz && (
        <p className="rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
          Les horaires sont indiqués à l'heure locale de l'atelier.
        </p>
      )}

      {state.status === 'loading' && <SlotSkeleton />}
      {state.status === 'error' && <LoadError error={state.error} onRetry={retry} />}
      {state.status === 'success' && days.length === 0 && (
        <p className="text-sm text-gray-600">
          Aucun créneau en {formatMonth(range.month)}.
          {offset < MAX_MONTHS_AHEAD && ' Essayez le mois suivant.'}
        </p>
      )}

      {state.status === 'success' && (
        <ul className="space-y-3">
          {days.map((slots) => (
            <li key={slots[0].slot_id}>
              <p className="mb-1 text-sm font-medium capitalize">{formatDay(slots[0].starts_at, tz)}</p>
              <div className="grid grid-cols-1 gap-2 @sm:grid-cols-2">
                {slots.map((s) => (
                  <SlotButton key={s.slot_id} slot={s} tz={tz} currency={studio.currency} onSelect={onSelect} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SlotButton({ slot, tz, currency, onSelect }: {
  slot: Slot; tz: string; currency: string; onSelect: (s: Slot) => void;
}) {
  const full = slot.seats_available === 0;
  const few = !full && slot.seats_available <= 2;

  return (
    <button
      onClick={() => onSelect(slot)}
      disabled={full}
      className="flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-left
                 hover:border-[var(--daisy-primary)] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
    >
      <span>
        <span className="font-medium">{formatTime(slot.starts_at, tz)}</span>
        <span className="block text-xs text-gray-600">
          {full ? 'Complet' : few ? `Plus que ${slot.seats_available} place${slot.seats_available > 1 ? 's' : ''}` : `${slot.seats_available} places`}
        </span>
      </span>
      <span className="text-sm font-medium">{formatPrice(slot.price_cents, currency)}</span>
    </button>
  );
}

function SlotSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Chargement des créneaux">
      {[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />)}
    </div>
  );
}