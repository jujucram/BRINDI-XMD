const { setAntitag, getAntitag, removeAntitag } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

async function handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const usage = `📊 *Configuration Antitag :*\n\n• ${prefix}antitag on\n• ${prefix}antitag off\n• ${prefix}antitag set delete\n• ${prefix}antitag set kick\n• ${prefix}antitag get\n> BRINDI-XMD`;
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntitag(chatId, 'on');
                if (existingConfig?.activé) {
                    await sock.sendMessage(chatId, { text: '⚠️ *L\'Antitag est déjà activé !*\n> BRINDI-XMD' }, { quoted: message });
                    return;
                }
                const result = await setAntitag(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? '🛡️ *Antitag :* 🟢 Activé\n> BRINDI-XMD' : '❌ *Échec de l\'activation de l\'Antitag.*\n> BRINDI-XMD' 
                }, { quoted: message });
                break;

            case 'off':
                await removeAntitag(chatId, 'on');
                await sock.sendMessage(chatId, { text: '🛡️ *Antitag :* 🔴 Désactivé\n> BRINDI-XMD' }, { quoted: message });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `❌ *Veuillez spécifier une action :* ${prefix}antitag set delete | kick\n> BRINDI-XMD` 
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick'].includes(setAction)) {
                    await sock.sendMessage(chatId, { 
                        text: '❌ *Action invalide !* Choisissez entre : delete | kick\n> BRINDI-XMD' 
                    }, { quoted: message });
                    return;
                }
                const setResult = await setAntitag(chatId, 'on', setAction);
                await sock.sendMessage(chatId, { 
                    text: setResult ? `✅ *Action antitag définie sur :* ${setAction}\n> BRINDI-XMD` : '❌ *Échec de la configuration de l\'action.*\n> BRINDI-XMD' 
                }, { quoted: message });
                break;

            case 'get':
                const status = await getAntitag(chatId, 'on');
                const actionConfig = await getAntitag(chatId, 'on');
                await sock.sendMessage(chatId, { 
                    text: `📊 *Configuration Antitag :*\n\n• Statut : ${status ? '🟢 Activé' : '🔴 Désactivé'}\n• Action : ${actionConfig ? actionConfig.action : 'Non définie'}\n> BRINDI-XMD` 
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, { text: `❌ *Commande inconnue.* Utilisez ${prefix}antitag pour voir les options.\n> BRINDI-XMD` }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in antitag command:', error);
        await sock.sendMessage(chatId, { text: '❌ *Erreur lors du traitement de la commande.*' }, { quoted: message });
    }
}

async function handleTagDetection(sock, chatId, message, senderId) {
    try {
        const antitagSetting = await getAntitag(chatId, 'on');
        if (!antitagSetting || !antitagSetting.activé) return;

        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        const messageText = (
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            ''
        );

        const textMentions = messageText.match(/@[\d+\s\-()~.]+/g) || [];
        const numericMentions = messageText.match(/@\d{10,}/g) || [];
        
        const uniqueNumericMentions = new Set();
        numericMentions.forEach(mention => {
            const numMatch = mention.match(/@(\d+)/);
            if (numMatch) uniqueNumericMentions.add(numMatch[1]);
        });
        
        const mentionedJidCount = mentionedJids.length;
        const numericMentionCount = uniqueNumericMentions.size;
        const totalMentions = Math.max(mentionedJidCount, numericMentionCount);

        if (totalMentions >= 3) {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            const mentionThreshold = Math.ceil(participants.length * 0.5);
            
            const hasManyNumericMentions = numericMentionCount >= 10 || 
                                          (numericMentionCount >= 5 && numericMentionCount >= mentionThreshold);
            
            if (totalMentions >= mentionThreshold || hasManyNumericMentions) {
                const action = antitagSetting.action || 'delete';
                
                if (action === 'delete') {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });
                    
                    await sock.sendMessage(chatId, {
                        text: '⚠️ *Tagall détecté ! Message supprimé automatiquement.*\n> BRINDI-XMD'
                    }, { quoted: message });
                    
                } else if (action === 'kick') {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });

                    await sock.groupParticipantsUpdate(chatId, [senderId], "remove");

                    await sock.sendMessage(chatId, {
                        text: `🚫 *Antitag détecté !*\n\n@${senderId.split('@')[0]} a été banni pour avoir tagué tous les membres du groupe.\n> BRINDI-XMD`,
                        mentions: [senderId]
                    }, { quoted: message });
                }
            }
        }
    } catch (error) {
        console.error('Error in tag detection:', error);
    }
}

module.exports = {
    handleAntitagCommand,
    handleTagDetection
};
