'use server';
/**
 * @fileOverview Flow Genkit pour l'envoi d'e-mails d'alerte.
 * Supporte un ou plusieurs destinataires (séparés par des virgules).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendAlertEmailInputSchema = z.object({
  recipientEmail: z.string().describe("Une ou plusieurs adresses e-mail séparées par des virgules."),
  temperature: z.number(),
  threshold: z.number(),
  unit: z.string().default('Celsius'),
  isTest: z.boolean().optional().default(false),
});

export type SendAlertEmailInput = z.infer<typeof SendAlertEmailInputSchema>;

const SendAlertEmailOutputSchema = z.object({
  success: z.boolean(),
  sentAt: z.string(),
  messagePreview: z.string(),
  recipientCount: z.number(),
});

export type SendAlertEmailOutput = z.infer<typeof SendAlertEmailOutputSchema>;

// Configuration SMTP directe avec votre mot de passe d'application
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "benzartiahmedyassine@gmail.com",
    pass: "komg tkjt ezia ryoq" 
  }
});

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
    // Nettoyage de la liste des destinataires
    const recipients = input.recipientEmail
      .split(',')
      .map(e => e.trim())
      .filter(e => e !== "" && e.includes('@'));
    
    if (recipients.length === 0) {
      throw new Error("Aucun destinataire valide trouvé dans la liste.");
    }

    let emailContent = `🚨 ALERTE CRITIQUE ENIM : Une température de ${input.temperature.toFixed(1)}°${input.unit === 'Celsius' ? 'C' : 'F'} a été détectée, dépassant le seuil de sécurité de ${input.threshold}°${input.unit}.`;
    
    if (input.isTest) {
      emailContent = `🧪 TEST SYSTÈME : La connexion avec le serveur de messagerie ENIM est établie. Vos alertes sont prêtes à être diffusées à ${recipients.length} contact(s).`;
    } else {
      try {
        const { output } = await ai.generate({
          prompt: `Rédigez un court e-mail d'alerte formel pour l'ENIM Monastir. 
          Détails : Température relevée : ${input.temperature.toFixed(1)}°C. 
          Seuil de sécurité : ${input.threshold}°C. 
          L'e-mail doit être urgent et professionnel.`,
        });
        if (output?.text) emailContent = output.text;
      } catch (e) {
        // Fallback en cas d'erreur IA
      }
    }

    try {
      await transporter.sendMail({
        from: `"TempAlert ENIM" <benzartiahmedyassine@gmail.com>`,
        to: recipients.join(', '), // Envoie à toute la liste en une fois
        subject: input.isTest ? `🧪 TEST : TempAlert ENIM` : `⚠️ ALERTE THERMIQUE : ${input.temperature.toFixed(1)}°C`,
        text: emailContent,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 2px solid ${input.isTest ? '#3b82f6' : '#e11d48'}; border-radius: 10px; max-width: 500px; margin: auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: ${input.isTest ? '#3b82f6' : '#e11d48'}; margin: 0;">${input.isTest ? 'Test du Système' : 'Alerte Thermique Laboratoire'}</h2>
              <p style="color: #64748b; font-size: 14px;">ENIM Monastir - Département Électronique</p>
            </div>
            <div style="background: ${input.isTest ? '#eff6ff' : '#fef2f2'}; padding: 15px; border-radius: 5px; border-left: 4px solid ${input.isTest ? '#3b82f6' : '#e11d48'};">
              <p style="font-size: 16px; color: #1e293b; line-height: 1.5; margin: 0;">${emailContent}</p>
            </div>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              <p>Envoyé automatiquement par le système de surveillance TempAlert.<br>
              Date : ${new Date().toLocaleString('fr-FR')}</p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error("Erreur SMTP détaillée:", error);
      throw new Error("ÉCHEC ENVOI : Vérifiez que la validation en deux étapes est active sur votre compte Google.");
    }

    return {
      success: true,
      sentAt: new Date().toISOString(),
      messagePreview: emailContent,
      recipientCount: recipients.length,
    };
  }
);
