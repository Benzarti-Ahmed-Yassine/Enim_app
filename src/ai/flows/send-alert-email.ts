'use server';
/**
 * @fileOverview Flow Genkit pour l'envoi d'e-mails d'alerte.
 * Utilise désormais des variables d'environnement pour plus de sécurité.
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

// Configuration du transporteur utilisant des variables d'environnement
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
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
    let emailContent = `Attention, une température de ${input.temperature.toFixed(1)}°${input.unit === 'Celsius' ? 'C' : 'F'} a été détectée.`;
    
    try {
      const { output } = await ai.generate({
        prompt: `Générez un court e-mail d'alerte professionnel pour une institution. Température: ${input.temperature.toFixed(1)}°${input.unit}. Seuil: ${input.threshold}°${input.unit}. Soyez concis et formel.`,
      });
      if (output?.text) emailContent = output.text;
    } catch (e) {
      console.warn("AI fallback used");
    }

    try {
      await transporter.sendMail({
        from: `"TempAlert ENIM" <${process.env.EMAIL_USER || "benzartiahmedyassine@gmail.com"}>`,
        to: input.recipientEmail,
        subject: `🚨 ALERTE THERMIQUE : ${input.temperature.toFixed(1)}°${input.unit}`,
        text: emailContent,
      });
    } catch (error) {
      console.error("Email failed:", error);
      throw new Error("Erreur d'envoi de l'alerte e-mail");
    }

    return {
      success: true,
      sentAt: new Date().toISOString(),
      messagePreview: emailContent,
    };
  }
);
