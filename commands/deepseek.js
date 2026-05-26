
const axios = require('axios');

async function deepseekCommand(sock, chatId, message, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, {
        text: '❌ Usage: .deepseek <question>\nEx: .deepseek explique api rest.\n> BRINDI-XMD'
    }, { quoted: message });

    try {
        await sock.sendMessage(chatId, { text: '🧠 DeepSeek réfléchit...\n> BRINDI-XMD' }, { quoted: message });

        let answer = null;
        const apis = [
            `https://api.kastg.xyz/api/ai/chatgptV4?prompt=${encodeURIComponent(query)}`,
            `https://api.siputzx.my.id/api/ai/meta-llama?content=${encodeURIComponent(query)}`,
            `https://api.ryzendesu.vip/api/ai/chatgpt?text=${encodeURIComponent(query)}`
        ];

        for (const url of apis) {
            try {
                const r = await axios.get(url, { timeout: 20000 });
                answer = r.data?.result || r.data?.data || r.data?.response || r.data?.message;
                if (answer) break;
            } catch {}
        }

        if (!answer) throw new Error('API indisponible');

        await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `🧠 *DEEPSEEK AI — BRINDI-XMD*\n\n❓ *Question :* ${query}\n\n💬 *Réponse :*\n${answer}\n\n> 🥷 Brandon`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ Erreur DeepSeek: ${e.message}` }, { quoted: message });
    }
}
module.exports = deepseekCommand;
