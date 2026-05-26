const settings = require('../settings');
const { isSudo } = require('./index');

async function isOwnerOrSudo(senderId) {

    try {

        // Nettoie owner
        const ownerNumber =
            (settings.ownerNumber || '')
                .split(':')[0]
                .split('@')[0]
                .trim();

        // Nettoie sender
        const senderNumber =
            (senderId || '')
                .split(':')[0]
                .split('@')[0]
                .trim();

        // Vérifie owner
        if (senderNumber === ownerNumber) {
            return true;
        }

        // Vérifie sudo
        const sudo =
            await isSudo(senderId);

        return sudo;

    } catch (err) {

        console.error(
            '❌ Error in isOwnerOrSudo:',
            err
        );

        return false;
    }
}

module.exports = isOwnerOrSudo;