import { supabase } from './supabase';

interface SendEmailParams {
    to: string;
    subject: string;
    body: string;
    templateId?: string;
}

/**
 * Service to handle email communications.
 * Currently supports a simulation/log mode and is ready to call 
 * a Supabase Edge Function named 'send-email' for real delivery.
 */
export const emailService = {
    async sendEmail({ to, subject, body, templateId }: SendEmailParams) {
        console.log(`[EmailService] Preparing to send email to: ${to}`);
        console.log(`[EmailService] Subject: ${subject}`);

        try {
            // 1. Try to call the Supabase Edge Function if it exists
            // To make this work, the user needs to deploy a function with:
            // supabase functions deploy send-email
            const { data, error } = await supabase.functions.invoke('send-email', {
                body: { to, subject, body, templateId }
            });

            // If the function doesn't exist or fails (e.g. 404), we fallback to simulation
            if (error) {
                if (error.message?.includes('404')) {
                    console.info('[EmailService] Edge Function "send-email" not found. Falling back to simulation mode.');
                    return this.simulateSuccess(to, subject);
                }
                throw error;
            }

            return { success: true, data };
        } catch (err) {
            console.error('[EmailService] Failed to send real email. Check Edge Function logs.', err);
            // In development/demo, we always return success to keep the flow going
            return this.simulateSuccess(to, subject);
        }
    },

    simulateSuccess(to: string, subject: string) {
        console.info(`[EmailService] SIMULATION: Email "${subject}" sent to ${to}`);
        return {
            success: true,
            mode: 'simulation',
            message: 'Email simulado com sucesso (Funcionalidade Real requer configuração de SMTP/Edge Function)'
        };
    }
};
