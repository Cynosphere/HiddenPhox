let statusIcons = {
    online: "<:online:313956277808005120>",
    idle: "<:away:313956277220802560>",
    dnd: "<:dnd:313956276893646850>",
    offline: "<:offline:313956277237710868>"
};

let avatar = function(ctx, msg, args) {
    ctx.utils.lookupUser(ctx, msg, args ? args : msg.author.mention).then(u => {
        let av = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
            u.avatar.startsWith("a_") ? "gif?size=1024&_=.gif" : "png?size=1024"
        }`;
        msg.channel.createMessage({
            embed: {
                title: `Avatar for **${u.username}#${u.discriminator}**:`,
                image: { url: av }
            }
        });
    });
};

let cflake = function(ctx, msg, args) {
    if (!isNaN(parseInt(args))) {
        let snowflake = parseInt(args).toString(2);
        snowflake = "0".repeat(64 - snowflake.length) + snowflake;
        let date = snowflake.substr(0, 42);
        let timestamp = parseInt(date, 2) + 1420070400000;

        msg.channel.createMessage(
            `The timestamp for \`${args}\` is ${new Date(timestamp)}`
        );
    } else {
        msg.channel.createMessage("Arguments not a number.");
    }
};

let linvite = async function(ctx, msg, args) {
    let data = await ctx.libs.superagent
        .get(`https://discordapp.com/api/v7/invites/${args}?with_counts=1`)
        .set("User-Agent", "HiddenPhox (v9, Eris)")
        .set("Content-Type", "application/json")
        .set("Authorization", ctx.bot.token);
    let inv = data.body;

    if (inv.message && inv.message == "Unknown Invite") {
        msg.channel.createMessage("Invite provided is not valid.");
    } else if (inv.guild && inv.channel) {
        let edata = {
            title: `Invite Info: \`${inv.code}\``,
            fields: [
                {
                    name: "Guild",
                    value: `**${inv.guild.name}** (${inv.guild.id})`,
                    inline: true
                },
                {
                    name: "Channel",
                    value: `**#${inv.channel.name}** (${inv.channel.id})`,
                    inline: true
                },
                {
                    name: "Member Count",
                    value: `<:online:313956277808005120>${
                        inv.approximate_presence_count
                    } online\t\t<:offline:313956277237710868> ${
                        inv.approximate_member_count
                    } members`,
                    inline: false
                },
                {
                    name: "Flags",
                    value: `<:partner:314068430556758017>: ${
                        inv.guild.features.includes("VANITY_URL") ||
                        inv.guild.features.includes("INVITE_SPLASH") ||
                        inv.guild.features.includes("VIP_REGIONS")
                            ? "<:GreenTick:349381062176145408>"
                            : "<:RedTick:349381062054510604>"
                    }\t\t<:verified:439149164560121865>: ${
                        inv.guild.features.includes("VERIFIED")
                            ? "<:GreenTick:349381062176145408>"
                            : "<:RedTick:349381062054510604>"
                    }`,
                    inline: false
                }
            ],
            thumbnail: {
                url: `https://cdn.discordapp.com/icons/${inv.guild.id}/${
                    inv.guild.icon
                }.png`
            }
        };

        if (inv.inviter) {
            edata.fields.push({
                name: "Inviter",
                value: `**${inv.inviter.username}#${
                    inv.inviter.discriminator
                }** (${inv.inviter.id})`,
                inline: true
            });
        }

        edata.fields.push({
            name: "\u200b",
            value: `[Icon](https://cdn.discordapp.com/icons/${inv.guild.id}/${
                inv.guild.icon
            }.png?size=1024)${
                inv.guild.splash !== null
                    ? " | [Splash](https://cdn.discordapp.com/splashes/${inv.guild.id}/${inv.guild.splash}.png?size=2048)"
                    : ""
            }`,
            inline: false
        });

        if (inv.guild.splash !== null) {
            edata.image = {
                url: `https://cdn.discordapp.com/splashes/${inv.guild.id}/${
                    inv.guild.splash
                }.png?size=256`
            };
        }

        msg.channel.createMessage({ embed: edata });
    }
};

