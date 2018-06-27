let messageCreate = async function(msg, ctx) {
    if (!msg) return;
    if (!msg.channel.guild) return;
    if (msg.author.bot) return;

    let wallet = await ctx.db.models.econ.findOne({
        where: { id: msg.author.id }
    });
    if (wallet) {
        if (Math.random() < 0.03) {
            let amount = Math.floor(Math.random() * 5) + 1;

            ctx.db.models.econ.update(
                { currency: wallet.currency + amount },
                { where: { id: msg.author.id } }
            );
            ctx.utils.logInfo(
                ctx,
                `[ECON] Gave ${msg.author.username}#${
                    msg.author.discriminator
                } ${amount}FC.`
            );
            if (
                msg.channel
                    .permissionsOf(ctx.bot.user.id)
                    .has("addReactions") &&
                wallet.noreact === false
            )
                msg.addReaction("\uD83D\uDCB8");
        }
    }
};

let pointRegen = async function(ctx) {
    let list = await ctx.db.models.econ.findAll();

    let now = new Date().getTime();

    list.forEach(a => {
        if (a.dataValues.cd_regen < now && a.dataValues.points == 0) {
            ctx.utils.logInfo(
                ctx,
                "[ECON] Resetting points for " + a.dataValues.id
            );
            ctx.db.models.econ.update(
                { points: 3 },
                { where: { id: a.dataValues.id } }
            );
        }
    });
};

module.exports = [
    {
        event: "messageCreate",
        name: "economy",
        func: messageCreate
    },
    {
        event: "timer",
        name: "pointregen",
        interval: 5000,
        func: pointRegen
    }
];
