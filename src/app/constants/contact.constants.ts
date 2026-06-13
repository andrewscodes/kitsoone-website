// WhatsApp constants
export const WHATSAPP_PHONE_NUMBER = '573189702541';
export const WHATSAPP_DEFAULT_MESSAGE = 'Hola! Tengo una pregunta';

// Social media URLs
export const FACEBOOK_URL = 'https://www.facebook.com/kitsoone';
export const INSTAGRAM_URL = 'https://www.instagram.com/kitsoone.xyz/';
export const DISCORD_URL = 'https://discord.gg/KZWCEate2R';
export const GITHUB_URL = 'https://github.com/kitsoone-xyz';

export const generateWhatsAppUrl = (): string => {
  const encodedMessage = encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE);
  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`;
};
