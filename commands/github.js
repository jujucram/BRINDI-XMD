const moment = require('moment-timezone');
const fetch = require('node-fetch');

async function githubCommand(sock, chatId, message) {
  try {

    const res = await fetch('https://api.github.com/users/jujucram');

    if (!res.ok) {
      throw new Error('Error fetching GitHub data');
    }

    const json = await res.json();

    let txt = `*☆ BRINDI-XMD ☆*\n\n`;
    txt += `✩ *Username* : ${json.login}\n`;
    txt += `✩ *Name* : ${json.name || 'Unknown'}\n`;
    txt += `✩ *Followers* : ${json.followers}\n`;
    txt += `✩ *Following* : ${json.following}\n`;
    txt += `✩ *Public Repos* : ${json.public_repos}\n`;
    txt += `✩ *Bio* : ${json.bio || 'No bio'}\n`;
    txt += `✩ *Created* : ${moment(json.created_at).format('DD/MM/YYYY')}\n`;
    txt += `✩ *Profile* : ${json.html_url}\n`;
    txt += `\n> BRINDI-XMD`;

    await sock.sendMessage(
      chatId,
      {
        text: txt
      },
      {
        quoted: message
      }
    );

  } catch (error) {

    console.log(error);

    await sock.sendMessage(
      chatId,
      {
        text: '❌ Error fetching GitHub information.\n> BRINDI-XMD'
      },
      {
        quoted: message
      }
    );
  }
}

module.exports = githubCommand;