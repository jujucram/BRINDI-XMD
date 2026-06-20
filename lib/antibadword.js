const { setAntiBadword, getAntiBadword, removeAntiBadword, incrementWarningCount, resetWarningCount } = require('../lib/index');

// Placé en dehors pour éviter de recréer le tableau à chaque message reçu
const badWords = [
    // Anglais
    'gandu', 'madarchod', 'bhosdike', 'bsdk', 'fucker', 'bhosda',
    'lauda', 'laude', 'betichod', 'chutiya', 'maa ki chut', 'behenchod',
    'behen ki chut', 'randi', 'chuchi', 'boobs', 'boobies', 'tits',
    'nigga', 'fuck', 'dick', 'bitch', 'bastard', 'asshole',
    'teri ma ki chut', 'teri maa ki', 'lund', 'lund ke baal', 'lodu', 'benchod',
    'shit', 'piss', 'crap', 'slut', 'whore', 'prick',
    'motherfucker', 'cock', 'cunt', 'pussy', 'twat', 'wanker',
    'douchebag', 'jackass', 'moron', 'retard', 'scumbag', 'skank',
    'slutty', 'arse', 'bugger', 'chut', 'madar', 'behen ke lode', 'chodne', 
    'sala kutta', 'harami', 'randi ki aulad', 'gaand mara', 'chodu', 'gandu saala',
    'kameena', 'haramzada', 'chudai', 'fck', 'fckr', 'fuk', 'fukk', 'fcuk', 'btch',
    'spic', 'chink', 'towelhead', 'gook', 'kike', 'paki', 'wetback', 'raghead', 'beaner',
    'blowjob', 'handjob', 'cum', 'cumshot', 'jizz', 'deepthroat', 'hentai', 'anal', 
    'orgasm', 'dildo', 'vibrator', 'gangbang', 'threesome', 'porn', 'xxx',
    'fag', 'faggot', 'dyke', 'tranny', 'homo', 'sissy', 'fairy', 'lesbo',
    'weed', 'heroin', 'meth', 'crack', 'dope', 'kush',

    // Français
    'putain', 'merde', 'connard', 'connasse', 'salaud', 'salope',
    'enculé', 'encule', 'fdp', 'fils de pute', 'va te faire foutre',
    'ferme ta gueule', 'ta gueule', 'tg', 'ntm', 'ta mère',
    'nique ta mère', 'nique ta race', 'va niquer', 'nique',
    'pd', 'pédé', 'con', 'conne', 'gros con', 'abruti', 'abrutie',
    'débile', 'mongol', 'mongole', 'attardé', 'attardée',
    'crétin', 'crétine', 'imbécile', 'bordel', 'câlisse',
    'ostie', 'crisse', 'tabarnak', 'bite', 'queue',
    'vagin', 'chatte', 'couilles', 'nichons', 'baiser',
    'sodomie', 'fellation', 'branlette', 'branler',
    'niquer', 'niquez', 'baise moi', 'espèce de con',
    'sale noir', 'sale blanc', 'sale arabe', 'raciste',
    'va mourir', 'je vais te tuer', 'je te nique',

    // Camerounais / argot local
    'ngombé', 'mvondo', 'bâtard', 'feymann', 'feymania', 'mboutoukou', 'bolo',
    'mvouté', 'douk douk', 'tchèpe', 'go facile', 'nkoa',
    'sale bamileke', 'sale beti', 'sale bassa', 'tchiroma', 'waka', 'mbombo',
    'on va se voir', 'je vais te chercher', 'fils de chien', 'fils de salope',
    'ya folle', 'ta maman', 'ta famille', 'nganga', 'djoss ta mère',
];

