type Demo = { href: string; label: string; detail: string };

const PAGES: Demo[] = [
  { href: '/demo/atelier.html', label: "Site d'atelier", detail: "Le widget intégré dans un site d'artisan réaliste" },
  { href: '/demo/clean.html', label: 'Page vierge', detail: 'Le widget seul, en pleine largeur' },
  { href: '/demo/hostile.html', label: 'Site hostile', detail: 'CSS agressif (!important, styles globaux) et colonne de 320 px' },
];

const SCENARIOS: { title: string; items: Demo[] }[] = [
  {
    title: 'Chargement',
    items: [
      { href: '/demo/atelier.html?scenario=slow', label: 'Réseau lent', detail: 'Squelettes de chargement pendant 3 s' },
      { href: '/demo/atelier.html?scenario=error', label: 'Erreur serveur', detail: 'Message de repli et bouton « Réessayer »' },
      { href: '/demo/atelier.html?scenario=forbidden', label: 'Domaine non déclaré', detail: 'Ce que voit le visiteur (cas d\u2019un artisan sur trois)' },
      { href: '/demo/atelier.html?scenario=forbidden&daisy_debug=1', label: 'Domaine non déclaré, mode diagnostic', detail: "Ce que voit l'artisan qui installe le widget" },
    ],
  },
  {
    title: 'Personnalisation',
    items: [
      { href: '/demo/atelier.html?theme=pale', label: 'Couleur claire et police du site', detail: 'Texte foncé choisi automatiquement, boutons en pilule' },
      { href: '/demo/atelier.html?theme=dark', label: 'Couleur foncée', detail: 'Texte blanc, coins carrés' },
      { href: '/demo/hostile.html?theme=pale', label: 'Police du site sur la page hostile', detail: 'La police traverse volontairement, le reste reste isolé' },
    ],
  },
];

function DemoLink({ href, label, detail }: Demo) {
  return (
    <li>
      <a href={href} className="group block rounded-lg border border-neutral-200 p-4 transition hover:border-neutral-400">
        <span className="font-medium group-hover:underline">{label}</span>
        <span className="mt-1 block text-sm text-neutral-600">{detail}</span>
      </a>
    </li>
  );
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Widget de réservation Daisy</h1>
      <p className="mt-3 text-neutral-700">
        Étude de cas, sujet B : un widget de réservation que l'artisan installe sur son site en collant deux lignes
        de code. L'API Daisy est simulée et reproduit les contraintes de l'énoncé.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Les pages de démonstration</h2>
        <ul className="mt-3 grid gap-3">{PAGES.map((d) => <DemoLink key={d.href} {...d} />)}</ul>
      </section>

      {SCENARIOS.map((group) => (
        <section key={group.title} className="mt-10">
          <h2 className="text-lg font-semibold">{group.title}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">{group.items.map((d) => <DemoLink key={d.href} {...d} />)}</ul>
        </section>
      ))}

      <section className="mt-10 rounded-lg bg-neutral-100 p-4 text-sm text-neutral-700">
        <p className="font-medium">Pour tester aussi</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Le mobile : outils de développement, vue téléphone à 375 px.</li>
          <li>La coupure réseau pendant l'envoi : onglet Réseau, mode « Offline », puis « Confirmer ».</li>
          <li>Le fuseau horaire : Sensors, autre fuseau (ex. Tokyo). Les horaires restent ceux de l'atelier.</li>
        </ul>
      </section>
    </main>
  );
}