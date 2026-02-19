'use server';
/**
 * @fileOverview Flow Genkit pour l'envoi d'e-mails d'alerte de température.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendAlertEmailInputSchema = z.object({
  recipientEmail: z.string().email().describe("L'adresse e-mail du destinataire."),
  temperature: z.number().describe("La température actuelle relevée."),
  threshold: z.number().describe("Le seuil de température configuré."),
  unit: z.string().default('Celsius'),
});

export type SendAlertEmailInput = z.infer<typeof SendAlertEmailInputSchema>;

const SendAlertEmailOutputSchema = z.object({
  success: z.boolean(),
  sentAt: z.string(),
  messagePreview: z.string(),
});

export type SendAlertEmailOutput = z.infer<typeof SendAlertEmailOutputSchema>;

export async function sendAlertEmail(input: SendAlertEmailInput): Promise<SendAlertEmailOutput> {
  return sendAlertEmailFlow(input);
}

const sendAlertEmailFlow = ai.defineFlow(
  {
    name: 'sendAlertEmailFlow',
    inputSchema: SendAlertEmailInputSchema,
    outputSchema: SendAlertEmailOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `Vous êtes le système de surveillance TempAlert. 
      Générez un corps d'e-mail d'alerte professionnel et urgent pour un utilisateur dont le capteur a détecté un dépassement de seuil.
      
      Destinataire: ${input.recipientEmail}
      Température Actuelle: ${input.temperature}${input.unit === 'Celsius' ? '°C' : '°F'}
      Seuil Limite: ${input.threshold}${input.unit === 'Celsius' ? '°C' : '°F'}
      
      L'e-mail doit avoir un objet clair et un corps concis expliquant le risque potentiel.`,
    });

    // Dans un environnement de production réel, vous utiliseriez ici un service comme Resend ou Nodemailer.
    // Pour ce prototype, nous simulons l'envoi et affichons le contenu dans la console du serveur.
    console.log(`[SIMULATION E-MAIL ENVOYÉ À ${input.recipientEmail}]`);
    console.log(`Sujet: ALERTE TEMPÉRATURE CRITIQUE`);
    console.log(`Contenu: ${output?.text}`);

    return {
      success: true,
      sentAt: new Date().toISOString(),
      messagePreview: output?.text || 'Alerte générée avec succès.',
    };
  }
);
