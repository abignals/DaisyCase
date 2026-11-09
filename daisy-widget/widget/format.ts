export const formatPrice = (cents: number, currency?: string | null) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(cents / 100);

    
export const formatDay = (iso: string, timeZone: string) =>
    new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone })
      .format(new Date(iso));
    
export const formatTime = (iso: string, timeZone: string) =>
    new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone })
      .format(new Date(iso));
    
    // Clé de regroupement par jour (AAAA-MM-JJ), calculée dans le fuseau de l'atelier
export const dayKey = (iso: string, timeZone: string) =>
    new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(iso));
    
export const formatMonth = (d: Date) =>
    new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);