let mods = function(ctx, msg, args) {
    if (msg.channel.guild) {
        if (!args) {
            let res = "Moderators for **" + msg.channel.guild.name + "**:";

            let a = {
                online: "",
                idle: "",
                dnd: "",
                offline: ""
            };

            msg.channel.guild.members.forEach(u => {
                if (
                    (msg.channel.permissionsOf(u.id).has("kickMembers") ||
                        msg.channel
                            .permissionsOf(u.id)
                            .has("manageMessages")) &&
                    !u.bot
                ) {
                    a[u.status] +=
                        "\n" +
                        statusIcons[u.status] +
                        u.username +
                        "#" +
                        u.discriminator +
                        (u.nick ? " (" + u.nick + ")" : "");
                }
            });

            for (s in a) {
                res += a[s];
            }
            msg.channel.createMessage(res);
        } else if (args == "online" || args == "o") {
            let res =
                "Online moderators for **" + msg.channel.guild.name + "**:";

            msg.channel.guild.members.forEach(u => {
                if (
                    (msg.channel.permissionsOf(u.id).has("kickMembers") ||
                        msg.channel
                            .permissionsOf(u.id)
                            .has("manageMessages")) &&
                    !u.bot &&
                    u.status != "offline"
                ) {
                    res +=
                        "\n" +
                        statusIcons[u.status] +
                        u.username +
                        "#" +
                        u.discriminator;
                }
            });
            msg.channel.createMessage(res);
        }
    } else {
        msg.channel.createMessage("Command cannot be used outside of servers.");
    }
};

let binfo = async function(ctx, msg, args) {
    let u = await ctx.utils
        .lookupUser(ctx, msg, args || msg.author.mention)
        .catch(m => {
            if (m == "No results." || m == "Canceled") {
                msg.channel.createMessage(m);
            }
        });

    if (u.bot) {
        let req = await ctx.libs.superagent
            .get(`https://bots.discord.pw/api/bots/${u.id}`)
            .set("Authorization", ctx.apikeys.dbots);
        let data = req.body;

        if (data.error) {
            if (
                data.error == "Bot user ID not found" ||
                data.error == "Not Found."
            ) {
                msg.channel.createMessage(
                    "No bot info found, may not be on botlist."
                );
            } else {
                msg.channel.createMessage("An error occured.");
            }
            return;
        }

        let owners = [];
        for (let b in data["owner_ids"]) {
            owners.push(`<@${data["owner_ids"][b]}>`);
        }

        let edata = {
            color: 0x7289da,

            title: `Bot Info: \`${u.username}#${u.discriminator}\``,
            description: data.description,
            fields: [
                { name: "ID", value: u.id, inline: true },
                { name: "Owner(s)", value: owners.join("\n"), inline: true },
                { name: "Library", value: data.library, inline: true },
                { name: "Prefix", value: "`" + data.prefix + "`", inline: true }
            ],
            footer: {
                text: "Info provided by bots.discord.pw"
            },
            thumbnail: {
                url:
                    "https://cdn.discordapp.com/avatars/" +
                    u.id +
                    "/" +
                    u.avatar
            }
        };

        if (data.invite_url !== null) {
            edata.fields.push({
                name: "Invite",
                value: "[Click For Invite](" + data.invite_url + ")",
                inline: true
            });
        }

        msg.channel.createMessage({ embed: edata });
    } else {
        let req = await ctx.libs.superagent
            .get(`https://bots.discord.pw/api/users/${u.id}`)
            .set("Authorization", ctx.apikeys.dbots);
        let data = req.body;

        if (data.error) {
            if (
                data.error == "User ID not found" ||
                data.error == "Not Found."
            ) {
                msg.channel.createMessage(
                    `No bots found for **${u.username}#${u.discriminator}**`
                );
            } else {
                msg.channel.createMessage("An error occured.");
            }
            return;
        }

        let bots = [];
        for (let b in data.bots) {
            bots.push(`<@${data.bots[b].user_id}>`);
        }

        let edata = {
            color: 0x7289da,

            title: `Bots for user: \`${u.username}#${u.discriminator}\``,
            description:
                `**${u.username}#${u.discriminator}** owns **${
                    bots.length
                } bot(s)**:\n\n` + bots.join("\n"),
            thumbnail: {
                url:
                    "https://cdn.discordapp.com/avatars/" +
                    u.id +
                    "/" +
                    u.avatar
            }
        };

        msg.channel.createMessage({ embed: edata });
    }
};

