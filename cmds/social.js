let profile = async function(ctx, msg, args) {
    if (!msg.channel.guild) {
        msg.channel.createMessage("Can only be used in guilds.");
        return;
    }

    ctx.utils.lookupUser(ctx, msg, args || msg.author.id).then(async u => {
        if (!msg.channel.guild.members.get(u.id)) {
            msg.channel.createMessage("User not in guild.");
            return;
        }
        u = msg.channel.guild.members.get(u.id);
        /*let snowflake = parseInt(u.id).toString(2);
        snowflake = "0".repeat(64 - snowflake.length) + snowflake;
        let date = snowflake.substr(0, 42);
        let createdAt = parseInt(date, 2) + 1420070400000;*/

        let e = {
            color: ctx.utils.pastelize(u.username),
            title: `Profile Card: \`${u.username}#${u.discriminator}\` ${
                u.bot ? "<:boat:546212361472835584>" : ""
            }`,
            fields: [
                {
                    name: "Nickname",
                    value: u.nick ? u.nick : "None",
                    inline: true
                },
                {
                    name: "Account Age",
                    value: ctx.utils.toReadableTime(Date.now() - u.createdAt),
                    inline: true
                }
            ],
            thumbnail: {
                url:
                    u.avatar !== null
                        ? `https://cdn.discordapp.com/avatars/${u.id}/${
                              u.avatar
                          }.${
                              u.avatar.startsWith("a_") ? "gif" : "png?size=256"
                          }`
                        : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                              5}.png`
            }
        };

        let edata = await ctx.db.models.econ.findOne({
            where: { id: u.id }
        });

        let gdata = await ctx.db.models.econ.findAll();
        let ldata = gdata.filter(x => msg.channel.guild.members.get(x.id));
        let ranks = [];
        let lranks = [];

        for (const d of gdata.values()) {
            ranks.push({ id: d.dataValues.id, amt: d.dataValues.currency });
        }
        for (const d of ldata.values()) {
            lranks.push({ id: d.dataValues.id, amt: d.dataValues.currency });
        }

        ranks.sort((a, b) => b.amt - a.amt);
        lranks.sort((a, b) => b.amt - a.amt);

        let rank = ranks.findIndex(x => x.id === u.id) + 1;
        let lrank = lranks.findIndex(x => x.id === u.id) + 1;

        if (edata) {
            stealPercent =
                ((edata.steals - edata.steal_succ) / edata.steals) * 100;

            e.fields.push({
                name: "Wallet",
                value: `${edata.currency}FC`,
                inline: true
            });
            e.fields.push({
                name: "Economy Ranking",
                value: `${rank}/${ranks.length} globally, ${lrank}/${lranks.length} locally.`,
                inline: true
            });
            e.fields.push({
                name: "Steal Stats",
                value: `${edata.steals} tries, ${edata.steal_succ} success (${(
                    100 - (isNaN(stealPercent) ? 100 : stealPercent)
                ).toFixed(3)}%)`
            });
        }

        msg.channel.createMessage({
            embed: e
        });
    });
};

module.exports = [
    {
        name: "profile",
        desc: "Less technical user info.",
        func: profile,
        group: "social"
    }
];
