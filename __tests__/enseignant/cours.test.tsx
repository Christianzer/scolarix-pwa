import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn() }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockPublier, mockDiffuser } = vi.hoisted(() => ({
  mockPublier: vi.fn().mockResolvedValue(undefined),
  mockDiffuser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/elearning.service', () => ({
  elearningService: { publierCours: mockPublier },
}));
vi.mock('@/services/messages.service', () => ({
  messagesService: { diffuserClasse: mockDiffuser },
}));
vi.mock('@/stores/enseignant.store', () => ({
  useEnseignantStore: vi.fn((sel) =>
    sel({
      classes: [{ id: 1, nom: '3ème A', departement: null, nb_eleves: 1, matieres: [{ id: 10, nom: 'Maths', coefficient: 4 }] }],
    }),
  ),
}));

import PublierCoursPage from '@/app/(app)/enseignant/publier-cours/page';
import DiffuserPage from '@/app/(app)/enseignant/diffuser/page';

describe('Enseignant Cours & Diffusion', () => {
  it('affiche le formulaire de publication de cours', () => {
    render(<PublierCoursPage />);
    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/matière/i)).toBeInTheDocument();
  });

  it('affiche le formulaire de diffusion', () => {
    render(<DiffuserPage />);
    expect(screen.getByRole('combobox', { name: /classe/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('appelle diffuserClasse lors de la soumission', async () => {
    render(<DiffuserPage />);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /classe/i }), '1');
    await userEvent.type(screen.getByLabelText(/message/i), 'Cours annulé demain');
    await userEvent.click(screen.getByRole('button', { name: /diffuser/i }));
    await waitFor(() => expect(mockDiffuser).toHaveBeenCalledWith(1, 'Cours annulé demain'));
  });
});
