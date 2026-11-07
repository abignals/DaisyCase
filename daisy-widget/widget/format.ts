export const formatPrice = (cents: number, currency?: string | null) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(cents / 100);