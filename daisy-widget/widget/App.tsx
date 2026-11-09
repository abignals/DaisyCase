import { useState, type CSSProperties } from 'react';
import { api, type BookingResponse, type Course, type Slot } from './api';
import { useAsync } from './useAsync';
import { CourseList } from './courseList';
import { SlotPicker } from './slotPicker';
import { BookingForm, emptyDraft, type Draft } from './bookingForm';
import { Confirmation } from './confirmation';
import { LoadError } from './loadError';
import { RADIUS, readableTextOn, safeColor } from './theme';

export function App({ studioKey, hostFont }: { studioKey: string; hostFont: string }) {
  const { state, retry } = useAsync(() => api.studio());
  const [course, setCourse] = useState<Course | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft); // survit aux changements de créneau
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  if (state.status === 'loading') {
    return <div className="h-40 animate-pulse rounded-xl bg-gray-100" aria-busy="true" />;
  }
  if (state.status === 'error') return <LoadError error={state.error} onRetry={retry} />;

  const studio = state.data;

  const b = studio.branding;
  const primary = safeColor(b.primary_color);
  const theme = {
    '--daisy-primary': primary,
    '--daisy-on-primary': readableTextOn(primary),
    '--daisy-radius': RADIUS[b.radius ?? 'rounded'],
    fontFamily: b.font === 'inherit' && hostFont ? hostFont : undefined,
  } as CSSProperties;

  function restart() {
    setCourse(null); setSlot(null); setBooking(null); setDraft(emptyDraft);
  }

  return (
    <div style={theme} className="@container mx-auto max-w-3xl space-y-4" data-studio={studioKey}>
      <h2 className="text-lg font-semibold">Réserver chez {studio.name}</h2>

      {booking && course && slot ? (
        <Confirmation booking={booking} course={course} slot={slot} studio={studio} draft={draft} onRestart={restart} />
      ) : !course ? (
        <CourseList currency={studio.currency} onSelect={setCourse} />
      ) : !slot ? (
        <SlotPicker course={course} studio={studio} onSelect={setSlot} onBack={() => setCourse(null)} />
      ) : (
        <BookingForm
          course={course} slot={slot} studio={studio}
          draft={draft} onDraftChange={setDraft}
          onConfirmed={setBooking}
          onChangeSlot={() => setSlot(null)}
        />
      )}
    </div>
  );
}