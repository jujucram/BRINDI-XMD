async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        await sock.sendMessage(chatId, {
            react: { text: '🏓', key: message.key }
        });
        const ping = Date.now() - start;

        await sock.sendMessage(chatId, {
            text: `🏓 *Pong !*\n📡 *${ping} ms*\n\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        console.error('[PING ERROR]', e.message);
    }
}

module.exports = pingCommand;