let ptypes = ["Playing", "Streaming", "Listening to", "Watching"];

let uinfo = function(ctx, msg, args) {
    ctx.utils
        .lookupUser(ctx, msg, args || msg.member.mention)
        .then(async u => {
            if (msg.channel.guild && msg.channel.guild.members.get(u.id)) {
                u = msg.channel.guild.members.get(u.id);
                let e = {
                    color: ctx.utils.topColor(ctx, msg, u.id),
                    title: `User Info: \`${u.username}#${u.discriminator}\``,
                    fields: [
                        { name: "ID", value: u.id, inline: true },
                        {
                            name: "Nickname",
                            value: u.nick ? u.nick : "None",
                            inline: true
                        },
                        {
                            name: "Status",
                            value: u.game
                                ? u.game.url
                                  ? "<:streaming:313956277132853248> [Streaming](" +
                                    u.game.url +
                                    ")"
                                  : statusIcons[u.status] + " " + u.status
                                : statusIcons[u.status] + " " + u.status,
                            inline: true
                        },
                        {
                            name: ptypes[(u.game && u.game.type) || 0],
                            value: u.game ? u.game.name : "Nothing",
                            inline: true
                        },
                        {
                            name: "Roles",
                            value: u.guild
                                ? u.roles.length > 0
                                  ? u.roles.map(r => `<@&${r}>`).join(", ")
                                  : "No roles"
                                : "No roles",
                            inline: true
                        },
                        {
                            name: "Shared Servers",
                            value: `${
                                ctx.bot.guilds.filter(a => a.members.get(u.id))
                                    .length
                            } servers`,
                            inline: true
                        },
                        {
                            name: "Created At",
                            value: new Date(u.createdAt).toUTCString(),
                            inline: true
                        },
                        {
                            name: "Joined At",
                            value: new Date(u.joinedAt).toUTCString(),
                            inline: true
                        }
                    ],
                    thumbnail: {
                        url: `https://cdn.discordapp.com/avatars/${u.id}/${
                            u.avatar
                        }.${u.avatar.startsWith("a_") ? "gif" : "png?size=256"}`
                    }
                };

                e.fields.push({
                    name: "Avatar",
                    value:
                        "[Full Size](" +
                        `https://cdn.discordapp.com/avatars/${u.id}/${
                            u.avatar
                        }.${
                            u.avatar.startsWith("a_") ? "gif" : "png"
                        }?size=1024` +
                        ")",
                    inline: true
                });

                msg.channel.createMessage({ embed: e });
            } else {
                let snowflake = parseInt(u.id).toString(2);
                snowflake = "0".repeat(64 - snowflake.length) + snowflake;
                let date = snowflake.substr(0, 42);
                let timestamp = parseInt(date, 2) + 1420070400000;

                let e = {
                    color: 0x7289da,

                    title: `User Info: \`${u.username}#${u.discriminator}\``,
                    fields: [
                        { name: "ID", value: u.id, inline: true },
                        {
                            name: "Shared Servers",
                            value: `${
                                ctx.bot.guilds.filter(a => a.members.get(u.id))
                                    .length
                            } servers`,
                            inline: true
                        },
                        {
                            name: "Created At",
                            value: new Date(timestamp).toUTCString(),
                            inline: true
                        }
                    ],
                    thumbnail: {
                        url: `https://cdn.discordapp.com/avatars/${u.id}/${
                            u.avatar
                        }.${u.avatar.startsWith("a_") ? "gif" : "png?size=256"}`
                    }
                };

                e.fields.push({
                    name: "Avatar",
                    value:
                        "[Full Size](" +
                        `https://cdn.discordapp.com/avatars/${u.id}/${
                            u.avatar
                        }.${
                            u.avatar.startsWith("a_") ? "gif" : "png"
                        }?size=1024` +
                        ")",
                    inline: true
                });

                msg.channel.createMessage({ embed: e });
            }
        })
        .catch(m => {
            if (m == "No results." || m == "Canceled") {
                msg.channel.createMessage(m);
            } else {
                ctx.utils.logWarn(ctx, "Exception in command: " + m);
            }
        });
};

