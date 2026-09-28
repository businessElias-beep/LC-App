import { z } from 'zod';

export const ContractSchema = z.object({
  firstName: z.string().min(2, 'Vorname ist erforderlich'),
  lastName: z.string().min(2, 'Nachname ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  amount: z.string().min(1, 'Anlagesumme ist erforderlich'),
  returnRate: z.string().min(1, 'Rendite ist erforderlich'),
  term: z.string().min(1, 'Laufzeit ist erforderlich'),
  endDate: z.string().min(1, 'Laufzeitende ist erforderlich'),
  bonus: z.string().min(1, 'Willkommensbonus ist erforderlich'),
});

export type ContractFormData = z.infer<typeof ContractSchema>;
