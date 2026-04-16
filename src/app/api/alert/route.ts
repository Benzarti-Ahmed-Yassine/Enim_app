import { NextRequest, NextResponse } from 'next/server';
import { sendAlertEmail } from '@/ai/flows/send-alert-email';

/**
 * Endpoint API pour déclencher manuellement une alerte ou depuis un service externe.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, temperature, threshold } = body;

    if (!email || temperature === undefined) {
      return NextResponse.json({ error: "Paramètres manquants (email, temperature)" }, { status: 400 });
    }

    const result = await sendAlertEmail({
      recipientEmail: email,
      temperature: Number(temperature),
      threshold: Number(threshold || 30),
      unit: "Celsius"
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