let sinfo = async function(ctx, msg, args) {
    let flags = {
        "eu-central": ":flag_eu:",
        london: ":flag_gb:",
        amsterdam: ":flag_nl:",
        japan: ":flag_jp:",
        brazil: "<:lunahahayes:383962711274291200>",
        "us-west": ":hamburger:",
        hongkong: ":flag_hk:",
        sydney: ":flag_au:",
        singapore: ":flag_sg:",
        "us-central": ":hamburger:",
        "eu-west": ":flag_eu:",
        "us-south": ":hamburger:",
        "us-east": ":hamburger:",
        frankfurt: ":flag_de:",
        russia: ":flag_ru:"
    };

    if (msg.channel.guild) {
        let g = msg.channel.guild;

        let bots = g.members.filter(u => u.bot).length;

        let emojis = [];
        g.emojis.forEach(e => {
            emojis.push(`<${e.animated ? "a" : ""}:${e.name}:${e.id}>`);
        });

        emojis = emojis.sort(function(a, b) {
            a = a.toLowerCase().replace(/<(a)?:(.+):(.+)>/, "$2");
            b = b.toLowerCase().replace(/<(a)?:(.+):(.+)>/, "$2");
            return a < b ? 1 : a > b ? -1 : 0;
        });

        let tmp = [];
        emojis.forEach(e => {
            tmp.push(e.replace(/:(.+):/, ":_:"));
        });
        emojis = tmp;
        tmp = undefined;

        let info = {
            color: 0x7289da,
            title: `Server Info for \`${g.name}\``,
            fields: [
                { name: "ID", value: g.id, inline: true },
                { name: "Owner", value: `<@${g.ownerID}>`, inline: true },
                { name: "Total Members", value: g.memberCount, inline: true },
                {
                    name: "Humans",
                    value: `${g.memberCount - bots} (${Math.round(
                        (g.memberCount - bots) / g.memberCount * 100
                    )}% of members)`,
                    inline: true
                },
                {
                    name: "Bots",
                    value: `${bots} (${Math.round(
                        bots / g.memberCount * 100
                    )}% of members)`,
                    inline: true
                },
                { name: "Channels", value: g.channels.size, inline: true },
                {
                    name: "Region",
                    value:
                        (flags[g.region] || ":flag_black:") +
                        " " +
                        (g.region || "Unknown Region???"),
                    inline: true
                },
                { name: "Shard", value: g.shard.id, inline: true },
                { name: "Roles", value: g.roles.size, inline: true },
                { name: "Emoji Count", value: g.emojis.length, inline: true },
                {
                    name: "Created At",
                    value: new Date(g.createdAt).toUTCString(),
                    inline: true
                },
                {
                    name: "Icon",
                    value:
                        "[Full Size](https://cdn.discordapp.com/icons/" +
                        g.id +
                        "/" +
                        g.icon +
                        ".png?size=1024)",
                    inline: true
                }
            ],
            thumbnail: {
                url:
                    "https://cdn.discordapp.com/icons/" +
                    g.id +
                    "/" +
                    g.icon +
                    ".png?size=256"
            }
        };

        info.fields.push({
            name: "Flags",
            value: `<:partner:314068430556758017>: ${
                g.features &&
                (g.features.includes("VANITY_URL") ||
                    g.features.includes("INVITE_SPLASH") ||
                    g.features.includes("VIP_REGIONS"))
                    ? "<:GreenTick:349381062176145408>"
                    : "<:RedTick:349381062054510604>"
            }\t\t<:verified:439149164560121865>: ${
                g.features && g.features.includes("VERIFIED")
                    ? "<:GreenTick:349381062176145408>"
                    : "<:RedTick:349381062054510604>"
            }`,
            inline: true
        });

        if (emojis.length > 0) {
            info.fields.push({
                name: "Emojis (1-25)",
                value: emojis.slice(0, 25).join(" "),
                inline: true
            });
        }

        if (emojis.length > 25) {
            info.fields.push({
                name: "Emojis (26-50)",
                value: emojis.slice(25, 50).join(" "),
                inline: true
            });
        }

        if (emojis.length > 50) {
            info.fields.push({
                name: "Emojis (51-75)",
                value: emojis.slice(50, 75).join(" "),
                inline: true
            });
        }

        if (emojis.length > 75) {
            info.fields.push({
                name: "Emojis (76-100)",
                value: emojis.slice(75, 100).join(" "),
                inline: true
            });
        }

        if (emojis.length > 100) {
            info.fields.push({
                name: "Emojis (101-150)",
                value: emojis.slice(100, 150).join(" "),
                inline: true
            });
        }

        if (emojis.length > 150) {
            info.fields.push({
                name: "Emojis (151-200+)",
                value: emojis.slice(150).join(" "),
                inline: true
            });
        }

        msg.channel.createMessage({ embed: info });
    } else {
        msg.channel.createMessage("This command can only be used in servers.");
    }
};

