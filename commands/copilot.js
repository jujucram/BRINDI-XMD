const axios = require('axios');

async function copilotCommand(sock, chatId, message, args) {
    const query = args.join(' ');

    if (!query) {
        return sock.sendMessage(chatId, {
            text:
`❌ *Usage :* .copilot <demande>

Exemple :
.copilot crée un menu whatsapp bot

> BRINDI-XMD`
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, {
            text: '💻 Copilot génère le code...\n> BRINDI-XMD'
        }, { quoted: message });

        const prompt = `Tu es GitHub Copilot expert en développement. Génère du code propre et commenté pour : ${query}`;

        let answer = null;

        const apis = [
            `https://api.kastg.xyz/api/ai/chatgptV4?prompt=${encodeURIComponent(prompt)}`,
            `https://api.siputzx.my.id/api/ai/meta-llama?content=${encodeURIComponent(prompt)}`,
            `https://api.ryzendesu.vip/api/ai/chatgpt?text=${encodeURIComponent(prompt)}`
        ];

        for (const url of apis) {
            try {
                const r = await axios.get(url, { timeout: 20000 });

                answer =
                    r.data?.result ||
                    r.data?.data ||
                    r.data?.response ||
                    r.data?.message;

                if (answer) break;

            } catch {}
        }

        if (!answer) {
            throw new Error('API indisponible');
        }

        await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption:
`💻 *COPILOT AI*

📋 *Demande :* ${query}

${answer}

> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur Copilot :* ${e.message}\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = copilotCommand;