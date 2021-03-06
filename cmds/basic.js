async function help(ctx, msg, args) {
    const sorted = {};
    for (const cmd of ctx.cmds.values()) {
        if (sorted[cmd.group.toLowerCase()] === undefined) {
            sorted[cmd.group.toLowerCase()] = [];
        }
        sorted[cmd.group.toLowerCase()].push(cmd);
    }

    if (args) {
        if (args.startsWith("--")) {
            const category = args
                .replace("--", "")
                .toLowerCase()
                .trim();

            if (sorted[category]) {
                const embed = {
                    embed: {
                        title: `HiddenPhox Help: Category > ${category
                            .toUpperCase()
                            .charAt(0) + category.toLowerCase().slice(1)}`,
                        color: ctx.utils.topColor(
                            ctx,
                            msg,
                            ctx.bot.user.id,
                            0x8060c0
                        ),
                        fields: []
                    }
                };
                for (const cmd of sorted[category]) {
                    embed.embed.fields.push({
                        name: `${ctx.prefix}${cmd.name}`,
                        value: cmd.desc,
                        inline: true
                    });
                }
                msg.channel.createMessage(embed);
            } else {
                msg.channel.createMessage("Category not found.");
            }
        } else {
            if (
                ctx.cmds.filter(
                    c =>
                        c.name == args ||
                        (c.aliases && c.aliases.includes(args))
                ).length > 0
            ) {
                const cmd = ctx.cmds.filter(
                    c =>
                        c.name == args ||
                        (c.aliases && c.aliases.includes(args))
                )[0];
                const embed = {
                    title: `HiddenPhox Help: Command > \`${ctx.prefix}${cmd.name}\``,
                    color: ctx.utils.topColor(
                        ctx,
                        msg,
                        ctx.bot.user.id,
                        0x8060c0
                    ),
                    description: cmd.desc || "No description.",
                    fields: [
                        { name: "Category", value: cmd.group, inline: true }
                    ]
                };

                if (cmd.fulldesc) {
                    embed.fields.push({
                        name: "Full Description",
                        value: cmd.fulldesc
                    });
                }
                if (cmd.usage) {
                    embed.fields.push({
                        name: "Usage",
                        value: `${ctx.prefix}${cmd.name} ${cmd.usage}`,
                        inline: true
                    });
                }
                if (cmd.aliases) {
                    embed.fields.push({
                        name: "Aliases",
                        value: cmd.aliases.join(", "),
                        inline: true
                    });
                }
                msg.channel.createMessage({ embed: embed });
            } else {
                msg.channel.createMessage("Command not found.");
            }
        }
    } else {
        const embed = {
            embed: {
                title: "HiddenPhox Help",
                color: ctx.utils.topColor(ctx, msg, ctx.bot.user.id, 0x8060c0),
                fields: []
            }
        };
        for (const x in sorted) {
            embed.embed.fields.push({
                name: x.toUpperCase().charAt(0) + x.toLowerCase().slice(1),
                value: `${sorted[x].length} Commands\n${
                    ctx.prefix
                }help --${x.toLowerCase()}`,
                inline: true
            });
        }
        msg.channel.createMessage(embed);
    }
}

function ping(ctx, msg, args) {
    msg.channel.createMessage("Pong.").then(m => {
        m.edit(
            `Pong. RTT: \`${Math.floor(
                m.timestamp - msg.timestamp
            )}ms\`, Gateway: \`${
                ctx.bot.shards.get(
                    ctx.bot.guildShardMap[
                        ctx.bot.channelGuildMap[msg.channel.id]
                    ] || 0
                ).latency
            }ms\``
        );
    });
}

