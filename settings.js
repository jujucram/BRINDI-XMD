require('dotenv').config();

const settings = {
  packname: process.env.PACK_NAME || 'BRINDI-XMD',
  author: process.env.PACK_AUTHOR || 'BRANDON',
  botName: process.env.BOT_NAME || 'BRINDI-XMD',
  botOwner: process.env.OWNER_NAME || 'Brindi Cram',
  ownerNumber: process.env.OWNER_NUMBER || '237673355468',
  prefix: process.env.PREFIX || '.',
  giphyApiKey: process.env.GIPHY_API_KEY || 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
  commandMode: process.env.COMMAND_MODE || 'private',
  maxStoreMessages: 20,
  storeWriteInterval: 10000,
  description: "Bot WhatsApp multifonctions - Brindi-XMD",
  version: process.env.BOT_VERSION || '1.0.0',
  ytch: process.env.YT_CHANNEL || '',
  waChannel: process.env.WA_CHANNEL || '',
  updateZipUrl: "https://github.com/jujucram/",
};

module.exports = settings;