let rinfo = function(ctx, msg, args) {
    ctx.utils
        .lookupRole(ctx, msg, args || "")
        .then(r => {
            let users = 0;
            let bots = 0;
            msg.channel.guild.members.forEach(m => {
                if (m.roles.indexOf(r.id) > -1) {
                    if (m.bot) bots++;
                    users++;
                }
            });

            let perms = [];
            Object.keys(r.permissions.json).forEach(k => {
                perms.push(
                    `${
                        r.permissions.json[k] == true ? "\u2705" : "\u274C"
                    } ${k}`
                );
            });

            if (perms.length == 0) {
                perms.push("None");
            }
            msg.channel.createMessage({
                embed: {
                    color: r.color,

                    title: `Role Info: \`${r.name}\``,
                    fields: [
                        { name: "ID", value: r.id, inline: true },
                        {
                            name: "Color",
                            value: r.color
                                ? "#" +
                                  (r.color.toString(16).length < 6
                                      ? "0".repeat(
                                            6 - r.color.toString(16).length
                                        )
                                      : "") +
                                  r.color.toString(16).toUpperCase()
                                : "None",
                            inline: true
                        },
                        { name: "Users in role", value: users, inline: true },
                        { name: "Bots in role", value: bots, inline: true },
                        {
                            name: "Mentionable",
                            value: r.mentionable ? r.mentionable : "false",
                            inline: true
                        },
                        {
                            name: "Managed",
                            value: r.managed ? r.managed : "false",
                            inline: true
                        },
                        { name: "Position", value: r.position, inline: true },
                        { name: "Permissions", value: perms.join(", ") }
                    ]
                }
            });
        })
        .catch(m => {
            if (m == "No results." || m == "Canceled") {
                msg.channel.createMessage(m);
            }
        });
};

let slist = function(ctx, msg, args) {
    let servers = [];

    ctx.bot.guilds.forEach(s => {
        servers.push(s);
    });

    servers.sort((a, b) => {
        if (a.memberCount > b.memberCount) return -1;
        if (a.memberCount < b.memberCount) return 1;
        if (a.memberCount == b.memberCount) return 0;
    });

    let index = 1;
    if (args) index = parseInt(args);

    let list = [];
    let page = servers.slice((index - 1) * 10, index * 10);

    page.map((s, i) => {
        let bots = s.members.filter(u => u.bot).length;
        list.push({
            name: i + 1 + (index - 1) * 10 + ". " + s.name,
            value: `${s.memberCount} members, ${bots} bots (${Math.floor(
                bots / s.memberCount * 100
            )}%)\n${s.channels.size} channels, ${s.roles.size} roles`,
            inline: true
        });
    });

    msg.channel.createMessage({
        embed: {
            title: "Server List",
            fields: list,
            footer: {
                text: `Page ${index} of ${Math.floor(
                    ctx.bot.guilds.size / 10
                )} | ${ctx.bot.guilds.size} total servers`
            }
        }
    });
};

