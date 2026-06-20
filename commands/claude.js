const axios = require('axios');

async function claudeCommand(sock, chatId, message, args) {
    var query = args.join(' ').trim();

    if (!query) {
        return sock.sendMessage(chatId, {
            text: '❌ *Usage:* `.claude <votre question>`\n\n*Exemple :* `.claude explique le JavaScript en 2 phrases`\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, {
            text: '🤖 *Claude AI est en train de réfléchir...* ⏳\n\n> BRINDI-XMD'
        }, { quoted: message });

        var answer = null;
        var encoded = encodeURIComponent(query);

        // ============================
        // API 1 : Pollinations.AI (POST OpenAI-compatible, 100% gratuit, sans clé)
        // ============================
        try {
            console.log('[CLAUDE] API 1 - Pollinations.AI...');
            var r1 = await axios.post(
                'https://text.pollinations.ai/openai',
                {
                    model: 'openai',
                    messages: [
                        { role: 'system', content: 'Tu es un assistant IA intelligent et serviable. Réponds toujours en français de manière claire et détaillée.' },
                        { role: 'user', content: query }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                },
                { timeout: 20000, headers: { 'Content-Type': 'application/json' } }
            );
            var a1 = r1.data && r1.data.choices && r1.data.choices[0] && r1.data.choices[0].message && r1.data.choices[0].message.content;
            if (a1 && a1.trim().length > 0) {
                answer = a1.trim();
                console.log('[CLAUDE] API 1 OK ✅');
            }
        } catch (e1) {
            console.warn('[CLAUDE] API 1 échouée :', e1.message);
        }

        // ============================
        // API 2 : Pollinations.AI (GET simple, fallback rapide)
        // ============================
        if (!answer) {
            try {
                console.log('[CLAUDE] API 2 - Pollinations GET...');
                var r2 = await axios.get(
                    'https://text.pollinations.ai/' + encoded + '?model=openai&system=' + encodeURIComponent('Tu es un assistant IA. Réponds toujours en français.'),
                    { timeout: 20000 }
                );
                var a2 = r2.data;
                if (a2 && typeof a2 === 'string' && a2.trim().length > 0) {
                    answer = a2.trim();
                    console.log('[CLAUDE] API 2 OK ✅');
                }
            } catch (e2) {
                console.warn('[CLAUDE] API 2 échouée :', e2.message);
            }
        }

        // ============================
        // API 3 : Siputzx (Claude/ChatGPT, sans clé)
        // ============================
        if (!answer) {
            try {
                console.log('[CLAUDE] API 3 - Siputzx...');
                var r3 = await axios.get(
                    'https://api.siputzx.my.id/api/ai/claude?content=' + encoded,
                    { timeout: 15000, headers: { 'user-agent': 'Mozilla/5.0' } }
                );
                var a3 = r3.data && (r3.data.data || r3.data.result || r3.data.message);
                if (a3 && a3.toString().trim().length > 0) {
                    answer = a3.toString().trim();
                    console.log('[CLAUDE] API 3 OK ✅');
                }
            } catch (e3) {
                console.warn('[CLAUDE] API 3 échouée :', e3.message);
            }
        }

        // ============================
        // API 4 : BK9 (ChatGPT gratuit, sans clé)
        // ============================
        if (!answer) {
            try {
                console.log('[CLAUDE] API 4 - BK9...');
                var r4 = await axios.get(
                    'https://api.bk9.site/ai/chatgpt?q=' + encoded,
                    { timeout: 15000, headers: { 'user-agent': 'Mozilla/5.0' } }
                );
                var a4 = r4.data && r4.data.BK9;
                if (a4 && a4.toString().trim().length > 0) {
                    answer = a4.toString().trim();
                    console.log('[CLAUDE] API 4 OK ✅');
                }
            } catch (e4) {
                console.warn('[CLAUDE] API 4 échouée :', e4.message);
            }
        }

        // ============================
        // RÉSULTAT FINAL
        // ============================

        if (!answer) {
            return await sock.sendMessage(chatId, {
                text: '❌ *Toutes les IA sont indisponibles pour le moment.*\n_Réessayez dans quelques instants._\n\n> BRINDI-XMD'
            }, { quoted: message });
        }

        var finalCaption = '🤖 *CLAUDE AI — BRINDI-XMD*\n\n❓ *Question :* ' + query + '\n\n💬 *Réponse :*\n\n' + answer + '\n\n> 🥷 Brandon';

        if (answer.length > 900) {
            try {
                await sock.sendMessage(chatId, { image: { url: './assets/IMG-20240812-WA0097.jpg' } });
            } catch (imgErr) {}
            await sock.sendMessage(chatId, { text: finalCaption }, { quoted: message });
        } else {
            try {
                await sock.sendMessage(chatId, {
                    image: { url: './assets/IMG-20240812-WA0097.jpg' },
                    caption: finalCaption
                }, { quoted: message });
            } catch (imageError) {
                await sock.sendMessage(chatId, { text: finalCaption }, { quoted: message });
            }
        }

    } catch (e) {
        console.error('[CLAUDE ERROR]', e);
        await sock.sendMessage(chatId, {
            text: '❌ *Désolé, une erreur inattendue s\'est produite.*\n\nℹ️ _' + e.message + '_\n\n> BRINDI-XMD'
        }, { quoted: message });
    }
}

module.exports = claudeCommand;
