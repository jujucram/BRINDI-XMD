// totalmembers.js — ITACHI-XMD-V2
async function totalmembersCommand(sock, chatId, message) {
    // Fonctionne en groupe seulement
    if (!chatId.endsWith('@g.us')) {
        return sock.sendMessage(chatId, { text: '❌ Cette commande fonctionne uniquement dans un groupe.' }, { quoted: message });
    }

    try {
        const metadata = await sock.groupMetadata(chatId);
        const members = metadata.participants || [];
        const admins = members.filter(m => m.admin === 'admin' || m.admin === 'superadmin');
        const superAdmins = members.filter(m => m.admin === 'superadmin');
        const regular = members.filter(m => !m.admin);

        await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `👥 *TOTAL MEMBRES — BRINDI-XMD*\n\n🏷️ Groupe : ${metadata.subject}\n\n━━━━━━━━━━━━━━━━━━\n👥 Total membres : *${members.length}*\n👑 Super Admin : *${superAdmins.length}*\n🛡️ Admins : *${admins.length}*\n👤 Membres : *${regular.length}*\n━━━━━━━━━━━━━━━━━━\n\n> 🥷 Brandon`
        }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ Erreur: ${e.message}` }, { quoted: message });
    }
}
module.exports = totalmembersCommand;
