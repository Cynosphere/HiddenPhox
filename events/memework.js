/*let guildMemberAdd = function(guild, user, ctx) {
    if (guild.id == "295341979800436736") {
        if (user.bot) return;

        ctx.bot.getDMChannel(user.id).then(c => {
            c.createMessage(
                `Hello and welcome to Memework\u2122, <@${user.id}>.

            Before we can grant you membership and access to other channels, we must ask a few questions:
             - Who you are? (do you have any project that people know you for or something)
             - What do you do? (programming, chilling, memes, nothing?)
             - Where you came from? (who referred you to the server/gave the invite, etc)

            Please post your answers in <#334761004548358154> and a moderator or higher will check and then decide. This can take some time.

            Note: The acceptance is done at our discretion and does not guarantee 100% acceptance. If you are denied, you will be kicked.
            Please do not try to be persistent and keep joining back. Doing so will lead to a ban.`
            ).catch(e => {
                guild.channels
                    .get("303294535771881473")
                    .createMessage(
                        `**New user <@${user.id}> \`(${user.username}#${user.discriminator}, ${user.id})\` does not have DMs enabled.**\n\nPlease use \`hf!mwwelcome\` in recruits.`
                    );
            });
        });
    }
};

module.exports = [
    {
        event: "guildMemberAdd",
        name: "MWJoinMsg",
        func: guildMemberAdd
    }
];*/