function stats(ctx, msg, args) {
    msg.channel.createMessage({
        embed: {
            title: `${ctx.bot.user.username} Stats`,
            fields: [
                { name: "Servers", value: ctx.bot.guilds.size, inline: true },
                {
                    name: "Channels",
                    value: ctx.bot.guilds
                        .map(g => g.channels.size)
                        .reduce((a, b) => {
                            return a + b;
                        }),
                    inline: true
                },
                { name: "Commands", value: ctx.cmds.size, inline: true },
                { name: "Users Seen", value: ctx.bot.users.size, inline: true },
                {
                    name: "Humans",
                    value: ctx.bot.users.filter(u => !u.bot).length,
                    inline: true
                },
                {
                    name: "Bots",
                    value: ctx.bot.users.filter(u => u.bot).length,
                    inline: true
                },
                {
                    name: "Uptime",
                    value: ctx.utils.formatTime(ctx.bot.uptime),
                    inline: true
                }
            ],
            color: 0x50596d
        }
    });
}

function invite(ctx, msg, args) {
    msg.channel.createMessage(
        `<https://discordapp.com/oauth2/authorize?client_id=${ctx.clientid}&scope=bot>`
    );
}

// To anyone who actually forks my bot for their own use
// For the love of god
// LEAVE THIS ALONE, thanks
let info = function(ctx, msg, args) {
    let erisv = require("eris/package.json").version;

    let u = ctx.bot.users;

    const contributors = [
        {
            id: "132297363233570816",
            name: "Brianna",
            contribs: "Ex-host, Contributor"
        },
        {
            id: "151344471957569536",
            name: "Sammy",
            contribs: "Host, Co-developer"
        },
        {
            id: "123601647258697730",
            name: "Jane",
            contribs: "Contributor"
        },
        {
            id: "162819866682851329",
            name: "Luna",
            contribs: "Contributor"
        },
        {
            id: "426425345420296192",
            name: "Ave",
            contribs: "Ex-host, Contributor"
        },
        {
            id: "107827535479353344",
            name: "homonovus",
            contribs: "Ex-host"
        }
    ];

    const contributorPrettyText = contributors
        .map(({ id, name, contribs }) => {
            const user = u.get(id);
            return `**${user.username}#${user.discriminator}** (${name}) - ${contribs}`;
        })
        .join("\n");

    const owner = u.get("150745989836308480");

    msg.channel.createMessage({
        embed: {
            title: "HiddenPhox, a general use and utility bot",
            description: `Written by **Cynthia Foxwell** \`${owner.username}#${owner.discriminator}\`.`,
            color: 0x50596d,
            fields: [
                { name: "Language", value: "JavaScript", inline: true },
                { name: "Library", value: `Eris v${erisv}`, inline: true },
                {
                    name: "Node.js Version",
                    value: process.version,
                    inline: true
                },
                {
                    name: "Contributors",
                    value: `${contributorPrettyText}
**elixi.re** (formerly Memework\u2122) - Ideas, general help, bugfixes.`
                },
                {
                    name: "Honorable Mentions",
                    value: `**oplexz** - Running support in the past
**Discord Bots** - A once great community that had great people who helped once in a while and gave ideas`
                },
                {
                    name: "Links",
                    value: "[Source](https://gitlab.com/Cynosphere/HiddenPhox)"
                }
            ]
        }
    });
};

module.exports = [
    {
        name: "ping",
        desc: "Pong",
        fulldesc: "Measure response times to Discord.",
        func: ping,
        group: "general",
        aliases: ["p"]
    },
    {
        name: "stats",
        desc: "Displays bot stats",
        fulldesc: `
Give bot statistics such as amount of servers,
channels, users, etc.
        `,
        func: stats,
        group: "general"
    },
    {
        name: "invite",
        desc: "Get bot invite.",
        func: invite,
        group: "general",
        aliases: ["inv"]
    },
    {
        name: "help",
        desc: "Lists commands",
        func: help,
        usage: "[command]",
        group: "general"
    },
    {
        name: "about",
        desc: "Displays in depth bot info and credits.",
        func: info,
        group: "general",
        aliases: ["info"]
    }
];
