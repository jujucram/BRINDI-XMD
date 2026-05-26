
const approvedUsers = new Map();

async function approveCommand(sock, chatId, senderId, mentionedJids, message, isOwner, isAdmin) {
    const from = chatId;
    if (!isAdmin && !isOwner) {
        return sock.sendMessage(from, { text: '❌ Admins seulement.' }, { quoted: message });
    }

    const target = mentionedJids?.[0] || message.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) {
        return sock.sendMessage(from, { text: '❌ Mentionne un utilisateur.\nEx: .approve @user' }, { quoted: message });
    }

    if (!approvedUsers.has(from)) approvedUsers.set(from, new Set());
    approvedUsers.get(from).add(target);

    const name = target.split('@')[0];
    await sock.sendMessage(from, {
        text: `✅ *APPROUVÉ*\n\n👤 @${name} est maintenant approuvé dans ce groupe.\n🛡️ Il sera ignoré par les systèmes de protection.\n\n> 🥷 Brandon`,
        mentions: [target]
    }, { quoted: message });
}

function isApproved(chatId, userId) {
    return approvedUsers.has(chatId) && approvedUsers.get(chatId).has(userId);
}

module.exports = { approveCommand, isApproved };
