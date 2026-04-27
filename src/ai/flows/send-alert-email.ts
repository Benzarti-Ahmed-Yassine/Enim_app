'use server';
/**
 * @fileOverview Flow Genkit pour l'envoi d'e-mails d'alerte.
 * Supporte les alertes de température et les alertes d'inactivité matérielle.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendAlertEmailInputSchema = z.object({
  recipientEmail: z.string().describe("Une ou plusieurs adresses e-mail séparées par des virgules."),
  temperature: z.number().optional(),
  threshold: z.number().optional(),
  unit: z.string().default('Celsius'),
  isTest: z.boolean().optional().default(false),
  alertType: z.enum(['temperature', 'inactivity']).optional().default('temperature'),
  lastSeen: z.string().optional(),
});

export type SendAlertEmailInput = z.infer<typeof SendAlertEmailInputSchema>;

const SendAlertEmailOutputSchema = z.object({
  success: z.boolean(),
  sentAt: z.string(),
  messagePreview: z.string(),
  recipientCount: z.number(),
});

export type SendAlertEmailOutput = z.infer<typeof SendAlertEmailOutputSchema>;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "benzartiahmedyassine@gmail.com",
    pass: "komgtkjteziaryoq" 
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
    const recipients = input.recipientEmail
      .split(',')
      .map(e => e.trim())
      .filter(e => e !== "" && e.includes('@'));
    
    if (recipients.length === 0) {
      throw new Error("Aucun destinataire valide trouvé dans la liste.");
    }

    let emailContent = "";
    let subject = "";
    let isCritical = true;

    if (input.alertType === 'inactivity') {
      subject = `⚠️ PERTE DE CONNEXION : ESP32 HORS-LIGNE`;
      emailContent = `Le système n'a reçu aucune donnée du capteur depuis plus de 10 minutes. La surveillance est interrompue.`;
      if (input.lastSeen) {
        emailContent += ` Dernière activité enregistrée : ${new Date(input.lastSeen).toLocaleString('fr-FR')}.`;
      }
    } else {
      subject = `⚠️ ALERTE THERMIQUE : ${input.temperature?.toFixed(1)}°C`;
      emailContent = `Une température de ${input.temperature?.toFixed(1)}°${input.unit === 'Celsius' ? 'C' : 'F'} a été détectée, dépassant le seuil de sécurité de ${input.threshold}°${input.unit}.`;
      
      try {
        const { output } = await ai.generate({
          prompt: `Rédigez un court e-mail d'alerte thermique urgent pour l'ENIM Monastir. 
          Détails : Température relevée : ${input.temperature?.toFixed(1)}°C. 
          Seuil de sécurité : ${input.threshold}°C.`,
        });
        if (output?.text) emailContent = output.text;
      } catch (e) {}
    }

    try {
      await transporter.sendMail({
        from: `"TempAlert ENIM" <benzartiahmedyassine@gmail.com>`,
        to: recipients.join(', '),
        subject: subject,
        text: emailContent,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 2px solid #e11d48; border-radius: 10px; max-width: 500px; margin: auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #e11d48; margin: 0;">${input.alertType === 'inactivity' ? 'Alerte Système' : 'Alerte Thermique'}</h2>
              <p style="color: #64748b; font-size: 14px;">ENIM Monastir - Surveillance Laboratoire</p>
            </div>
            <div style="background: #fef2f2; padding: 15px; border-radius: 5px; border-left: 4px solid #e11d48;">
              <p style="font-size: 16px; color: #1e293b; line-height: 1.5; margin: 0;">${emailContent}</p>
            </div>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              <p>Envoyé automatiquement par le système TempAlert.<br>
              Date : ${new Date().toLocaleString('fr-FR')}</p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error("Erreur SMTP détaillée:", error);
      throw new Error("ÉCHEC ENVOI : Vérifiez vos identifiants Gmail.");
    }

    return {
      success: true,
      sentAt: new Date().toISOString(),
      messagePreview: emailContent,
      recipientCount: recipients.length,
    };
  }
);