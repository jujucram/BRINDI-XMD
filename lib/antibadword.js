const { setAntiBadword, getAntiBadword, removeAntiBadword, incrementWarningCount, resetWarningCount } = require('../lib/index');
const fs = require('fs');
const path = require('path');

// Load antibadword config
function loadAntibadwordConfig(groupId) {
    try {
        const configPath = path.join(__dirname, '../data/userGroupData.json');
        if (!fs.existsSync(configPath)) {
            return {};
        }
        const data = JSON.parse(fs.readFileSync(configPath));
        return data.antibadword?.[groupId] || {};
    } catch (error) {
        console.error('❌ Error loading antibadword config:', error.message);
        return {};
    }
}

async function handleAntiBadwordCommand(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `*ANTIBADWORD SETUP*\n\n*.antibadword on*\nTurn on antibadword\n\n*.antibadword set <action>*\nSet action: delete/kick/warn\n\n*.antibadword off*\nDisables antibadword in this group`
        }, { quoted: message });
    }

    if (match === 'on') {
        const existingConfig = await getAntiBadword(chatId, 'on');
        if (existingConfig?.enabled) {
            return sock.sendMessage(chatId, { text: '*AntiBadword is already enabled for this group*' });
        }
        await setAntiBadword(chatId, 'on', 'delete');
        return sock.sendMessage(chatId, { text: '*AntiBadword has been enabled. Use .antibadword set <action> to customize action*' }, { quoted: message });
    }

    if (match === 'off') {
        const config = await getAntiBadword(chatId, 'on');
        if (!config?.enabled) {
            return sock.sendMessage(chatId, { text: '*AntiBadword is already disabled for this group*' }, { quoted: message });
        }
        await removeAntiBadword(chatId, 'on');
        return sock.sendMessage(chatId, { text: '*AntiBadword has been disabled for this group*' }, { quoted: message });
    }

    if (match.startsWith('set')) {
        const action = match.split(' ')[1];
        if (!action || !['delete', 'kick', 'warn'].includes(action)) {
            return sock.sendMessage(chatId, { text: '*Invalid action. Choose: delete, kick, or warn*' }, { quoted: message });
        }
        await setAntiBadword(chatId, 'on', action);
        return sock.sendMessage(chatId, { text: `*AntiBadword action set to: ${action}*` }, { quoted: message });
    }

    return sock.sendMessage(chatId, { text: '*Invalid command. Use .antibadword to see usage*' }, { quoted: message });
}

