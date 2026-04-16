'use server';
/**
 * @fileOverview Flow Genkit pour l'envoi d'e-mails d'alerte.
 * Utilise l'IA pour personnaliser le message et Nodemailer pour l'expédition.
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

// Configuration du transporteur (Utilise les variables d'env ou vos clés par défaut)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "benzartiahmedyassine@gmail.com",
    pass: process.env.EMAIL_PASS || "ozhh jdsc ecyj tfsx"
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
      // Utilisation de l'IA pour formuler un message plus institutionnel
      const { output } = await ai.generate({
        prompt: `Rédigez un court e-mail d'alerte formel pour l'ENIM Monastir. 
        Détails : Température relevée : ${input.temperature.toFixed(1)}°C. 
        Seuil de sécurité : ${input.threshold}°C. 
        L'e-mail doit être urgent, professionnel et inciter à une vérification immédiate du matériel.`,
      });
      if (output?.text) emailContent = output.text;
    } catch (e) {
      console.warn("Échec de la génération IA, utilisation du message de secours.");
    }

    try {
      await transporter.sendMail({
        from: `"TempAlert ENIM System" <${process.env.EMAIL_USER || "benzartiahmedyassine@gmail.com"}>`,
        to: input.recipientEmail,
        subject: `⚠️ ALERTE THERMIQUE CRITIQUE : ${input.temperature.toFixed(1)}°C`,
        text: emailContent,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 2px solid #e11d48; border-radius: 10px;">
            <h1 style="color: #e11d48;">Alerte de Sécurité Thermique</h1>
            <p style="font-size: 16px; color: #334155;">${emailContent}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748b;">
              Ceci est un message automatique du système TempAlert - ENIM Monastir.<br>
              Ne pas répondre à cet e-mail.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Erreur Nodemailer:", error);
      throw new Error("L'envoi de l'e-mail a échoué. Vérifiez vos identifiants.");
    }

    return {
      success: true,
      sentAt: new Date().toISOString(),
      messagePreview: emailContent,
    };
  }
);
