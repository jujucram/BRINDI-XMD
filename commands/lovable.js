const axios = require('axios');

async function lovableCommand(sock, chatId, message, args) {
    const query = args.join(' ').trim();
    
    if (!query) {
        return sock.sendMessage(chatId, {
            text: '❌ *Usage :* `.lovable <description du projet>`\n\n*Exemple :* `.lovable crée une landing page moderne de e-commerce`\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    try {
        // Message d'attente
        await sock.sendMessage(chatId, { 
            text: '🎨 *Lovable AI génère ton architecture d\'interface...* ⏳\n\n> BRINDI-XMD' 
        }, { quoted: message });

        const prompt = `Tu es un expert UI/UX de renommée mondiale et développeur web moderne. Génère un prompt de génération de code pour Lovable.dev extrêmement détaillé, technique et professionnel en français pour concevoir l'interface suivante : ${query}. Inclus explicitement : la structure des sections, une palette de couleurs moderne (Hex), le style visuel (ex: minimaliste, glassmorphism), les composants interactifs, ainsi que les animations et l'adaptation mobile.`;
        const q = encodeURIComponent(prompt);

        let answer = null;
        let apiIndex = 1;

        // Liste des API de secours robustes
        const apis = [
            // API 1 : Llama-3-70B via Siputzx (Excellent pour structurer des prompts longs)
            async (p) => {
                const r = await axios.get(`https://api.siputzx.my.id/api/ai/meta-llama?content=${p}`, { timeout: 15000 });
                return r.data?.data || r.data?.result;
            },
            // API 2 : GPT-4 / ChatGPT via Ryzendesu
            async (p) => {
                const r = await axios.get(`https://api.ryzendesu.vip/api/ai/chatgpt?text=${p}`, { timeout: 15000 });
                return r.data?.response || r.data?.result;
            },
            // API 3 : Blackbox AI via Siputzx (Très axé sur le développement)
            async (p) => {
                const r = await axios.get(`https://api.siputzx.my.id/api/ai/blackboxai?content=${p}`, { timeout: 15000 });
                return r.data?.data || r.data?.result;
            },
            // API 4 : Option alternative via Vreden
            async (p) => {
                const r = await axios.get(`https://api.vreden.my.id/api/ai/copilot?query=${p}`, { timeout: 15000 });
                return r.data?.result?.response || r.data?.result;
            }
        ];

        // Boucle d'exécution en cascade
        for (const fetchAi of apis) {
            try {
                // console.log(`[LOVABLE] Test API n°${apiIndex}...`);
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
            throw new Error('Toutes les API de génération sont surchargées.');
        }

        const finalCaption = `🎨 *LOVABLE AI — BRINDI-XMD*\n\n📋 *Projet :* _${query}_\n\n${answer}\n\n💡 _Copie et colle ce prompt détaillé sur Lovable.dev pour obtenir ton code source._\n\n> 🥷 Brandon`;

        // Sécurité contre la limite de taille des légendes d'images (> 900 caractères)
        if (answer.length > 900) {
            try {
                await sock.sendMessage(chatId, { image: { url: './assets/IMG-20240812-WA0097.jpg' } });
            } catch {}
            await sock.sendMessage(chatId, { text: finalCaption }, { quoted: message });
        } else {
            try {
                await sock.sendMessage(chatId, {
                    image: { url: './assets/IMG-20240812-WA0097.jpg' },
                    caption: finalCaption
                }, { quoted: message });
            } catch (imgErr) {
                // Secours en texte pur si le fichier image local est inexistant
                await sock.sendMessage(chatId, { text: finalCaption }, { quoted: message });
            }
        }

    } catch (e) {
        console.error('[LOVABLE ERROR]', e);
        await sock.sendMessage(chatId, { 
            text: `❌ *Erreur Lovable AI :* ${e.message}\n_Veuillez réessayer dans un instant._\n\n> BRINDI-XMD` 
        }, { quoted: message });
    }
}

module.exports = lovableCommand;
