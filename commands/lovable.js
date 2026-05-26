
const axios = require('axios');

async function lovableCommand(sock, chatId, message, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, {
        text: '❌ Usage: .lovable <description>\nEx: .lovable crée une landing page moderne\n> BRINDI-XMD'
    }, { quoted: message });

    try {
        await sock.sendMessage(chatId, { text: '🎨 Lovable AI génère ton interface...' }, { quoted: message });

        const prompt = `Tu es un expert UI/UX et développeur web moderne. Génère un prompt Lovable.dev détaillé et professionnel pour créer: ${query}. Inclus le style, les couleurs, les composants, et la structure.`;
        let answer = null;
        const apis = [
            `https://api.kastg.xyz/api/ai/chatgptV4?prompt=${encodeURIComponent(prompt)}`,
            `https://api.siputzx.my.id/api/ai/meta-llama?content=${encodeURIComponent(prompt)}`,
            `https://api.ryzendesu.vip/api/ai/chatgpt?text=${encodeURIComponent(prompt)}`
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
            caption: `🎨 *LOVABLE AI — BRINDI-XMD*\n\n📋 *Projet :* ${query}\n\n${answer}\n\n💡 Colle ce prompt sur lovable.dev\n\n> 🥷 Brandon`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ Erreur Lovable: ${e.message}` }, { quoted: message });
    }
}
module.exports = lovableCommand;
