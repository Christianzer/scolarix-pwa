import api from './api';
import type { Conversation, Message } from '@/types/messages';

/** React Native FormData accepte { uri, name, type } ; l'API Web attend Blob — cast intentionnel */
type RNFile = { uri: string; name: string; type: string };

export interface ConversationPage {
  data: Message[];
  meta: { current_page: number; last_page: number; total: number; has_more: boolean };
  correspondant: { id: number; nom: string; role_label: string | null; avatar_url: string | null };
}

export const messagesService = {
  async getConversations(): Promise<Conversation[]> {
    const res = await api.get('/messages');
    return res.data.data ?? res.data;
  },

  async getConversation(userId: number, page = 1, perPage = 30): Promise<ConversationPage> {
    const res = await api.get(`/messages/${userId}`, { params: { page, per_page: perPage } });
    return res.data;
  },

  async supprimerMessage(messageId: number): Promise<void> {
    await api.delete(`/messages/${messageId}`);
  },

  async envoyer(destinataire_id: number, contenu: string): Promise<Message> {
    const res = await api.post('/messages', { destinataire_id, contenu });
    return res.data.data ?? res.data;
  },

  async envoyerFichier(destinataire_id: number, uri: string, nom: string, mime: string): Promise<Message> {
    const form = new FormData();
    form.append('destinataire_id', String(destinataire_id));
    const fichier: RNFile = { uri, name: nom, type: mime };
    form.append('fichier', fichier as unknown as Blob);
    const res = await api.post('/messages', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data ?? res.data;
  },

  async diffuserClasse(classeId: number, contenu: string): Promise<void> {
    await api.post('/messages/diffuser', { classe_id: classeId, contenu });
  },
};
