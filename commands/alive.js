async function aliveCommand(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, {
            text: `🚀 Oui je suis en ligne !\n\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        console.error('[ALIVE ERROR]', e.message);
    }
}

module.exports = aliveCommand;
