const axios = require('axios');

function getPrompt() {
    try {
        var fs = require('fs'), path = require('path');
        var p = path.join(__dirname, '../data/prompt.json');
        return JSON.parse(fs.readFileSync(p)).prompt || "Tu es Brindi-XMD, assistant WhatsApp créé par Brandon. Réponds en français, sois utile et concis.";
    } catch (e) {
        return "Tu es Brindi-XMD, assistant WhatsApp créé par Brandon. Réponds en français, sois utile et concis.";
    }
}

async function aiCommand(sock, chatId, message) {
    try {
        var text = (message.message && (
            message.message.conversation ||
            (message.message.extendedTextMessage && message.message.extendedTextMessage.text) ||
            (message.message.imageMessage && message.message.imageMessage.caption) ||
            ''
        )) || '';

        var query = text.split(' ').slice(1).join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: '🤖 *Usage :* .gpt <question>\n💡 _Exemple : .gpt C\'est quoi Python ?_\n\n> BRINDI-XMD'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });

        var systemPrompt = getPrompt();

        // On encode SEULEMENT la query, pas le system prompt dans l'URL
        var encodedQuery = encodeURIComponent(query);
        var encodedFull = encodeURIComponent(systemPrompt + '\n\n' + query);

        var answer = null;

        // ============================
        // API 1 : Pollinations POST (le plus stable, system prompt séparé)
        // ============================
        try {
            console.log('[AI] API 1 - Pollinations POST...');
            var r1 = await axios.post(
                'https://text.pollinations.ai/openai',
                {
                    model: 'openai',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: query }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                },
                { timeout: 20000, headers: { 'Content-Type': 'application/json' } }
            );
            var a1 = r1.data && r1.data.choices && r1.data.choices[0] && r1.data.choices[0].message && r1.data.choices[0].message.content;
            if (a1 && a1.trim().length > 3) {
                answer = a1.trim();
                console.log('[AI] API 1 OK ✅');
            }
        } catch (e1) {
            console.warn('[AI] API 1 échouée :', e1.message);
        }

        // ============================
        // API 2 : Pollinations GET (fallback rapide)
        // ============================
        if (!answer) {
            try {
                console.log('[AI] API 2 - Pollinations GET...');
                var r2 = await axios.get(
                    'https://text.pollinations.ai/' + encodedFull + '?model=openai',
                    { timeout: 20000 }
                );
                var a2 = r2.data;
                if (a2 && typeof a2 === 'string' && a2.trim().length > 3) {
                    answer = a2.trim();
                    console.log('[AI] API 2 OK ✅');
                }
            } catch (e2) {
                console.warn('[AI] API 2 échouée :', e2.message);
            }
        }

        // ============================
        // API 3 : GiftedTech Gemini (clé publique)
        // ============================
        if (!answer) {
            try {
                console.log('[AI] API 3 - GiftedTech...');
                var r3 = await axios.get(
                    'https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=' + encodedQuery,
                    { timeout: 15000, headers: { 'user-agent': 'Mozilla/5.0' } }
                );
                var a3 = r3.data && (r3.data.result || r3.data.answer || r3.data.message);
                if (a3 && a3.toString().trim().length > 3) {
                    answer = a3.toString().trim();
                    console.log('[AI] API 3 OK ✅');
                }
            } catch (e3) {
                console.warn('[AI] API 3 échouée :', e3.message);
            }
        }

        // ============================
        // API 4 : Siputzx Gemini Pro
        // ============================
        if (!answer) {
            try {
                console.log('[AI] API 4 - Siputzx Gemini Pro...');
                var r4 = await axios.get(
                    'https://api.siputzx.my.id/api/ai/gemini-pro?content=' + encodedQuery,
                    { timeout: 15000, headers: { 'user-agent': 'Mozilla/5.0' } }
                );
                var a4 = r4.data && (r4.data.message || r4.data.data || r4.data.result);
                if (a4 && a4.toString().trim().length > 3) {
                    answer = a4.toString().trim();
                    console.log('[AI] API 4 OK ✅');
                }
            } catch (e4) {
                console.warn('[AI] API 4 échouée :', e4.message);
            }
        }

        // ============================
        // API 5 : Ryzendesu Gemini
        // ============================
        if (!answer) {
            try {
                console.log('[AI] API 5 - Ryzendesu...');
                var r5 = await axios.get(
                    'https://api.ryzendesu.vip/api/ai/gemini?text=' + encodedQuery,
                    { timeout: 15000, headers: { 'user-agent': 'Mozilla/5.0' } }
                );
                var a5 = r5.data && (r5.data.message || r5.data.answer || r5.data.result);
                if (a5 && a5.toString().trim().length > 3) {
                    answer = a5.toString().trim();
                    console.log('[AI] API 5 OK ✅');
                }
            } catch (e5) {
                console.warn('[AI] API 5 échouée :', e5.message);
            }
        }

        // ============================
        // RÉSULTAT FINAL
        // ============================

        if (!answer) {
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return await sock.sendMessage(chatId, {
                text: '❌ *L\'IA est temporairement indisponible.*\n_Réessaie dans quelques instants._\n\n> BRINDI-XMD'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: answer + '\n\n> BRINDI-XMD'
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (e) {
        console.error('[AI ERROR]', e.message);
        await sock.sendMessage(chatId, {
            text: '❌ *Erreur inattendue.*\n_Réessaie dans quelques instants._\n\n> BRINDI-XMD'
        }, { quoted: message });
    }
}

module.exports = aiCommand;