let presence = function(ctx, msg, args) {
    if (!msg.channel.guild) {
        msg.channel.createMessage(
            "Can only be used in guilds due to API limitations."
        );
        return;
    }

    ctx.utils.lookupUser(ctx, msg, args || msg.member.mention).then(u => {
        u = msg.channel.guild.members.get(u.id);

        if (u.game) {
            let embed = {
                title: `Presence for \`${u.username}#${u.discriminator}\``,
                fields: [
                    {
                        name: "Status",
                        value: u.game
                            ? u.game.url
                              ? "<:streaming:313956277132853248> [Streaming](" +
                                u.game.url +
                                ")"
                              : statusIcons[u.status] + " " + u.status
                            : statusIcons[u.status] + " " + u.status,
                        inline: true
                    },
                    {
                        name: ptypes[(u.game && u.game.type) || 0],
                        value: u.game ? u.game.name : "Nothing",
                        inline: true
                    }
                ],
                color:
                    u.game.name == "Spotify"
                        ? 0x1db954
                        : ctx.utils.topColor(ctx, msg, u.id)
            };

            if (u.game.application_id || u.game.flags == 48) {
                embed.fields.push({
                    name: "Details",
                    value: u.game.details ? u.game.details : "None provided.",
                    inline: true
                });
                embed.fields.push({
                    name: "State",
                    value: u.game.state ? u.game.state : "None provided.",
                    inline: true
                });
                embed.fields.push({
                    name: "Party Size",
                    value:
                        u.game.party && u.game.party.size
                            ? `${u.game.party.size[0]} of ${
                                  u.game.party.size[1]
                              }`
                            : "None provided.",
                    inline: true
                });
                embed.fields.push({
                    name: "Large Icon Text",
                    value:
                        u.game.assets && u.game.assets.large_text
                            ? u.game.assets.large_text
                            : "None provided.",
                    inline: true
                });
                embed.fields.push({
                    name: "Small Icon Text",
                    value:
                        u.game.assets && u.game.assets.small_text
                            ? u.game.assets.small_text
                            : "None provided.",
                    inline: true
                });

                embed.thumbnail = {
                    url:
                        u.game.assets && u.game.assets.large_image
                            ? "attachment://rpcicon.png"
                            : "https://cdn.discordapp.com/emojis/402275812637933598.png"
                };
            }

            embed.fields.push({
                name: "Time Elapsed",
                value:
                    u.game.timestamps && u.game.timestamps.start
                        ? ctx.utils.remainingTime(
                              new Date().getTime() - u.game.timestamps.start
                          ) + " elapsed"
                        : "None provided.",
                inline: true
            });
            embed.fields.push({
                name: "End Time",
                value:
                    u.game.timestamps && u.game.timestamps.end
                        ? ctx.utils.remainingTime(
                              u.game.timestamps.end - u.game.timestamps.start
                          ) + " remaining"
                        : "None provided.",
                inline: true
            });

            if (u.game.assets && u.game.assets.large_image) {
                let jimp = require("jimp");

                jimp
                    .read(
                        u.game.assets.large_image.startsWith("spotify:")
                            ? u.game.assets.large_image.replace(
                                  "spotify:",
                                  "http://i.scdn.co/image/"
                              )
                            : `https://cdn.discordapp.com/app-assets/${
                                  u.game.application_id
                              }/${u.game.assets.large_image}.png?size=128;`
                    )
                    .then(async i => {
                        let a = i.clone().resize(96, jimp.AUTO);
                        let b =
                            u.game.assets && u.game.assets.small_image
                                ? `https://cdn.discordapp.com/app-assets/${
                                      u.game.application_id
                                  }/${u.game.assets.small_image}.png?size=128;`
                                : "";

                        if (b.length > 0) {
                            b = await jimp.read(b);
                            b = b.resize(32, jimp.AUTO);
                            a.composite(b, 96 - 32, 96 - 32);
                        }

                        a.getBuffer(jimp.MIME_PNG, (e, f) => {
                            msg.channel.createMessage(
                                { embed: embed },
                                { name: "rpcicon.png", file: f }
                            );
                        });
                    });
            } else {
                msg.channel.createMessage({ embed: embed });
            }
        } else {
            msg.channel.createMessage(
                `**${u.username}#${
                    u.discriminator
                }** is not playing a game.\n**Status:** ${statusIcons[
                    u.status
                ] +
                    " " +
                    u.status}`
            );
        }
    });
};

