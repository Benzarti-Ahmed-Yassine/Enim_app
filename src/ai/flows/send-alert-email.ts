'use server';
/**
 * @fileOverview Flow Genkit pour l'envoi d'e-mails d'alerte.
 * Utilise l'IA pour personnaliser le message et Nodemailer pour l'expédition via Gmail.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendAlertEmailInputSchema = z.object({
  recipientEmail: z.string().email(),
  temperature: z.number(),
  threshold: z.number(),
  unit: z.string().default('Celsius'),
});

export type SendAlertEmailInput = z.infer<typeof SendAlertEmailInputSchema>;

const SendAlertEmailOutputSchema = z.object({
  success: z.boolean(),
  sentAt: z.string(),
  messagePreview: z.string(),
});

export type SendAlertEmailOutput = z.infer<typeof SendAlertEmailOutputSchema>;

// Configuration SMTP optimisée pour Gmail avec votre nouveau code
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || "benzartiahmedyassine@gmail.com",
    pass: process.env.EMAIL_PASS || "komg tkjt ezia ryoq" 
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
    let emailContent = `🚨 ALERTE CRITIQUE ENIM : Une température de ${input.temperature.toFixed(1)}°${input.unit === 'Celsius' ? 'C' : 'F'} a été détectée, dépassant le seuil de sécurité de ${input.threshold}°${input.unit}.`;
    
    try {
      const { output } = await ai.generate({
        prompt: `Rédigez un court e-mail d'alerte formel pour l'ENIM Monastir. 
        Détails : Température relevée : ${input.temperature.toFixed(1)}°C. 
        Seuil de sécurité : ${input.threshold}°C. 
        L'e-mail doit être urgent, professionnel et inciter à une vérification immédiate du matériel.`,
      });
      if (output?.text) emailContent = output.text;
    } catch (e) {
      // Fallback si l'IA échoue
    }

    try {
      await transporter.sendMail({
        from: `"TempAlert ENIM" <${process.env.EMAIL_USER || "benzartiahmedyassine@gmail.com"}>`,
        to: input.recipientEmail,
        subject: `⚠️ ALERTE THERMIQUE : ${input.temperature.toFixed(1)}°C`,
        text: emailContent,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 2px solid #e11d48; border-radius: 10px; max-width: 500px;">
            <h2 style="color: #e11d48; text-align: center;">Alerte Thermique Laboratoire</h2>
            <div style="background: #fef2f2; padding: 15px; border-radius: 5px;">
              <p style="font-size: 16px;">${emailContent}</p>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
              Système de surveillance automatique ENIM Monastir.<br>
              Date : ${new Date().toLocaleString('fr-FR')}
            </p>
          </div>
        `,
      });
    } catch (error) {
      throw new Error("SMTP_ERROR: Échec de l'authentification ou de l'envoi.");
    }

    return {
      success: true,
      sentAt: new Date().toISOString(),
      messagePreview: emailContent,
    };
  }
);
