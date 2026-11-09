import { useState, type CSSProperties } from 'react';
import { api, type Course, type Slot } from './api';
import { useAsync } from './useAsync';
import { CourseList } from './courseList';
import { SlotPicker } from './slotPicker';
import { LoadError } from './loadError';
import { formatDay, formatTime } from './format';

export function App({ studioKey }: { studioKey: string }) {
  const { state, retry } = useAsync(() => api.studio());
  const [course, setCourse] = useState<Course | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);

  if (state.status === 'loading') {
    return <div className="h-40 animate-pulse rounded-xl bg-gray-100" aria-busy="true" />;
  }
  if (state.status === 'error') return <LoadError error={state.error} onRetry={retry} />;

  const studio = state.data;
  const theme = { '--daisy-primary': studio.branding.primary_color } as CSSProperties;

  return (
    <div style={theme} className="@container mx-auto max-w-3xl space-y-4" data-studio={studioKey}>
      <h2 className="text-lg font-semibold">Réserver chez {studio.name}</h2>

      {!course && <CourseList currency={studio.currency} onSelect={setCourse} />}

      {course && !slot && (
        <SlotPicker course={course} studio={studio} onSelect={setSlot} onBack={() => setCourse(null)} />
      )}

      {course && slot && (
        //Provisoire, a modifier par la page de coordonnes
        <div className="space-y-2">
          <p>
            {course.name}, {formatDay(slot.starts_at, studio.timezone)} à {formatTime(slot.starts_at, studio.timezone)}
          </p>
          <button onClick={() => setSlot(null)} className="text-sm underline">← Changer de créneau</button>
        </div>
      )}
    </div>
  );
}