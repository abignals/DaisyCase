import { useState, type CSSProperties } from 'react';
import { api, type Course } from './api';
import { useAsync } from './useAsync';
import { CourseList } from './courseList';
import { LoadError } from './loadError';

export function App({ studioKey }: { studioKey: string }) {
  const { state, retry } = useAsync(() => api.studio());
  const [course, setCourse] = useState<Course | null>(null);

  if (state.status === 'loading') {
    return <div className="h-40 animate-pulse rounded-xl bg-gray-100" aria-busy="true" />;
  }
  if (state.status === 'error') return <LoadError error={state.error} onRetry={retry} />;

  const studio = state.data;
  // La couleur de l'atelier devient une variable CSS, utilisée partout dans le widget
  const theme = { '--daisy-primary': studio.branding.primary_color } as CSSProperties;

  return (
    <div mx-auto max-w-3xl style={theme} className="@container space-y-4" data-studio={studioKey}>
      <h2 className="text-lg font-semibold">Réserver chez {studio.name}</h2>
      {course === null ? (
        <CourseList currency={studio.currency} onSelect={setCourse} />
      ) : (
        <div className="space-y-2">
          <p>Cours choisi : {course.name}</p>
          <button onClick={() => setCourse(null)} className="text-sm underline">← Changer de cours</button>
        </div>
      )}
    </div>
  );
}