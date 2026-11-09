import { useState, type CSSProperties } from 'react';
import { api, type BookingResponse, type Course, type Slot } from './api';
import { useAsync } from './useAsync';
import { CourseList } from './courseList';
import { SlotPicker } from './slotPicker';
import { BookingForm, emptyDraft, type Draft } from './bookingForm';
import { Confirmation } from './confirmation';
import { LoadError } from './loadError';

export function App({ studioKey }: { studioKey: string }) {
  const { state, retry } = useAsync(() => api.studio());
  const [course, setCourse] = useState<Course | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  if (state.status === 'loading') {
    return <div className="h-40 animate-pulse rounded-xl bg-gray-100" aria-busy="true" />;
  }
  if (state.status === 'error') return <LoadError error={state.error} onRetry={retry} />;

  const studio = state.data;
  const theme = { '--daisy-primary': studio.branding.primary_color } as CSSProperties;

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