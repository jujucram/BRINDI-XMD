const axios = require('axios');

async function codeaiCommand(sock, chatId, senderId, args, message) {
    var prompt = args.join(' ').trim();

    if (!prompt) {
        return await sock.sendMessage(chatId, {
            text: '💻 *Usage :* `.codeai <votre demande de code>`\n\n💡 *Exemple :* `.codeai crée une fonction Python qui trie une liste`\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    await sock.sendMessage(chatId, { react: { text: '💻', key: message.key } });

    var sysPrompt = 'Tu es un expert développeur. Génère du code propre, commenté et fonctionnel. Réponds avec le code bien formaté en markdown et une courte explication en français.';
    var fullPrompt = sysPrompt + '\n\nDemande : ' + prompt;
    var encoded = encodeURIComponent(fullPrompt);

    var result = null;

    // ============================
    // API 1 : Pollinations POST (OpenAI-compatible, sans clé, très stable)
    // ============================
    try {
        console.log('[CODEAI] API 1 - Pollinations POST...');
        var r1 = await axios.post(
            'https://text.pollinations.ai/openai',
            {
                model: 'openai',
                messages: [
                    { role: 'system', content: sysPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 2000
            },
            { timeout: 25000, headers: { 'Content-Type': 'application/json' } }
        );
        var a1 = r1.data && r1.data.choices && r1.data.choices[0] && r1.data.choices[0].message && r1.data.choices[0].message.content;
        if (a1 && a1.trim().length > 10) {
            result = a1.trim();
            console.log('[CODEAI] API 1 OK ✅');
        }
    } catch (e1) {
        console.warn('[CODEAI] API 1 échouée :', e1.message);
    }

    // ============================
    // API 2 : Pollinations GET (fallback rapide)
    // ============================
    if (!result) {
        try {
            console.log('[CODEAI] API 2 - Pollinations GET...');
            var r2 = await axios.get(
                'https://text.pollinations.ai/' + encoded + '?model=openai',
                { timeout: 20000 }
            );
            var a2 = r2.data;
            if (a2 && typeof a2 === 'string' && a2.trim().length > 10) {
                result = a2.trim();
                console.log('[CODEAI] API 2 OK ✅');
            }
        } catch (e2) {
            console.warn('[CODEAI] API 2 échouée :', e2.message);
        }
    }

    // ============================
    // API 3 : Siputzx Blackbox AI (spécialisé code)
    // ============================
    if (!result) {
        try {
            console.log('[CODEAI] API 3 - Siputzx Blackbox...');
            var r3 = await axios.get(
                'https://api.siputzx.my.id/api/ai/blackboxai?content=' + encoded,
                { timeout: 20000, headers: { 'user-agent': 'Mozilla/5.0' } }
            );
            var a3 = r3.data && (r3.data.data || r3.data.result || r3.data.message);
            if (a3 && a3.toString().trim().length > 10) {
                result = a3.toString().trim();
                console.log('[CODEAI] API 3 OK ✅');
            }
        } catch (e3) {
            console.warn('[CODEAI] API 3 échouée :', e3.message);
        }
    }

    // ============================
    // API 4 : Ryzendesu Gemini (bon pour le code)
    // ============================
    if (!result) {
        try {
            console.log('[CODEAI] API 4 - Ryzendesu Gemini...');
            var r4 = await axios.get(
                'https://api.ryzendesu.vip/api/ai/gemini?text=' + encoded,
                { timeout: 20000, headers: { 'user-agent': 'Mozilla/5.0' } }
            );
            var a4 = r4.data && (r4.data.answer || r4.data.message || r4.data.result);
            if (a4 && a4.toString().trim().length > 10) {
                result = a4.toString().trim();
                console.log('[CODEAI] API 4 OK ✅');
            }
        } catch (e4) {
            console.warn('[CODEAI] API 4 échouée :', e4.message);
        }
    }

    // ============================
    // RÉSULTAT FINAL
    // ============================

    if (!result) {
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        return await sock.sendMessage(chatId, {
            text: '❌ *L\'IA Code est temporairement indisponible.*\n_Toutes les API sont surchargées, réessaie dans un instant._\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    var maxLen = 3800;
    var text = result.length > maxLen
        ? result.substring(0, maxLen) + '\n\n⚠️ _[Code tronqué car trop long pour WhatsApp]_'
        : result;

    await sock.sendMessage(chatId, {
        text: '💻 *Code pour :* _' + prompt + '_\n\n' + text + '\n\n> BRINDI-XMD'
    }, { quoted: message });

    await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
}

module.exports = codeaiCommand;
