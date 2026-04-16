'use server';
/**
 * @fileOverview Flow Genkit pour l'envoi d'e-mails d'alerte.
 * Utilise l'IA pour personnaliser le message et Nodemailer pour l'expédition via Gmail SMTP.
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

// Configuration SMTP explicite pour Gmail (plus fiable en production)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true pour le port 465
  auth: {
    user: process.env.EMAIL_USER || "benzartiahmedyassine@gmail.com",
    pass: process.env.EMAIL_PASS || "ozhh jdsc ecyj tfsx" // Ce code doit être un mot de passe d'application de 16 caractères
  },
  tls: {
    rejectUnauthorized: false // Permet d'éviter certains blocages réseau sur les hébergeurs
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
      // Génération IA du message institutionnel
      const { output } = await ai.generate({
        prompt: `Rédigez un court e-mail d'alerte formel pour l'ENIM Monastir. 
        Détails : Température relevée : ${input.temperature.toFixed(1)}°C. 
        Seuil de sécurité : ${input.threshold}°C. 
        L'e-mail doit être urgent, professionnel et inciter à une vérification immédiate du matériel.`,
      });
      if (output?.text) emailContent = output.text;
    } catch (e) {
      console.warn("Échec de la génération IA, message par défaut utilisé.");
    }

    try {
      await transporter.sendMail({
        from: `"TempAlert ENIM System" <${process.env.EMAIL_USER || "benzartiahmedyassine@gmail.com"}>`,
        to: input.recipientEmail,
        subject: `⚠️ ALERTE THERMIQUE CRITIQUE : ${input.temperature.toFixed(1)}°C`,
        text: emailContent,
        html: `
          <div style="font-family: sans-serif; padding: 25px; border: 3px solid #e11d48; border-radius: 12px; max-width: 600px; margin: auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #e11d48; margin: 0; font-size: 24px; text-transform: uppercase;">Alerte de Sécurité Thermique</h1>
              <p style="color: #64748b; font-weight: bold;">Laboratoire de l'ENIM Monastir</p>
            </div>
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 5px solid #e11d48;">
              <p style="font-size: 16px; color: #334155; line-height: 1.6; margin: 0;">${emailContent}</p>
            </div>
            <div style="margin-top: 25px; font-size: 14px; color: #475569;">
              <p><strong>Détails du relevé :</strong></p>
              <ul>
                <li>Valeur : <span style="color: #e11d48; font-weight: bold;">${input.temperature.toFixed(1)}°C</span></li>
                <li>Seuil d'alerte : ${input.threshold}°C</li>
                <li>Date : ${new Date().toLocaleString('fr-FR')}</li>
              </ul>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">
              Ceci est un message automatique généré par le système de surveillance TempAlert.<br>
              Département Électronique - École Nationale d'Ingénieurs de Monastir.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Erreur Nodemailer détaillée:", error);
      throw new Error("L'envoi de l'e-mail a échoué. Cause probable : Mot de passe d'application Google manquant ou incorrect.");
    }

    return {
      success: true,
      sentAt: new Date().toISOString(),
      messagePreview: emailContent,
    };
  }
);
