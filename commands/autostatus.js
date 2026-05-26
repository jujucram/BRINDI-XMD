const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store auto status configuration
const configPath = path.join(__dirname, '../data/autoStatus.json');

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ 
        activé: false, 
        reactOn: false 
    }));
}

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Cette commande est réservée au propriétaire !*\n> BRINDI-XMD',
            });
            return;
        }

        // Read current config
        let config = JSON.parse(fs.readFileSync(configPath));

        // If no arguments, show current status
        if (!args || args.length === 0) {
            const status = config.activé ? '🟢 Activé' : '🔴 Désactivé';
            const reactStatus = config.reactOn ? '🟢 Activé' : '🔴 Désactivé';
            await sock.sendMessage(chatId, { 
                text: `📊 *Configuration Auto Status*\n\n• Auto Status View : ${status}\n• Status Reactions : ${reactStatus}\n\n📌 *Commandes :*\n• .autostatus on\n• .autostatus off\n• .autostatus react on\n• .autostatus react off\n> BRINDI-XMD`,
            });
            return;
        }

        // Handle on/off commands
        const command = args[0].toLowerCase();
        
        if (command === 'on') {
            config.activé = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '📱 *Auto Status View :* 🟢 Activé\n_Le bot va maintenant visionner automatiquement les statuts._\n> BRINDI-XMD',
            });
        } else if (command === 'off') {
            config.activé = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '📱 *Auto Status View :* 🔴 Désactivé\n> BRINDI-XMD',
            });
        } else if (command === 'react') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: '❌ *Veuillez spécifier on ou off.*\nUsage : .autostatus react on/off\n> BRINDI-XMD',
                });
                return;
            }
            
            const reactCommand = args[1].toLowerCase();
            if (reactCommand === 'on') {
                config.reactOn = true;
                fs.writeFileSync(configPath, JSON.stringify(config));
                await sock.sendMessage(chatId, { 
                    text: '💫 *Status Reactions :* 🟢 Activé\n_Le bot va maintenant réagir aux statuts._\n> BRINDI-XMD',
                });
            } else if (reactCommand === 'off') {
                config.reactOn = false;
                fs.writeFileSync(configPath, JSON.stringify(config));
                await sock.sendMessage(chatId, { 
                    text: '💫 *Status Reactions :* 🔴 Désactivé\n> BRINDI-XMD',
                });
            } else {
                await sock.sendMessage(chatId, { 
                    text: '❌ *Option invalide !* Utilisez : .autostatus react on/off\n> BRINDI-XMD',
                });
            }
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ *Commande invalide !*\nUsage :\n• .autostatus on/off\n• .autostatus react on/off\n> BRINDI-XMD',
            });
        }

    } catch (error) {
        console.error('Error in autostatus command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ *Erreur lors du traitement de la commande !*\n> BRINDI-XMD',
        });
    }
}

// Function to check if auto status is activé
function isAutoStatusEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.activé;
    } catch (error) {
        console.error('Error checking auto status config:', error);
        return false;
    }
}

// Function to check if status reactions are activé
function isStatusReactionEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.reactOn;
    } catch (error) {
        console.error('Error checking status reaction config:', error);
        return false;
    }
}

// Function to react to status using proper method
async function reactToStatus(sock, statusKey) {
    try {
        if (!isStatusReactionEnabled()) {
            return;
        }

        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: '💚'
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
    } catch (error) {
        console.error('❌ Error reacting to status:', error.message);
    }
}

// Function to handle status updates
async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled()) {
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    await sock.readMessages([msg.key]);
                    await reactToStatus(sock, msg.key);
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await sock.readMessages([msg.key]);
                    } else {
                        throw err;
                    }
                }
                return;
            }
        }

        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.key]);
                await reactToStatus(sock, status.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

        if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.reaction.key]);
                await reactToStatus(sock, status.reaction.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.reaction.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

    } catch (error) {
        console.error('❌ Error in auto status view:', error.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate
};
