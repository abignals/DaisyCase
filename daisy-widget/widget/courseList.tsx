import { useMemo, useState } from 'react';
import { api, type Course } from './api';
import { useAsync } from './useAsync';
import { formatPrice } from './format';
import { LoadError } from './loadError';

const LEVELS: Record<string, string> = {
  debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé',
};

export function CourseList({ currency, onSelect }: { currency: string; onSelect: (c: Course) => void }) {
  const { state, retry } = useAsync(() => api.courses());
  const [level, setLevel] = useState('all');

  const courses = state.status === 'success' ? state.data : [];
  const visible = useMemo(
    () => (level === 'all' ? courses : courses.filter((c) => c.level === level)),
    [courses, level],
  );

  if (state.status === 'loading') return <CourseSkeleton />;
  if (state.status === 'error') return <LoadError error={state.error} onRetry={retry} />;
  if (courses.length === 0) {
    return <p className="text-sm text-gray-600">Aucun cours n'est proposé à la réservation pour le moment.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par niveau">
        {['all', ...Object.keys(LEVELS)].map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            aria-pressed={level === l}
            className={`rounded-full border px-3 py-1 text-sm ${
              level === l
                ? 'border-[var(--daisy-primary)] bg-[var(--daisy-primary)] text-[var(--daisy-on-primary)]'
                : 'border-gray-300'
            }`}
          >
            {l === 'all' ? 'Tous' : LEVELS[l]}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-1 gap-3 @md:grid-cols-2">
        {visible.map((c) => (
          <li key={c.course_id}>
            <CourseCard course={c} currency={currency} onSelect={() => onSelect(c)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CourseCard({ course, currency, onSelect }: { course: Course; currency: string; onSelect: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const long = course.description.length > 140;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200">
      {course.image_url ? (
        <img src={course.image_url} alt="" loading="lazy" className="aspect-[3/2] w-full object-cover" />
      ) : (
        // Image de remplacement aux couleurs de l'atelier
        <div className="aspect-[3/2] w-full bg-[var(--daisy-primary)] opacity-20" aria-hidden />
      )}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="font-semibold">{course.name}</h3>
        <p className="text-sm text-gray-600">
          {course.duration_minutes} min · à partir de {formatPrice(course.price_cents, currency)}
        </p>
        {course.description && (
          <div className="text-sm">
            <p className={expanded ? '' : 'line-clamp-3'}>{course.description}</p>
            {long && (
              <button onClick={() => setExpanded(!expanded)} className="mt-1 text-sm underline">
                {expanded ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>
        )}
        <button
          onClick={onSelect}
          className="mt-auto rounded-[var(--daisy-radius)] bg-[var(--daisy-primary)] px-4 py-2 font-medium text-[var(--daisy-on-primary)]"
        >
          Choisir ce cours
        </button>
      </div>
    </article>
  );
}

function CourseSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-3 @md:grid-cols-2" aria-busy="true" aria-label="Chargement des cours">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="animate-pulse rounded-xl border border-gray-200 p-3">
          <div className="aspect-[3/2] rounded-lg bg-gray-200" />
          <div className="mt-3 h-4 w-2/3 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
        </li>
      ))}
    </ul>
  );
}