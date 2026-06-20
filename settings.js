require('dotenv').config();

const settings = {
  packname: process.env.PACK_NAME || 'BRINDI-XMD',
  author: process.env.PACK_AUTHOR || 'B.r.a.n_don14✨',
  botName: process.env.BOT_NAME || 'BRINDI-XMD',
  botOwner: process.env.OWNER_NAME || 'B.r.a.n_don14✨',
  ownerNumber: process.env.OWNER_NUMBER || '237673355468',
  prefix: process.env.PREFIX || '.',
  giphyApiKey: process.env.GIPHY_API_KEY || '',// votre api giphy
  commandMode: process.env.COMMAND_MODE || 'private',
  maxStoreMessages: 20,
  storeWriteInterval: 10000,
  description: "Bot WhatsApp Xerone multifonctions - Brindi-XMD",
  version: process.env.BOT_VERSION || '1.0.0',
  ytch: process.env.YT_CHANNEL || '',
  waChannel: process.env.WA_CHANNEL || '',
  updateZipUrl: "https://github.com/jujucram/",
};

module.exports = settings;
