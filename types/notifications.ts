export interface NotificationApp {
  id: number;
  titre: string;
  contenu: string;
  type: 'info' | 'alerte' | 'note' | 'absence' | 'paiement' | 'kudos' | 'avertissement' | 'punition';
  lue: boolean;
  date: string;      // diffForHumans (ex: "il y a 2 heures")
  full_date: string; // format dd/MM/yyyy HH:mm
}
