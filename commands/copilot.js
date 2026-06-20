const axios = require('axios');

async function copilotCommand(sock, chatId, message, args) {
    const query = args.join(' ').trim();

    if (!query) {
        return sock.sendMessage(chatId, {
            text: `❌ *Usage :* \`.copilot <demande>\`\n\n*Exemple :*\n\`.copilot crée un menu whatsapp bot\`\n\n> BRINDI-XMD`
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, {
            text: '💻 *GitHub Copilot génère le code...* ⏳\n\n> BRINDI-XMD'
        }, { quoted: message });

        const prompt = `Tu es GitHub Copilot, un expert en développement informatique. Génère du code propre, commenté et fonctionnel en français pour la demande suivante : ${query}`;
        const q = encodeURIComponent(prompt);

        let answer = null;
        let apiIndex = 1;

        // Liste des APIs d'IA configurées avec fallback en cascade
        const apis = [
            // API 1 : Copilot dédié via Vreden
            async (p) => {
                const r = await axios.get(`https://api.vreden.my.id/api/ai/copilot?query=${p}`, { timeout: 15000 });
                return r.data?.result?.response || r.data?.result;
            },
            // API 2 : Llama-3 (Idéal pour le code informatique) via Siputzx
            async (p) => {
                const r = await axios.get(`https://api.siputzx.my.id/api/ai/meta-llama?content=${p}`, { timeout: 15000 });
                return r.data?.data || r.data?.result;
            },
            // API 3 : ChatGPT via Ryzendesu
            async (p) => {
                const r = await axios.get(`https://api.ryzendesu.vip/api/ai/chatgpt?text=${p}`, { timeout: 15000 });
                return r.data?.response || r.data?.result;
            },
            // API 4 : Blackbox AI (Spécialisé en code) via Siputzx
            async (p) => {
                const r = await axios.get(`https://api.siputzx.my.id/api/ai/blackboxai?content=${p}`, { timeout: 15000 });
                return r.data?.data || r.data?.result;
            }
        ];

        // Boucle de secours
        for (const fetchAi of apis) {
            try {
                // console.log(`[COPILOT] Tentative API n°${apiIndex}...`);
                answer = await fetchAi(q);
                if (answer && answer.trim().length > 0) {
                    break;
                }
            } catch (err) {
                apiIndex++;
                continue;
            }
        }

        if (!answer) {
            throw new Error('Toutes les API de secours sont surchargées.');
        }

        const finalCaption = `💻 *COPILOT AI — BRINDI-XMD*\n\n📋 *Demande :* _${query}_\n\n${answer}\n\n> BRINDI-XMD`;

        // Sécurité contre la limite de taille des captions WhatsApp
        if (answer.length > 900) {
            // Envoi de l'image seule en décoration si elle existe
            try {
                await sock.sendMessage(chatId, { image: { url: './assets/IMG-20240812-WA0097.jpg' } });
            } catch {}
            
            // Envoi du bloc de code complet en format texte standard
            await sock.sendMessage(chatId, { text: finalCaption }, { quoted: message });
        } else {
            // Si la réponse est courte, envoi normal avec l'image
            try {
                await sock.sendMessage(chatId, {
                    image: { url: './assets/IMG-20240812-WA0097.jpg' },
                    caption: finalCaption
                }, { quoted: message });
            } catch (imgErr) {
                // Fallback texte si l'image est manquante sur ton serveur
                await sock.sendMessage(chatId, { text: finalCaption }, { quoted: message });
            }
        }

    } catch (e) {
        console.error('[COPILOT ERROR]', e);
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur Copilot :* ${e.message}\n_Réessaie dans quelques instants._\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = copilotCommand;
