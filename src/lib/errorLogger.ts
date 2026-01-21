import { supabase } from '@/lib/supabase'

export const logSystemError = async (
    error: any,
    context: string,
    user_id?: string
) => {
    try {
        console.error(`[System Error - ${context}]`, error);

        await supabase.from('activity_logs').insert({
            user_id: user_id || null, // Can be null if generic system error
            action_type: 'system_error',
            details: {
                message: error?.message || 'Unknown error',
                code: error?.code,
                context: context,
                stack: error?.stack,
                timestamp: new Date().toISOString()
            }
        });
    } catch (loggingError) {
        // Fallback to console if logging itself fails
        console.error("Failed to log error to database:", loggingError);
    }
}