const emojiSets = {
    blobs: {
        url:
            "https://cdn.rawgit.com/googlei18n/noto-emoji/e456654119cc3a5f9bebb7bbd00512456f983d2d/svg/emoji_u",
        joiner: "_",
        ext: ".svg"
    },
    noto: {
        url:
            "https://cdn.rawgit.com/googlei18n/noto-emoji/43f47be9404018cd9d8f73a227363a8f20acdab5/svg/emoji_u",
        joiner: "_",
        ext: ".svg"
    },
    twemoji: {
        url: "https://twitter.github.io/twemoji/2/svg/",
        joiner: "-",
        ext: ".svg"
    },
    mustd: {
        url:
            "https://cdn.rawgit.com/Mstrodl/mutant-standard-mirror/0d094f73/emoji/",
        joiner: "-",
        ext: ".svg"
    },
    apple: {
        url: "https://intrnl.github.io/assetsEmoji/AppleColor/emoji_u",
        joiner: "_",
        ext: ".png"
    },
    facebook: {
        url: "https://intrnl.github.io/assetsEmoji/facebook/emoji_u",
        joiner: "_",
        ext: ".png"
    }
};

const svg2png = require("svg2png");

let jumbo = async function(ctx, msg, args) {
    let emojiNames = await ctx.libs.superagent
        .get(
            "https://cdn.rawgit.com/omnidan/node-emoji/359b0aad/lib/emoji.json"
        )
        .then(x => x.body);
    let temp = [];
    Object.keys(emojiNames).map(x => (temp[emojiNames[x]] = x));
    emojiNames = temp;
    if (/<(a)?:([a-zA-Z0-9_*/-:]*):([0-9]*)>/.test(args)) {
        let a = args.match(/<(a)?:([a-zA-Z0-9_*/-:]*):([0-9]*)>/);
        let animated = a[1] ? true : false;
        let name = a[2];
        let id = a[3];

        msg.channel.createMessage({
            embed: {
                title: `:${name}: - \`${id}\``,
                image: {
                    url: `https://cdn.discordapp.com/emojis/${id}.${
                        animated ? "gif" : "png"
                    }?v=1`
                }
            }
        });
    } else {
        let pack = "twemoji";
        Object.keys(emojiSets).forEach(x => {
            if (args.startsWith(`--${x} `)) {
                pack = x;
                args = args.replace(`--${x} `, "");
            }
        });
        let emoji = Array.from(args)
            .map(x => x.codePointAt().toString(16))
            .join(emojiSets[pack].joiner);
        let emojiurl = emojiSets[pack].url + emoji + emojiSets[pack].ext;
        ctx.libs.superagent
            .get(emojiurl)
            .then(x => {
                if (emojiSets[pack].ext == ".png") {
                    msg.channel.createMessage({
                        embed: {
                            title: `${
                                emojiNames[args]
                                    ? `:${emojiNames[args]}:`
                                    : "<no shorthand>"
                            } (${emoji
                                .toUpperCase()
                                .replace(emojiSets[pack].ext, ", ")})`,
                            url: emojiurl,
                            image: {
                                url: emojiurl
                            }
                        }
                    });
                } else {
                    svg2png(x.body, { width: 512, height: 512 }).then(y => {
                        msg.channel.createMessage(
                            {
                                embed: {
                                    title: `${
                                        emojiNames[args]
                                            ? `:${emojiNames[args]}:`
                                            : "<no shorthand>"
                                    } (${emoji
                                        .toUpperCase()
                                        .replace(emojiSets[pack].ext, ", ")})`,
                                    url: emojiurl,
                                    image: {
                                        url: "attachment://emoji.png"
                                    }
                                }
                            },
                            {
                                file: y,
                                name: "emoji.png"
                            }
                        );
                    });
                }
            })
            .catch(e => {
                msg.channel.createMessage(
                    "Emote not found. The emoji set chosen might not have this emote as an image."
                );
            });
    }
};

