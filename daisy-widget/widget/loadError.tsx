import { ApiError } from './api';

const debug = new URLSearchParams(location.search).has('daisy_debug');

export function LoadError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const code = error instanceof ApiError ? error.code : 'unknown';
  // En production, un domaine non déclaré ressemble à une erreur réseau (CORS)
  const maybeInstall = code === 'origin_not_allowed' || code === 'network';

  if (maybeInstall) {
    console.warn(
      `[Daisy] Le widget n'a pas pu se connecter. Si le problème persiste, vérifiez que le domaine ` +
      `${location.hostname} est déclaré dans Daisy (Réglages, Widget).`,
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4 text-sm">
      <p className="font-medium">La réservation en ligne est momentanément indisponible.</p>
      <p className="mt-1 text-gray-600">Réessayez dans un instant, ou contactez directement l'atelier.</p>
      <button onClick={onRetry} className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5">
        Réessayer
      </button>
      {debug && maybeInstall && (
        <p className="mt-3 rounded-lg bg-amber-50 p-2 text-amber-900">
          Mode diagnostic : le domaine <strong>{location.hostname}</strong> n'est peut-être pas
          déclaré dans Daisy. Ajoutez-le dans Réglages, Widget.
        </p>
      )}
    </div>
  );
}