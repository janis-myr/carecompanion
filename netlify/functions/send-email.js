// Removed: Netlify send-email function deprecated in favor of Telegram integration.
exports.handler = async function () {
  return { statusCode: 410, body: 'Deprecated' };
};