async function handleAntiBadwordCommand(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `*ANTIBADWORD*\n\n*.antibadword on* — Activer\n*.antibadword off* — Désactiver\n*.antibadword set delete/kick/warn* — Choisir l'action\n\n> BRINDI-XMD`
        }, { quoted: message });
    }

    let existingConfig = null;
    try {
        existingConfig = await getAntiBadword(chatId, 'on');
    } catch (e) {
        // On ignore l'erreur si aucune configuration n'existe
    }

    if (match === 'on') {
        if (existingConfig?.enabled) {
            return sock.sendMessage(chatId, { text: `❌ Antibadword déjà activé.\n\n> BRINDI-XMD` }, { quoted: message });
        }
        await setAntiBadword(chatId, 'on', 'delete');
        return sock.sendMessage(chatId, { text: `✅ Antibadword activé. Action par défaut : *delete*\n\n> BRINDI-XMD` }, { quoted: message });
    }

    if (match === 'off') {
        if (!existingConfig?.enabled) {
            return sock.sendMessage(chatId, { text: `❌ Antibadword déjà désactivé.\n\n> BRINDI-XMD` }, { quoted: message });
        }
        await removeAntiBadword(chatId, 'on');
        return sock.sendMessage(chatId, { text: `✅ Antibadword désactivé.\n\n> BRINDI-XMD` }, { quoted: message });
    }

    if (match.startsWith('set')) {
        const action = match.split(' ')[1];
        if (!action || !['delete', 'kick', 'warn'].includes(action)) {
            return sock.sendMessage(chatId, { text: `❌ Action invalide. Choisis : delete, kick ou warn\n\n> BRINDI-XMD` }, { quoted: message });
        }
        await setAntiBadword(chatId, 'on', action);
        return sock.sendMessage(chatId, { text: `✅ Action antibadword : *${action}*\n\n> BRINDI-XMD` }, { quoted: message });
    }

    return sock.sendMessage(chatId, { text: `❌ Commande invalide. Tape *.antibadword* pour l'aide.\n\n> BRINDI-XMD` }, { quoted: message });
}

async function handleBadwordDetection(sock, chatId, message, userMessage, senderId) {
    if (!chatId.endsWith('@g.us') || message.key.fromMe) return;

    let antiBadwordConfig = null;
    try {
        antiBadwordConfig = await getAntiBadword(chatId, 'on');
    } catch (e) {
        // Bloque le spam en console si getAntiBadword rejette une erreur ou n'existe pas
        return;
    }
    
    if (!antiBadwordConfig || !antiBadwordConfig?.enabled) return;

    const cleanMessage = (userMessage || '').toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!cleanMessage) return;

    let containsBadWord = false;
    const messageWords = cleanMessage.split(' ');

    for (const badWord of badWords) {
        if (badWord.includes(' ')) {
            if (cleanMessage.includes(badWord)) {
                containsBadWord = true;
                break;
            }
        } else {
            if (messageWords.includes(badWord)) {
                containsBadWord = true;
                break;
            }
        }
    }

    if (!containsBadWord) return;

    const groupMetadata = await sock.groupMetadata(chatId);
    const botNum = (sock.user?.id || '').split('@')[0].split(':')[0];
    const botParticipant = groupMetadata.participants.find(p => p.id.split('@')[0].split(':')[0] === botNum);

    if (!botParticipant?.admin) return;

    const senderNum = senderId.split('@')[0].split(':')[0];
    const senderParticipant = groupMetadata.participants.find(p => p.id.split('@')[0].split(':')[0] === senderNum);

    if (senderParticipant?.admin) return;

    try {
        await sock.sendMessage(chatId, { delete: message.key });
    } catch (err) {
        console.error('[ANTIBADWORD] Suppression échouée:', err.message);
        return;
    }

    const action = antiBadwordConfig.action || 'delete';
    const senderTag = `@${senderNum}`;

    if (action === 'delete') {
        await sock.sendMessage(chatId, {
            text: `⚠️ *${senderTag}*, les gros mots sont interdits !\n\n> BRINDI-XMD`,
            mentions: [senderId]
        });
    } else if (action === 'kick') {
        try {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            await sock.sendMessage(chatId, {
                text: `🚫 *${senderTag}* exclu pour gros mot.\n\n> BRINDI-XMD`,
                mentions: [senderId]
            });
        } catch (error) {
            console.error('[ANTIBADWORD] Kick échoué:', error.message);
        }
    } else if (action === 'warn') {
        const warningCount = await incrementWarningCount(chatId, senderId);
        if (warningCount >= 3) {
            try {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                await resetWarningCount(chatId, senderId);
                await sock.sendMessage(chatId, {
                    text: `🚫 *${senderTag}* exclu après 3 avertissements.\n\n> BRINDI-XMD`,
                    mentions: [senderId]
                });
            } catch (error) {
                console.error('[ANTIBADWORD] Kick après warnings échoué:', error.message);
            }
        } else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *${senderTag}*, gros mot détecté !\nAvertissement *${warningCount}/3*\n\n> BRINDI-XMD`,
                mentions: [senderId]
            });
        }
    }
}

module.exports = { handleAntiBadwordCommand, handleBadwordDetection };