async function handleBadwordDetection(sock, chatId, message, userMessage, senderId) {
    const config = loadAntibadwordConfig(chatId);
    if (!config.enabled) return;

    if (!chatId.endsWith('@g.us')) return;
    if (message.key.fromMe) return;

    const antiBadwordConfig = await getAntiBadword(chatId, 'on');
    if (!antiBadwordConfig?.enabled) return;

    const cleanMessage = userMessage.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const badWords = [
        // 🇬🇧 Anglais
        'gandu', 'madarchod', 'bhosdike', 'bsdk', 'fucker', 'bhosda',
        'lauda', 'laude', 'betichod', 'chutiya', 'maa ki chut', 'behenchod',
        'behen ki chut', 'randi', 'chuchi', 'boobs', 'boobies', 'tits',
        'nigga', 'fuck', 'dick', 'bitch', 'bastard', 'asshole',
        'teri ma ki chut', 'teri maa ki', 'lund', 'lund ke baal', 'lodu', 'benchod',
        'shit', 'piss', 'crap', 'slut', 'whore', 'prick',
        'motherfucker', 'cock', 'cunt', 'pussy', 'twat', 'wanker',
        'douchebag', 'jackass', 'moron', 'retard', 'scumbag', 'skank',
        'slutty', 'arse', 'bugger',
        'chut', 'madar', 'behen ke lode', 'chodne', 'sala kutta',
        'harami', 'randi ki aulad', 'gaand mara', 'chodu', 'gandu saala',
        'kameena', 'haramzada', 'chudai',
        'fck', 'fckr', 'fuk', 'fukk', 'fcuk', 'btch', 'f*ck', 'assclown',
        'f@ck', 'b!tch', 'd!ck', 'n!gga', 'f***er', 'a$$',
        'spic', 'chink', 'towelhead', 'gook', 'kike', 'paki',
        'wetback', 'raghead', 'beaner',
        'blowjob', 'handjob', 'cum', 'cumshot', 'jizz', 'deepthroat',
        'hentai', 'anal', 'orgasm', 'dildo', 'vibrator', 'gangbang',
        'threesome', 'porn', 'xxx',
        'fag', 'faggot', 'dyke', 'tranny', 'homo', 'sissy', 'fairy', 'lesbo',
        'weed', 'heroin', 'meth', 'crack', 'dope', 'kush',

        // 🇫🇷 Français
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

        // 🇨🇲 Camerounais / argot local
        'ngombé', 'mvondo', 'bâtard',
        'feymann', 'feymania', 'mboutoukou', 'bolo',
        'mvouté', 'douk douk',
        'tchèpe', 'go facile', 'nkoa',
        'sale bamileke', 'sale beti', 'sale bassa',
        'tchiroma', 'waka', 'mbombo',
        'on va se voir', 'je vais te chercher',
        'fils de chien', 'fils de salope',
        'ya folle', 'ta maman', 'ta famille',
        'nganga', 'djoss ta mère',
    ];

    const messageWords = cleanMessage.split(' ');
    let containsBadWord = false;

    for (const word of messageWords) {
        if (word.length < 2) continue;

        if (badWords.includes(word)) {
            containsBadWord = true;
            break;
        }

        for (const badWord of badWords) {
            if (badWord.includes(' ')) {
                if (cleanMessage.includes(badWord)) {
                    containsBadWord = true;
                    break;
                }
            }
        }
        if (containsBadWord) break;
    }

    if (!containsBadWord) return;

    // Vérifier si le bot est admin
    const groupMetadata = await sock.groupMetadata(chatId);
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = groupMetadata.participants.find(p => p.id === botId);
    if (!bot?.admin) return;

    // Ignorer les admins
    const participant = groupMetadata.participants.find(p => p.id === senderId);
    if (participant?.admin) return;

    // Supprimer le message
    try {
        await sock.sendMessage(chatId, { delete: message.key });
    } catch (err) {
        console.error('Error deleting message:', err);
        return;
    }

    // Action selon config
    switch (antiBadwordConfig.action) {
        case 'delete':
            await sock.sendMessage(chatId, {
                text: `⚠️ *@${senderId.split('@')[0]}*, les gros mots sont interdits ici !\n> BRINDI-XMD`,
                mentions: [senderId]
            });
            break;

        case 'kick':
            try {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                await sock.sendMessage(chatId, {
                    text: `🚫 *@${senderId.split('@')[0]}* a été exclu pour utilisation de gros mots.\n> BRINDI-XMD`,
                    mentions: [senderId]
                });
            } catch (error) {
                console.error('Error kicking user:', error);
            }
            break;

        case 'warn':
            const warningCount = await incrementWarningCount(chatId, senderId);
            if (warningCount >= 3) {
                try {
                    await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                    await resetWarningCount(chatId, senderId);
                    await sock.sendMessage(chatId, {
                        text: `🚫 *@${senderId.split('@')[0]}* a été exclu après 3 avertissements pour gros mots.\n> BRINDI-XMD`,
                        mentions: [senderId]
                    });
                } catch (error) {
                    console.error('Error kicking user after warnings:', error);
                }
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *@${senderId.split('@')[0]}*, gros mot détecté !\n*Avertissement ${warningCount}/3* — Au 3ème tu seras exclu.\n> BRINDI-XMD`,
                    mentions: [senderId]
                });
            }
            break;
    }
}

module.exports = {
    handleAntiBadwordCommand,
    handleBadwordDetection
};
