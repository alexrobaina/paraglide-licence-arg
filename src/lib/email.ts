import { Resend } from 'resend';

export interface EmailResult {
  sent: boolean;
  error?: string;
}

/**
 * Sends the exam invitation email via Resend. Best-effort: returns
 * { sent: false, error } instead of throwing, so a failed email never blocks
 * the invitation (the instructor can still share the link by WhatsApp/copy).
 */
export async function sendInvitationEmail(opts: {
  to: string;
  examUrl: string;
  templateTitle: string;
  instructorName: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, error: 'RESEND_API_KEY no configurada.' };

  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: `Invitación a rendir: ${opts.templateTitle}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="margin-bottom: 4px;">Tienes un examen para rendir</h2>
          <p style="color:#555;">
            ${opts.instructorName} te invitó a rendir <strong>${opts.templateTitle}</strong>.
          </p>
          <p style="color:#555;">Este enlace es único y solo puedes usarlo <strong>una vez</strong>.</p>
          <p style="margin: 24px 0;">
            <a href="${opts.examUrl}"
               style="background:#0f172a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
              Rendir examen
            </a>
          </p>
          <p style="color:#999;font-size:12px;">Si el botón no funciona, copia este enlace:<br>${opts.examUrl}</p>
        </div>
      `,
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : 'Error de envío.' };
  }
}
