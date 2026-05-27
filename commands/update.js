const { exec } = require('child_process');

async function updateCommand(sock, chatId, message) {

    try {

        await sock.sendMessage(chatId, {
            text: `🔄 Updating BRINDI-XMD... Please wait`
        }, { quoted: message });

        exec('git pull && npm install', async (err, stdout, stderr) => {

            if (err) {
                return sock.sendMessage(chatId, {
                    text: `❌ Update failed:\n${err.message}`
                }, { quoted: message });
            }

            let result = stdout || stderr;

            await sock.sendMessage(chatId, {
                text:
`✅ BRINDI-XMD Updated Successfully 🔥

${result}

⚡ Restart the bot to apply changes.

> BRINDI-XMD`
            }, { quoted: message });

        });

    } catch (e) {

        await sock.sendMessage(chatId, {
            text: `❌ Error during update.\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = updateCommand;
