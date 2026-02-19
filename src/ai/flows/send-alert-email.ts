'use server';
/**
 * @fileOverview Flow Genkit pour l'envoi d'e-mails d'alerte à plusieurs destinataires.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendAlertEmailInputSchema = z.object({
  recipientEmail: z.string().describe("Liste des adresses e-mail (séparées par des virgules)."),
  temperature: z.number().describe("La température actuelle relevée."),
  threshold: z.number().describe("Le seuil de température configuré."),
  unit: z.string().default('Celsius'),
});

export type SendAlertEmailInput = z.infer<typeof SendAlertEmailInputSchema>;

const SendAlertEmailOutputSchema = z.object({
  success: z.boolean(),
  sentAt: z.string(),
  recipientsCount: z.number(),
  messagePreview: z.string(),
});

export type SendAlertEmailOutput = z.infer<typeof SendAlertEmailOutputSchema>;

// Configuration du transporteur Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "benzartiahmedyassine@gmail.com",
    pass: "ozhh jdsc ecyj tfsx"
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
    // Nettoyage et validation des emails
    const emailList = input.recipientEmail.split(',').map(e => e.trim()).filter(e => e.length > 0);
    
    if (emailList.length === 0) {
      throw new Error("Aucun destinataire valide fourni.");
    }

    let emailContent = `Attention, une température de ${input.temperature.toFixed(1)}°${input.unit === 'Celsius' ? 'C' : 'F'} a été détectée, dépassant le seuil de sécurité de ${input.threshold}°${input.unit === 'Celsius' ? 'C' : 'F'}.`;
    
    // Tentative de génération de contenu par l'IA
    try {
      const { output } = await ai.generate({
        prompt: `Générez un court corps d'e-mail d'alerte professionnel et urgent pour un groupe de responsables.
        Température: ${input.temperature.toFixed(1)}°${input.unit === 'Celsius' ? 'C' : 'F'}
        Seuil: ${input.threshold}°${input.unit === 'Celsius' ? 'C' : 'F'}
        Le message doit être court, impersonnel (utilisez "Madame, Monsieur" ou "L'équipe") et indiquer qu'une action est requise.`,
      });
      if (output?.text) {
        emailContent = output.text;
      }
    } catch (aiError) {
      console.warn("[WARNING] Échec Genkit AI, message de secours utilisé.");
    }

    // Envoi groupé
    try {
      await transporter.sendMail({
        from: '"TempAlert System" <benzartiahmedyassine@gmail.com>',
        to: emailList.join(', '),
        subject: `🚨 ALERTE CRITIQUE : ${input.temperature.toFixed(1)}°${input.unit === 'Celsius' ? 'C' : 'F'}`,
        text: emailContent,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e0e9ff; border-radius: 10px; background-color: #f8faff; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2962FF; text-align: center;">🚨 Alerte de Surveillance TempAlert</h2>
            <div style="background-color: #ff7729; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-weight: bold; font-size: 1.5em;">
                ${input.temperature.toFixed(1)}°${input.unit === 'Celsius' ? 'C' : 'F'}
              </p>
              <p style="margin: 5px 0 0 0; font-size: 0.9em; opacity: 0.9;">
                Seuil de sécurité : ${input.threshold}°${input.unit === 'Celsius' ? 'C' : 'F'}
              </p>
            </div>
            <div style="color: #444; line-height: 1.6; background: white; padding: 15px; border-radius: 5px;">
              ${emailContent.replace(/\n/g, '<br>')}
            </div>
            <p style="font-size: 0.8em; color: #888; text-align: center; margin-top: 20px;">
              Ceci est un message diffusé aux responsables de zone.
            </p>
          </div>
        `
      });
      console.log(`[SUCCESS] E-mail groupé envoyé à ${emailList.length} destinataires.`);
    } catch (error) {
      console.error("[ERROR] Nodemailer group send failed:", error);
      throw new Error("Erreur lors de l'envoi groupé.");
    }

    return {
      success: true,
      sentAt: new Date().toISOString(),
      recipientsCount: emailList.length,
      messagePreview: emailContent,
    };
  }
);