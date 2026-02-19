
'use server';
/**
 * @fileOverview Flow Genkit pour l'envoi réel d'e-mails d'alerte via Nodemailer.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

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

// Configuration du transporteur Nodemailer (Gmail)
// Note: Utilise les identifiants fournis pour le prototype
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "benzartiahmedyassine@gmail.com",
    pass: "ozhh jdsc ecyj tfsx" // Mot de passe d'application Gmail
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
    // Génération du contenu de l'e-mail par l'IA
    const { output } = await ai.generate({
      prompt: `Vous êtes le système de surveillance intelligent TempAlert. 
      Générez un corps d'e-mail d'alerte professionnel et urgent pour un utilisateur dont le capteur a détecté un dépassement de seuil critique.
      
      Destinataire: ${input.recipientEmail}
      Température Actuelle: ${input.temperature}${input.unit === 'Celsius' ? '°C' : '°F'}
      Seuil Limite: ${input.threshold}${input.unit === 'Celsius' ? '°C' : '°F'}
      
      L'e-mail doit avoir un objet clair et un corps concis expliquant les risques potentiels. 
      Le ton doit être professionnel mais alarmant.`,
    });

    const emailContent = output?.text || "Alerte de température critique détectée par le système TempAlert.";

    // Envoi effectif de l'e-mail
    try {
      await transporter.sendMail({
        from: '"TempAlert Monitor" <benzartiahmedyassine@gmail.com>',
        to: input.recipientEmail,
        subject: "🚨 ALERTE TEMPÉRATURE CRITIQUE - TempAlert",
        text: emailContent,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e0e9ff; border-radius: 10px; background-color: #f8faff;">
            <h2 style="color: #2962FF;">🚨 Alerte de Sécurité TempAlert</h2>
            <p>Une anomalie thermique a été détectée sur votre capteur.</p>
            <div style="background-color: #ff7729; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; font-size: 1.2em;">
                Température Actuelle : ${input.temperature.toFixed(1)}°${input.unit === 'Celsius' ? 'C' : 'F'}
              </p>
              <p style="margin: 5px 0 0 0; font-size: 0.9em;">
                Seuil de Sécurité : ${input.threshold}°${input.unit === 'Celsius' ? 'C' : 'F'}
              </p>
            </div>
            <div style="color: #444; line-height: 1.6;">
              ${emailContent.replace(/\n/g, '<br>')}
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8em; color: #888;">Ceci est un message automatique généré par votre système de surveillance TempAlert.</p>
          </div>
        `
      });
      
      console.log(`[SUCCESS] E-mail d'alerte envoyé à ${input.recipientEmail}`);
    } catch (error) {
      console.error("[ERROR] Échec de l'envoi de l'e-mail:", error);
      throw new Error("Impossible d'envoyer l'e-mail d'alerte.");
    }

    return {
      success: true,
      sentAt: new Date().toISOString(),
      messagePreview: emailContent,
    };
  }
);
