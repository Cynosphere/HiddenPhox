let help = async function(ctx, msg, args) {
    let groups = { unsorted: { name: "unsorted", cmds: [] } };
    ctx.cmds.forEach(c => {
        if (c.group && groups[c.group]) {
            groups[c.group].cmds.push(c);
        } else if (c.group && !groups[c.group]) {
            groups[c.group] = { name: c.group, cmds: [] };
            groups[c.group].cmds.push(c);
        } else if (!c.group) {
            groups["unsorted"].cmds.push(c);
        }
    });

    if (!args) {
        let _text = `__Commands for ${ctx.bot.user.username}__\n\`\`\`\n`;
        let text = _text;

        for (let i in groups) {
            let g = groups[i];

            if (g.cmds.length > 0 && g.name.toLowerCase() != "guild specific") {
                text =
                    text +
                    g.name.charAt(0).toUpperCase() +
                    g.name.slice(1) +
                    ":\n";
                g.cmds.forEach(c => {
                    text = text + "  " + c.name + " - " + c.desc + "\n";
                });
            }
        }

        msg.channel.createMessage(
            `${msg.author.mention}, Sending help via DM.`
        );
        ctx.client.getDMChannel(msg.author.id).then(c => {
            if (text.length > 2000 - _text.length - 3) {
                c.createMessage(
                    text.substr(0, 2000 - _text.length - 3) + "```"
                );
                c.createMessage(
                    "```" +
                        text.substr(2000 - _text.length - 3, text.legnth) +
                        "```"
                );
            } else {
                c.createMessage(text + "```");
            }
        });
    } else if (args == "guild") {
        let gcmds = ctx.cmds.filter(
            c =>
                c.guild &&
                msg.channel.guild &&
                c.guild.includes(msg.channel.guild.id)
        );

        if (gcmds && gcmds.length > 0) {
            let out = "";
            gcmds.forEach(c => {
                out += "  " + c.name + " - " + c.desc + "\n";
            });
            msg.channel.createMessage(
                `\`\`\`Guild specific commands:\n${out}\`\`\``
            );
        } else {
            msg.channel.createMessage("No guild specific commands found.");
        }
    } else {
        if (
            ctx.cmds.filter(
                c => c.name == args || (c.aliases && c.aliases.includes(args))
            ).length > 0
        ) {
            let c = ctx.cmds.filter(
                c => c.name == args || (c.aliases && c.aliases.includes(args))
            )[0];

            let analytics = await ctx.db.models.analytics.findOne({
                where: { id: 1 }
            });
            let usage = JSON.parse(analytics.dataValues.cmd_usage);

            let embed = {
                color: 0x4f586c,
                title: "Command info: " + c.name,
                fields: [
                    { name: "Description", value: c.desc, inline: true },
                    {
                        name: "Group",
                        value:
                            c.group.charAt(0).toUpperCase() + c.group.slice(1),
                        inline: true
                    },
                    {
                        name: "Usage",
                        value:
                            `${ctx.prefix}${c.name} ` +
                            (c.usage ? c.usage : ""),
                        inline: true
                    },
                    {
                        name: "Command Uses",
                        value: usage[c.name] || 0,
                        inline: true
                    }
                ]
            };

            if (c.aliases)
                embed.fields.push({
                    name: "Aliases",
                    value: c.aliases.join(", "),
                    inline: true
                });
            //embed.fields.push({name:"Full Description",value:c.fulldesc ? c.fulldesc : "None provided."});

            msg.channel.createMessage({ embed: embed });
        } else {
            let cat;
            for (let i in groups) {
                let g = groups[i];
                if (g.name.toLowerCase().indexOf(args.toLowerCase()) > -1) {
                    cat = g;
                }
            }

            if (cat.name.toLowerCase() == "guild specific") {
                msg.channel.createMessage("lol no.");
                return;
            }

            if (cat && cat.cmds.length > 0) {
                let out = "";
                cat.cmds.forEach(c => {
                    out += "  " + c.name + " - " + c.desc + "\n";
                });
                msg.channel.createMessage(
                    `\`\`\`Commands for category "${cat.name}":\n${out}\`\`\``
                );
            } else {
                msg.channel.createMessage("Command not found.");
            }
        }
    }
};

let ping = function(ctx, msg, args) {
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
};

let stats = function(ctx, msg, args) {
    let uptime = ctx.bot.uptime;
    let s = uptime / 1000;
    let d = parseInt(s / 86400);
    s = s % 86400;
    let h = parseInt(s / 3600);
    s = s % 3600;
    let m = parseInt(s / 60);
    s = s % 60;
    s = parseInt(s);

    let tstr =
        (d < 10 ? "0" + d : d) +
        ":" +
        (h < 10 ? "0" + h : h) +
        ":" +
        (m < 10 ? "0" + m : m) +
        ":" +
        (s < 10 ? "0" + s : s);

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
                { name: "Uptime", value: tstr, inline: true }
            ],
            color: 0x50596d
        }
    });
};

let invite = function(ctx, msg, args) {
    msg.channel.createMessage({
        embed: {
            description:
                "[Click here to invite](https://discordapp.com/oauth2/authorize?client_id=173441062243663872&scope=bot)\n\nNeed support? Have command ideas? Find a bug? [Join the support channel.](https://discord.gg/vW9fsgW)",
            color: 0x50596d
        }
    });
};

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
            contribs: "Contributor"
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
            id: "137584770145058817",
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
            return `**${user.username}#${
                user.discriminator
            }** (${name}) - ${contribs}`;
        })
        .join("\n");

    const owner = u.get("150745989836308480");

    msg.channel.createMessage({
        embed: {
            title: "HiddenPhox, a general use and utility bot",
            description: `Written by **Cynthia Foxwell** \`${owner.username}#${
                owner.discriminator
            }\`.`,
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
**Memework\u2122** - Ideas, general help, bugfixes.`
                },
                {
                    name: "Honorable Mentions",
                    value: `**oplexz** - Running support for FlexBot
**Discord Bots** - A once great community that had great people who helped once in a while and gave ideas`
                },
                {
                    name: "Links",
                    value: "[GitHub](https://github.com/Cynosphere/HiddenPhox)"
                }
            ]
        }
    });
};

module.exports = [
    {
        name: "ping",
        desc: "Pong",
        func: ping,
        group: "general",
        aliases: ["p"]
    },
    {
        name: "stats",
        desc: "Displays bot stats",
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
