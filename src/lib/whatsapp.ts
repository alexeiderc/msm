type WhatsAppMessage = {
  to: string;
  template: string;
  variables?: Record<string, string>;
};

export async function queueWhatsAppMessage(message: WhatsAppMessage) {
  const baseUrl = process.env.WHATSAPP_API_BASE_URL;
  const token = process.env.WHATSAPP_API_TOKEN;

  if (!baseUrl || !token) {
    return {
      queued: false,
      reason: "WhatsApp API is not configured yet",
      message
    };
  }

  const response = await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });

  if (!response.ok) {
    throw new Error("WhatsApp provider rejected the message.");
  }

  return response.json();
}
