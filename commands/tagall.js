async function tagAllCommand(sock, chatId, senderId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Uniquement dans les groupes !*\n> BRINDI-XMD`,
            }, { quoted: message });
        }

        const groupMeta = await sock.groupMetadata(chatId);
        const participants = groupMeta.participants;

        if (!participants || participants.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Aucun membre trouvé.*\n> BRINDI-XMD`,
                
            });
        }

        const groupName = groupMeta.subject || 'Groupe';
        const mentions = participants.map(p => p.id);
        const admins = participants.filter(p => p.admin).length;
        const members = participants.length - admins;
        const total = participants.length;

        // Construire la liste des membres
        let memberList = '';
        participants.forEach((p, i) => {
            const role = p.admin === 'superadmin' ? '👑' : p.admin === 'admin' ? '⭐' : '👤';
            memberList += `│ ${role} @${p.id.split('@')[0]}\n`;
        });

        const caption = `📢 *TAG ALL*

『 *${groupName}* 』

│ 👥 *Total   :* ${total} membres
│ 👑 *Admins  :* ${admins}
│ 👤 *Membres :* ${members}

🔔 *Membres tagués :*
${memberList}
> BRINDI-XMD`;

        await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption,
            mentions,
            
        }, { quoted: message });

    } catch (e) {
        console.error('❌ [tagall]', e.message);
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur lors du tagall.*\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }
}

module.exports = tagAllCommand;