let einfo = function(ctx, msg, args) {
    if (/<(a)?:([a-zA-Z0-9_*/-:]*):([0-9]*)>/.test(args)) {
        let a = args.match(/<(a)?:([a-zA-Z0-9_*/-:]*):([0-9]*)>/);
        let animated = a[1] ? true : false;
        let name = a[2];
        let id = a[3];
        let guild;
        let emote;

        if (ctx.emotes.get(id)) {
            emote = ctx.emotes.get(id);
            guild = ctx.bot.guilds.get(emote.guild_id);
        }

        msg.channel.createMessage({
            embed: {
                title: `Emoji Info: :${name}:`,
                fields: [
                    { name: "ID", value: id, inline: true },
                    {
                        name: "Full Code",
                        value: a[0].replace("<", "\\<").replace(">", "\\>"),
                        inline: true
                    },
                    { name: "Animated?", value: animated, inline: true },
                    {
                        name: "Guild",
                        value: guild
                            ? `${guild.name} \`(${guild.id})\``
                            : "Not found",
                        inline: true
                    }
                ],
                thumbnail: {
                    url: `https://cdn.discordapp.com/emojis/${id}.${
                        animated ? "gif" : "png"
                    }?v=1`
                }
            }
        });
    } else {
        msg.channel.createMessage(
            "Emote not found. This currently only works for custom ones."
        );
    }
};

module.exports = [
    {
        name: "avatar",
        desc: "Get the avatar of a user.",
        func: avatar,
        usage: "[user]",
        group: "utils"
    },
    {
        name: "lookupinvite",
        desc: "Lookup an invite",
        func: linvite,
        usage: "<invite>",
        group: "utils",
        aliases: ["linvite"]
    },
    {
        name: "mods",
        desc: "Displays list of online mods",
        func: mods,
        group: "utils"
    },
    {
        name: "binfo",
        desc: "Displays info on a bot or lists a users bots if any.",
        func: binfo,
        usage: "[user]",
        group: "utils"
    },
    {
        name: "uinfo",
        desc: "Get info on a user.",
        func: uinfo,
        group: "utils"
    },
    {
        name: "sinfo",
        desc: "Displays info of a server",
        func: sinfo,
        group: "utils"
    },
    {
        name: "rinfo",
        desc: "Displays info of a role",
        func: rinfo,
        group: "utils"
    },
    {
        name: "cflake",
        desc: "Converts a Discord snowflake to a readable time.",
        func: cflake,
        group: "utils",
        aliases: ["snowflake"]
    },
    {
        name: "slist",
        desc: "Server list of servers HiddenPhox is in.",
        func: slist,
        group: "utils"
    },
    {
        name: "presence",
        desc: "Get presence/playing game of someone.",
        func: presence,
        group: "utils",
        aliases: ["status"]
    },
    {
        name: "jumbo",
        desc: "Get the raw image of an emoji.",
        func: jumbo,
        group: "utils"
    },
    {
        name: "einfo",
        desc: "Get info of an emoji.",
        func: einfo,
        group: "utils",
        aliases: ["e", "emote", "emoji"]
    }
];
