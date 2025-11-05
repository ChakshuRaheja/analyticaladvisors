
export const sendNotificationToTelegram = async (telegramNotificationBody) => {
    try {
        const response = await fetch('https://analytics-advisor-notifications-583205731005.us-central1.run.app/webhook', {
            method: 'POST',
            body: telegramNotificationBody
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to send notification');
        }
    } catch (error) {
        console.error('Failed to send telegram notification:', error.message);
    }
};
