const axios = require('axios');

async function tiktokCommand(sock, chatId, args, message) {
    try {
        var url = args.join(' ').trim();

        if (!url || !url.includes('tiktok.com')) {
            return await sock.sendMessage(chatId, {
                text: '❌ Lien TikTok invalide.\n\n📌 Exemple :\n.tiktok https://vm.tiktok.com/XXXX\n\n> BRINDI-XMD'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        var encodedUrl = encodeURIComponent(url);
        var videoData = null;

        // ============================
        // API 1 : TikWM (avec headers anti-bot)
        // ============================
        try {
            console.log('[TIKTOK] API 1 - TikWM...');
            var r1 = await axios.get(
                'https://www.tikwm.com/api/?url=' + encodedUrl,
                {
                    timeout: 20000,
                    headers: {
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'referer': 'https://www.tikwm.com/',
                        'accept': 'application/json, text/plain, */*'
                    }
                }
            );
            if (r1.data && r1.data.code === 0 && r1.data.data && r1.data.data.play) {
                videoData = r1.data.data;
                console.log('[TIKTOK] API 1 OK ✅');
            }
        } catch (e1) {
            console.warn('[TIKTOK] API 1 échouée :', e1.message);
        }

        // ============================
        // API 2 : TikWM POST (contourne certains blocages)
        // ============================
        if (!videoData) {
            try {
                console.log('[TIKTOK] API 2 - TikWM POST...');
                var r2 = await axios.post(
                    'https://www.tikwm.com/api/',
                    'url=' + encodedUrl + '&hd=1',
                    {
                        timeout: 20000,
                        headers: {
                            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'content-type': 'application/x-www-form-urlencoded',
                            'referer': 'https://www.tikwm.com/'
                        }
                    }
                );
                if (r2.data && r2.data.code === 0 && r2.data.data && r2.data.data.play) {
                    videoData = r2.data.data;
                    console.log('[TIKTOK] API 2 OK ✅');
                }
            } catch (e2) {
                console.warn('[TIKTOK] API 2 échouée :', e2.message);
            }
        }

        // ============================
        // API 3 : Siputzx TikTok downloader
        // ============================
        if (!videoData) {
            try {
                console.log('[TIKTOK] API 3 - Siputzx...');
                var r3 = await axios.get(
                    'https://api.siputzx.my.id/api/d/tiktok?url=' + encodedUrl,
                    {
                        timeout: 20000,
                        headers: { 'user-agent': 'Mozilla/5.0' }
                    }
                );
                var d3 = r3.data && r3.data.data;
                if (d3 && (d3.play || d3.video || d3.videoUrl)) {
                    videoData = {
                        play: d3.play || d3.video || d3.videoUrl,
                        title: d3.title || d3.desc || 'Vidéo TikTok',
                        author: { nickname: d3.author || 'Inconnu', unique_id: d3.author || '' }
                    };
                    console.log('[TIKTOK] API 3 OK ✅');
                }
            } catch (e3) {
                console.warn('[TIKTOK] API 3 échouée :', e3.message);
            }
        }

        // ============================
        // API 4 : Ryzendesu TikTok
        // ============================
        if (!videoData) {
            try {
                console.log('[TIKTOK] API 4 - Ryzendesu...');
                var r4 = await axios.get(
                    'https://api.ryzendesu.vip/api/downloader/ttdl?url=' + encodedUrl,
                    {
                        timeout: 20000,
                        headers: { 'user-agent': 'Mozilla/5.0' }
                    }
                );
                var d4 = r4.data && r4.data.data;
                if (d4 && (d4.play || d4.video)) {
                    videoData = {
                        play: d4.play || d4.video,
                        title: d4.title || 'Vidéo TikTok',
                        author: { nickname: d4.author || 'Inconnu', unique_id: '' }
                    };
                    console.log('[TIKTOK] API 4 OK ✅');
                }
            } catch (e4) {
                console.warn('[TIKTOK] API 4 échouée :', e4.message);
            }
        }

        // ============================
        // RÉSULTAT FINAL
        // ============================

        if (!videoData || !videoData.play) {
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return await sock.sendMessage(chatId, {
                text: '❌ Impossible de récupérer la vidéo.\n_Vérifie que le lien est public et valide._\n\n> BRINDI-XMD'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        await sock.sendMessage(chatId, {
            video: { url: videoData.play },
            mimetype: 'video/mp4',
            caption: '🎵 *' + (videoData.title || 'Vidéo TikTok') + '*\n\n👤 *' + (videoData.author && videoData.author.nickname || 'Inconnu') + '*' + (videoData.author && videoData.author.unique_id ? ' (@' + videoData.author.unique_id + ')' : '') + '\n\n> BRINDI-XMD'
        }, { quoted: message });

    } catch (error) {
        console.error('[TIKTOK ERROR]', error.message);
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        await sock.sendMessage(chatId, {
            text: '❌ Erreur lors du téléchargement.\n\n> BRINDI-XMD'
        }, { quoted: message });
    }
}

module.exports = tiktokCommand;
