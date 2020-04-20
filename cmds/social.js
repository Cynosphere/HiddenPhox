async function profile(ctx, msg, args) {
    if (!msg.channel.guild) {
        msg.channel.createMessage("Can only be used in guilds.");
        return;
    }

    let user = await ctx.utils.lookupUser(ctx, msg, args || msg.author.id);

    if (!user) {
        msg.channel.createMessage("User not found.");
        return;
    }

    if (!msg.channel.guild.members.get(user.id)) {
        msg.channel.createMessage("User not in guild.");
        return;
    }

    user = msg.channel.guild.members.get(user.id);

    const embed = {
        color: ctx.utils.pastelize(user.username),
        title: `Profile Card: \`${user.username}#${user.discriminator}\` ${
            user.bot ? "<:boat:546212361472835584>" : ""
        }`,
        fields: [
            {
                name: "Nickname",
                value: user.nick ? user.nick : "None",
                inline: true
            },
            {
                name: "Account Age",
                value: ctx.utils.toReadableTime(Date.now() - user.createdAt),
                inline: true
            }
        ],
        thumbnail: {
            url:
                user.avatar !== null
                    ? `https://cdn.discordapp.com/avatars/${user.id}/${
                          user.avatar
                      }.${
                          user.avatar.startsWith("a_") ? "gif" : "png?size=256"
                      }`
                    : `https://cdn.discordapp.com/embed/avatars/${user.discriminator %
                          5}.png`
        }
    };

    const edata = await ctx.db.models.econ.findOne({
        where: { id: user.id }
    });

    const gdata = await ctx.db.models.econ.findAll();
    const ldata = gdata.filter(x => msg.channel.guild.members.get(x.id));
    const ranks = [];
    const lranks = [];

    for (const d of gdata.values()) {
        ranks.push({ id: d.dataValues.id, amt: d.dataValues.currency });
    }
    for (const d of ldata.values()) {
        lranks.push({ id: d.dataValues.id, amt: d.dataValues.currency });
    }

    ranks.sort((a, b) => b.amt - a.amt);
    lranks.sort((a, b) => b.amt - a.amt);

    const rank = ranks.findIndex(x => x.id === user.id) + 1;
    const lrank = lranks.findIndex(x => x.id === user.id) + 1;

    if (edata) {
        stealPercent = ((edata.steals - edata.steal_succ) / edata.steals) * 100;

        embed.fields.push({
            name: "Wallet",
            value: `${edata.currency}FC`,
            inline: true
        });
        embed.fields.push({
            name: "Economy Ranking",
            value: `${rank}/${ranks.length} globally, ${lrank}/${lranks.length} locally.`,
            inline: true
        });
        embed.fields.push({
            name: "Steal Stats",
            value: `${edata.steals} tries, ${edata.steal_succ} success (${(
                100 - (isNaN(stealPercent) ? 100 : stealPercent)
            ).toFixed(3)}%)`
        });
    }

    msg.channel.createMessage({
        embed: embed
    });
}

module.exports = [
    {
        name: "profile",
        desc: "Less technical user info.",
        func: profile,
        group: "social"
    }
];
