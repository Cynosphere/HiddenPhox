let statusIcons = {
    online: "<:online:493173082421461002>",
    idle: "<:idle:493173082006093836>",
    dnd: "<:dnd:493173082261815307>",
    offline: "<:offline:493173082253426688>"
};

let avatar = function(ctx, msg, args) {
    if (args && (args == "server" || args == "guild")) {
        msg.channel.createMessage({
            embed: {
                title: `Server Icon:`,
                image: {
                    url: `https://cdn.discordapp.com/icons/${
                        msg.channel.guild.id
                    }/${msg.channel.guild.icon}.png?size=1024`
                }
            }
        });
    } else {
        ctx.utils
            .lookupUser(ctx, msg, args ? args : msg.author.mention)
            .then(u => {
                let av = `https://cdn.discordapp.com/avatars/${u.id}/${
                    u.avatar
                }.${
                    u.avatar.startsWith("a_")
                        ? "gif?size=1024&_=.gif"
                        : "png?size=1024"
                }`;
                msg.channel.createMessage({
                    embed: {
                        title: `Avatar for **${u.username}#${
                            u.discriminator
                        }**:`,
                        image: {
                            url: av
                        }
                    }
                });
            });
    }
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
    if (!args) {
        msg.channel.createMessage("No invite code passed.");
        return;
    }
    let data = await ctx.libs.superagent
        .get(`https://discordapp.com/api/v7/invites/${args}?with_counts=1`)
        .set("User-Agent", "HiddenPhox (v9, Eris)")
        .set("Content-Type", "application/json")
        .set("Authorization", ctx.bot.token)
        .catch(x => {
            msg.channel.createMessage("Invite provided is not valid.");
            return;
        });
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
                    value: `${statusIcons["online"]}${
                        inv.approximate_presence_count
                    } online\t\t${statusIcons["offline"]} ${
                        inv.approximate_member_count
                    } members`,
                    inline: false
                },
                {
                    name: "Features/Flags",
                    value: `<:partner:493173082345832448>: ${
                        inv.guild.features.includes("VANITY_URL") ||
                        inv.guild.features.includes("INVITE_SPLASH") ||
                        inv.guild.features.includes("VIP_REGIONS")
                            ? "<:ms_tick:503341995348066313>"
                            : "<:ms_cross:503341994974773250>"
                    }\t\t<:verified:543598700920832030>: ${
                        inv.guild.features.includes("VERIFIED")
                            ? "<:ms_tick:503341995348066313>"
                            : "<:ms_cross:503341994974773250>"
                    }\t\t${
                        inv.guild.features.includes("LURKABLE")
                            ? "\uD83D\uDC40: <:ms_tick:503341995348066313>"
                            : ""
                    }\t\t${
                        inv.guild.features.includes("COMMERCE")
                            ? "\uD83D\uDECD: <:ms_tick:503341995348066313>"
                            : ""
                    }\t\t${
                        inv.guild.features.includes("NEWS")
                            ? "\uD83D\uDCF0: <:ms_tick:503341995348066313>"
                            : ""
                    }\t\t${
                        inv.guild.features.includes("MORE_EMOJI")
                            ? "<:more_emoji:560205660227239957>: <:ms_tick:503341995348066313>"
                            : ""
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

        msg.channel.createMessage({
            embed: edata
        });
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
                {
                    name: "ID",
                    value: u.id,
                    inline: true
                },
                {
                    name: "Owner(s)",
                    value: owners.join("\n"),
                    inline: true
                },
                {
                    name: "Library",
                    value: data.library,
                    inline: true
                },
                {
                    name: "Prefix",
                    value: "`" + data.prefix + "`",
                    inline: true
                }
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

        msg.channel.createMessage({
            embed: edata
        });
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

        msg.channel.createMessage({
            embed: edata
        });
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
                    title: `User Info: \`${u.username}#${u.discriminator}\` ${
                        u.bot ? "<:boat:546212361472835584>" : ""
                    }`,
                    fields: [
                        {
                            name: "ID",
                            value: u.id,
                            inline: true
                        },
                        {
                            name: "Nickname",
                            value: u.nick ? u.nick : "None",
                            inline: true
                        },
                        {
                            name: "Status",
                            value: u.game
                                ? u.game.url
                                    ? "<:streaming:493173082308083722> [Streaming](" +
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
                        },
                        {
                            name: "Avatar",
                            value:
                                u.avatar !== null
                                    ? `[Full Size](https://cdn.discordapp.com/avatars/${
                                          u.id
                                      }/${u.avatar}.${
                                          u.avatar.startsWith("a_")
                                              ? "gif"
                                              : "png"
                                      }?size=1024)`
                                    : `[Full Size](https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                                          5}.png)`,
                            inline: true
                        }
                    ],
                    thumbnail: {
                        url:
                            u.avatar !== null
                                ? `https://cdn.discordapp.com/avatars/${u.id}/${
                                      u.avatar
                                  }.${
                                      u.avatar.startsWith("a_")
                                          ? "gif"
                                          : "png?size=256"
                                  }`
                                : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                                      5}.png`
                    }
                };

                msg.channel.createMessage({
                    embed: e
                });
            } else {
                let snowflake = parseInt(u.id).toString(2);
                snowflake = "0".repeat(64 - snowflake.length) + snowflake;
                let date = snowflake.substr(0, 42);
                let timestamp = parseInt(date, 2) + 1420070400000;

                let e = {
                    color: 0x7289da,

                    title: `User Info: \`${u.username}#${u.discriminator}\` ${
                        u.bot ? "<:boat:546212361472835584>" : ""
                    }`,
                    fields: [
                        {
                            name: "ID",
                            value: u.id,
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
                            value: new Date(timestamp).toUTCString(),
                            inline: true
                        },
                        {
                            name: "Avatar",
                            value:
                                u.avatar !== null
                                    ? `[Full Size](https://cdn.discordapp.com/avatars/${
                                          u.id
                                      }/${u.avatar}.${
                                          u.avatar.startsWith("a_")
                                              ? "gif"
                                              : "png?size=1024"
                                      })`
                                    : `[Full Size](https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                                          5}.png)`,
                            inline: true
                        }
                    ],
                    thumbnail: {
                        url:
                            u.avatar !== null
                                ? `https://cdn.discordapp.com/avatars/${u.id}/${
                                      u.avatar
                                  }.${
                                      u.avatar.startsWith("a_")
                                          ? "gif"
                                          : "png?size=256"
                                  }`
                                : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                                      5}.png`
                    }
                };

                msg.channel.createMessage({
                    embed: e
                });
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

    let levels = [
        "None",
        "Low",
        "Medium",
        "(╯°□°）╯︵ ┻━┻ (High)",
        "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻ (Very High/Phone)"
    ];
    let notifs = ["All Messages", "Mentions Only"];

    if (msg.channel.guild) {
        let g = msg.channel.guild;

        let bots = g.members.filter(u => u.bot).length;

        let emojis = [];
        g.emojis.forEach(e => {
            let hasRole = false;

            e.roles.forEach(x => {
                if (g.members.get(ctx.bot.user.id).roles.includes(x))
                    hasRole = true;
            });

            if (e.managed && hasRole == false) return;
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

        let everyone = g.roles.filter(x => x.name == "@everyone")[0];

        let info = {
            color: 0x7289da,
            title: `Server Info for \`${g.name}\``,
            fields: [
                {
                    name: "ID",
                    value: g.id,
                    inline: true
                },
                {
                    name: "Owner",
                    value: `<@${g.ownerID}>`,
                    inline: true
                },
                {
                    name: "Total Members",
                    value: g.memberCount,
                    inline: true
                },
                {
                    name: "Humans",
                    value: `${g.memberCount - bots} (${Math.round(
                        ((g.memberCount - bots) / g.memberCount) * 100
                    )}% of members)`,
                    inline: true
                },
                {
                    name: "Bots",
                    value: `${bots} (${Math.round(
                        (bots / g.memberCount) * 100
                    )}% of members)`,
                    inline: true
                },
                {
                    name: "Channels",
                    value: `${g.channels.size}/500 (${
                        g.channels.filter(x => x.type == 0).length
                    } text, ${
                        g.channels.filter(x => x.type == 2).length
                    } voice, ${
                        g.channels.filter(x => x.type == 4).length
                    } categories, ${
                        g.channels.filter(
                            x =>
                                x.permissionOverwrites &&
                                x.permissionOverwrites.get(everyone.id) &&
                                x.permissionOverwrites.get(everyone.id).json
                                    .readMessages == false
                        ).length
                    } hidden, ${g.channels.filter(x => x.nsfw).length} NSFW)`,
                    inline: true
                },
                {
                    name: "Region",
                    value:
                        (flags[g.region] || ":flag_black:") +
                        " " +
                        (g.region || "Unknown Region???"),
                    inline: true
                },
                {
                    name: "Shard",
                    value: g.shard.id,
                    inline: true
                },
                {
                    name: "Roles",
                    value: `${g.roles.size}/250 (${
                        g.roles.filter(x => x.managed).length
                    } managed)`,
                    inline: true
                },
                {
                    name: "Emoji Count",
                    value: `${g.emojis.length}/100 (${
                        g.emojis.filter(x => x.animated).length
                    } animated, ${
                        g.emojis.filter(x => x.managed).length
                    } managed)`,
                    inline: true
                },
                {
                    name: "Created At",
                    value: new Date(g.createdAt).toUTCString(),
                    inline: true
                },
                {
                    name: "Verification Level",
                    value: levels[g.verificationLevel],
                    inline: true
                },
                {
                    name: "Voice AFK",
                    value: `Timeout: ${g.afkTimeout}s\nChannel: ${
                        g.afkChannelID == null ? "None" : `<#${g.afkChannelID}>`
                    }`,
                    inline: true
                },
                {
                    name: "Default Notifications",
                    value: notifs[g.defaultNotifications],
                    inline: true
                },
                {
                    name: "MFA For Perms",
                    value: g.mfaLevel == 0 ? "False" : "True",
                    inline: true
                },
                {
                    name: 'Considered "Large"',
                    value: g.large,
                    inline: true
                },
                {
                    name: "Icon",
                    value: `[Full Size](https://cdn.discordapp.com/icons/${
                        g.id
                    }/${g.icon}.png?size=1024)`,
                    inline: true
                }
            ],
            thumbnail: {
                url: `https://cdn.discordapp.com/icons/${g.id}/${
                    g.icon
                }.png?size=256`
            }
        };

        info.fields.push({
            name: "Features/Flags",
            value: `<:partner:493173082345832448>: ${
                g.features.includes("VANITY_URL") ||
                g.features.includes("INVITE_SPLASH") ||
                g.features.includes("VIP_REGIONS")
                    ? "<:ms_tick:503341995348066313>"
                    : "<:ms_cross:503341994974773250>"
            }\t\t<:verified:543598700920832030>: ${
                g.features.includes("VERIFIED")
                    ? "<:ms_tick:503341995348066313>"
                    : "<:ms_cross:503341994974773250>"
            }\t\t${
                g.features.includes("LURKABLE")
                    ? "\uD83D\uDC40: <:ms_tick:503341995348066313>"
                    : ""
            }\t\t${
                g.features.includes("COMMERCE")
                    ? "\uD83D\uDECD: <:ms_tick:503341995348066313>"
                    : ""
            }\t\t${
                g.features.includes("NEWS")
                    ? "\uD83D\uDCF0: <:ms_tick:503341995348066313>"
                    : ""
            }\t\t${
                g.features.includes("MORE_EMOJI")
                    ? "<:more_emoji:560205660227239957>: <:ms_tick:503341995348066313>"
                    : ""
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

        msg.channel.createMessage({
            embed: info
        });
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
                        {
                            name: "ID",
                            value: r.id,
                            inline: true
                        },
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
                        {
                            name: "Users in role",
                            value: users,
                            inline: true
                        },
                        {
                            name: "Bots in role",
                            value: bots,
                            inline: true
                        },
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
                        {
                            name: "Position",
                            value: r.position,
                            inline: true
                        },
                        {
                            name: "Permissions",
                            value: perms.join(", ")
                        }
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
        let owner = ctx.bot.users.get(s.ownerID);
        list.push({
            name: i + 1 + (index - 1) * 10 + ". " + s.name,
            value: `${s.memberCount} members, ${bots} bots (${Math.floor(
                (bots / s.memberCount) * 100
            )}%)\n${s.channels.size} channels, ${s.roles.size} roles\nOwner: ${
                owner.username
            }#${owner.discriminator} (${s.ownerID})`,
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
                                ? "<:streaming:493173082308083722> [Streaming](" +
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
                        name: "Extended Statuses",
                        value: `\uD83C\uDF10 **Web:** ${statusIcons[
                            u.clientStatus.web
                        ] +
                            " " +
                            u.clientStatus
                                .web}\n\uD83D\uDDA5 **Desktop:** ${statusIcons[
                            u.clientStatus.desktop
                        ] +
                            " " +
                            u.clientStatus
                                .desktop}\n\uD83D\uDCF1 **Mobile:** ${statusIcons[
                            u.clientStatus.mobile
                        ] +
                            " " +
                            u.clientStatus.mobile}`,
                        inline: true
                    }
                ],
                color:
                    u.game.name == "Spotify"
                        ? 0x1db954
                        : ctx.utils.topColor(ctx, msg, u.id)
            };

            if (u.game.application_id || u.game.flags == 48) {
                if (u.game.details)
                    embed.fields.push({
                        name: "Details",
                        value: u.game.details,
                        inline: true
                    });
                if (u.game.state)
                    embed.fields.push({
                        name: "State",
                        value: u.game.state,
                        inline: true
                    });
                if (u.game.party && u.game.party.size)
                    embed.fields.push({
                        name: "Party Size",
                        value: `${u.game.party.size[0]} of ${
                            u.game.party.size[1]
                        }`,
                        inline: true
                    });
                if (u.game.assets && u.game.assets.large_text)
                    embed.fields.push({
                        name: "Large Icon Text",
                        value: u.game.assets.large_text,
                        inline: true
                    });
                if (u.game.assets && u.game.assets.small_text)
                    embed.fields.push({
                        name: "Small Icon Text",
                        value: u.game.assets.small_text,
                        inline: true
                    });

                embed.thumbnail = {
                    url:
                        u.game.assets && u.game.assets.large_image
                            ? "attachment://rpcicon.png"
                            : "https://cdn.discordapp.com/emojis/543598700639813653.png"
                };
            }

            if (u.game.timestamps && u.game.timestamps.start)
                embed.fields.push({
                    name: "Time Elapsed",
                    value:
                        ctx.utils.remainingTime(
                            new Date().getTime() - u.game.timestamps.start
                        ) + " elapsed",
                    inline: true
                });
            if (u.game.timestamps && u.game.timestamps.end)
                embed.fields.push({
                    name: "End Time",
                    value:
                        ctx.utils.remainingTime(
                            u.game.timestamps.end - u.game.created_at
                        ) + " remaining",
                    inline: true
                });

            if (u.game.created_at) {
                embed.timestamp = new Date(u.game.created_at).toISOString();
                embed.footer = {
                    text: "Started at "
                };
            }

            if (u.game.assets && u.game.assets.large_image) {
                let jimp = require("jimp");

                jimp.read(
                    u.game.assets.large_image.startsWith("spotify:")
                        ? u.game.assets.large_image.replace(
                              "spotify:",
                              "http://i.scdn.co/image/"
                          )
                        : `https://cdn.discordapp.com/app-assets/${
                              u.game.application_id
                          }/${u.game.assets.large_image}.png?size=128;`
                ).then(async i => {
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
                            {
                                embed: embed
                            },
                            {
                                name: "rpcicon.png",
                                file: f
                            }
                        );
                    });
                });
            } else {
                msg.channel.createMessage({
                    embed: embed
                });
            }
        } else {
            msg.channel.createMessage(
                `**${u.username}#${
                    u.discriminator
                }** is not playing a game.\n**Status:** ${statusIcons[
                    u.status
                ] +
                    " " +
                    u.status}\n\n__**Extended Status**__\n\uD83C\uDF10 **Web:** ${statusIcons[
                    u.clientStatus.web
                ] +
                    " " +
                    u.clientStatus
                        .web}\n\uD83D\uDDA5 **Desktop:** ${statusIcons[
                    u.clientStatus.desktop
                ] +
                    " " +
                    u.clientStatus
                        .desktop}\n\uD83D\uDCF1 **Mobile:** ${statusIcons[
                    u.clientStatus.mobile
                ] +
                    " " +
                    u.clientStatus.mobile}`
            );
        }
    });
};

const emojiSets = {
    blobs: {
        url:
            "https://cdn.jsdelivr.net/gh/googlei18n/noto-emoji@e456654119cc3a5f9bebb7bbd00512456f983d2d/svg/emoji_u",
        joiner: "_",
        ext: ".svg"
    },
    "noto-old": {
        url:
            "https://cdn.jsdelivr.net/gh/googlei18n/noto-emoji@e456654119cc3a5f9bebb7bbd00512456f983d2d/svg/emoji_u",
        joiner: "_",
        ext: ".svg"
    },
    noto: {
        url: "https://gitcdn.xyz/repo/googlei18n/noto-emoji/master/svg/emoji_u",
        joiner: "_",
        ext: ".svg"
    },
    twemoji: {
        url: "https://twitter.github.io/twemoji/2/svg/",
        joiner: "-",
        ext: ".svg"
    },
    twitter: {
        url: "https://twitter.github.io/twemoji/2/svg/",
        joiner: "-",
        ext: ".svg"
    },
    mustd: {
        url:
            "https://gitcdn.xyz/repo/Mstrodl/mutant-standard-mirror/master/emoji/",
        joiner: "-",
        ext: ".svg"
    },
    mutant: {
        url:
            "https://gitcdn.xyz/repo/Mstrodl/mutant-standard-mirror/master/emoji/",
        joiner: "-",
        ext: ".svg"
    },
    mutstd: {
        url:
            "https://gitcdn.xyz/repo/Mstrodl/mutant-standard-mirror/master/emoji/",
        joiner: "-",
        ext: ".svg"
    },
    ms: {
        url:
            "https://gitcdn.xyz/repo/Mstrodl/mutant-standard-mirror/master/emoji/",
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
    },
    fb: {
        url: "https://intrnl.github.io/assetsEmoji/facebook/emoji_u",
        joiner: "_",
        ext: ".png"
    }
};

const svg2png = require("svg2png");

let jumbo = async function(ctx, msg, args) {
    let emojiNames = await ctx.libs.superagent
        .get("https://cdn.jsdelivr.net/gh/omnidan/node-emoji/lib/emoji.json")
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
            .buffer(1)
            .then(x => {
                if (emojiSets[pack].ext == ".png") {
                    msg.channel.createMessage({
                        embed: {
                            title: `${
                                emojiNames[args]
                                    ? `\\:${emojiNames[args]}\\:`
                                    : "<no shorthand>"
                            } (${emoji.toUpperCase().replace(/[-_]/g, ", ")})`,
                            url: emojiurl,
                            image: {
                                url: emojiurl
                            }
                        }
                    });
                } else {
                    svg2png(x.body ? x.body : x.text, {
                        width: 512,
                        height: 512
                    }).then(y => {
                        msg.channel.createMessage(
                            {
                                embed: {
                                    title: `${
                                        emojiNames[args]
                                            ? `\\:${emojiNames[args]}\\:`
                                            : "<no shorthand>"
                                    } (${emoji
                                        .toUpperCase()
                                        .replace(/[-_]/g, ", ")})`,
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
                    {
                        name: "ID",
                        value: id,
                        inline: true
                    },
                    {
                        name: "Full Code",
                        value: a[0].replace("<", "\\<").replace(">", "\\>"),
                        inline: true
                    },
                    {
                        name: "Animated?",
                        value: animated,
                        inline: true
                    },
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

let turkey =
    "trnsl.1.1.20150413T153034Z.d00fcc65d2f0083e.b8ed4e7ef8174912a00c422c951bf9674d64bafe"; // tr?

let langCodes = `Azerbaijan - az, Malayalam - ml, Albanian - sq, Maltese - mt, Amharic - am, Macedonian - mk, English - en, Maori - mi, Arabic - ar, Marathi - mr, Armenian - hy, Mari - mhr, Afrikaans - af, Mongolian - mn, Basque - eu, German - de, Bashkir - ba, Nepali - ne, Belarusian - be, Norwegian - no, Bengali - bn, Punjabi - pa, Burmese - my, Papiamento - pap, Bulgarian - bg, Persian - fa, Bosnian - bs, Polish - pl, Welsh - cy, Portuguese - pt, Hungarian - hu, Romanian - ro, Vietnamese - vi, Russian - ru, Haitian/Creole - ht, Cebuano - ceb, Galician - gl, Serbian - sr, Dutch - nl, Sinhala - si, Hill - Mari - mrj, Slovakian - sk, Greek - el, Slovenian - sl, Georgian - ka, Swahili - sw, Gujarati - gu, Sundanese - su, Danish - da, Tajik - tg, Hebrew - he, Thai - th, Yiddish - yi, Tagalog - tl, Indonesian - id, Tamil - ta, Irish - ga, Tatar - tt, Italian - it, Telugu - te, Icelandic - is, Turkish - tr, Spanish - es, Udmurt - udm, Kazakh - kk, Uzbek - uz, Kannada - kn, Ukrainian - uk, Catalan - ca, Urdu - ur, Kyrgyz - ky, Finnish - fi, Chinese - zh, French - fr, Korean - ko, Hindi - hi, Xhosa - xh, Croatian - hr, Khmer - km, Czech - cs, Laotian - lo, Swedish - sv, Latin - la, Scottish - gd, Latvian - lv, Estonian - et, Lithuanian - lt, Esperanto - eo, Luxembourgish - lb, Javanese - jv, Malagasy - mg, Japanese - ja, Malay - ms`;

let translate = async function(ctx, msg, args) {
    args = ctx.utils.formatArgs(args);

    if (args[0] == "languages") {
        msg.channel.createMessage({
            embed: {
                title: "Valid language codes",
                color: ctx.utils.topColor(ctx, msg, ctx.bot.user.id, 0x8060c0),
                description: `\`\`\`${langCodes}\`\`\``
            }
        });
        return;
    }

    if (args.length > 3) {
        msg.channel.createMessage(
            "Too many arguments, please wrap your to translate input in quotes."
        );
        return;
    }

    let inp = args.length == 3 ? args[2] : args[1];
    let lang1 = args.length == 3 ? args[0] : "auto";
    let lang2 = args.length == 3 ? args[1] : args[0];

    let out = await ctx.libs.superagent
        .get(
            `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${turkey}&lang=${encodeURIComponent(
                lang1 != "auto" ? lang1 + "-" + lang2 : lang2
            )}&text=${encodeURIComponent(inp)}`
        )
        .then(x => x.body.text.join(" | "))
        .catch(e => e);

    msg.channel.createMessage(
        `[${lang1} -> ${lang2}] \`${inp}\` translates to \`${out}\``
    );
};

let quote = async function(ctx, msg, args) {
    args = args.split(" ");
    let cid = "";
    let id = args[0].split("|");
    if (id.length > 1) {
        cid = id[0];
        id = id[1];
    } else {
        id = id[0];
    }
    const quote = args.length > 1 ? args.slice(1).join(" ") : "";

    try {
        const message =
            cid !== ""
                ? await msg.channel.guild.channels.get(cid).getMessage(id)
                : await msg.channel.getMessage(id);

        const embed = {
            author: {
                name: `${message.author.username}#${
                    message.author.discriminator
                }`,
                icon_url: message.author.avatarURL
            },
            description: message.content,
            color: ctx.utils.topColor(ctx, msg, message.author.id),
            timestamp: new Date(message.timestamp).toISOString(),
            fields: [
                {
                    name: "Jump to",
                    value: `https://canary.discordapp.com/channels/${
                        msg.channel.guild.id
                    }/${message.channel.id}/${message.id}`
                }
            ]
        };
        if (message.attachments.length > 0) {
            embed.image = {
                url: message.attachments[0].url
            };
        }

        msg.channel.createMessage({
            content:
                quote === ""
                    ? `Quoted by **${msg.author.username}#${
                          msg.author.discriminator
                      }**`
                    : `**${msg.author.username}#${
                          msg.author.discriminator
                      }:** ${quote}`,
            embed: embed
        });

        msg.delete().catch(_ => {});
    } catch (e) {
        msg.channel.createMessage(
            `<@${
                msg.author.id
            }> Message not found. Are you in the right channel?`
        );
    }
};

let charinfo = async function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage("Arguments required.");
        return;
    }

    let out = ctx.utils.unilib
        .getNamesFromString(args)
        .map(
            x =>
                `\`\\u${x[0]}\`: ${x[1]} - ${String.fromCodePoint(
                    `0x${x[0]}`
                )} \u2014 <http://www.fileformat.info/info/unicode/char/${
                    x[0]
                }>`
        )
        .join("\n");

    if (out.toString().length > 2000) {
        let output = out.toString();
        ctx.libs.superagent
            .post("https://mystb.in/documents")
            .send(output)
            .then(res => {
                let key = res.body.key;
                msg.channel.createMessage(
                    `\u2705 Output too long to send in a message: https://mystb.in/${key}.js`
                );
            })
            .catch(e => {
                msg.channel.createMessage(
                    `Could not upload output to Mystbin.`
                );
            });
    } else {
        msg.channel.createMessage(out);
    }
};

module.exports = [
    {
        name: "avatar",
        desc: "Get the avatar of a user.",
        func: avatar,
        usage: "[user]",
        group: "utils",
        aliases: ["pfp"]
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
        fulldesc: `
Mods are defined as members which have any of those permissions:
 - Kick Members.
 - Manage Messages on the channel the command is coming from.
        `,
        func: mods,
        group: "utils"
    },
    /*{
        name: "binfo",
        desc: "Displays info on a bot or lists a users bots if any.",
        func: binfo,
        usage: "[user]",
        group: "utils"
    },*/
    {
        name: "uinfo",
        desc: "Get info on a user.",
        func: uinfo,
        group: "utils",
        aliases: ["userinfo", "user"]
    },
    {
        name: "sinfo",
        desc: "Displays info of a server",
        func: sinfo,
        group: "utils",
        aliases: ["ginfo", "guildinfo", "serverinfo", "guild", "server"]
    },
    {
        name: "rinfo",
        desc: "Displays info of a role",
        func: rinfo,
        group: "utils",
        aliases: ["roleinfo", "role"]
    },
    {
        name: "cflake",
        desc: "Converts a Discord snowflake to a readable time.",
        fulldesc: `
Snowflakes are Discord's way of identifying any kind of object (
server, channel, user, role).

You can enable fetching of those Snowflakes by going to your
Discord client configuration, and enable \`Developer Mode\` in
the \`Appearance\` menu (then right clicking on an object and
pressing \`Copy ID\`).

This command only gives the date of when the Snowflake was
generated, not any other info or what type it is.
        `,
        func: cflake,
        group: "utils",
        aliases: ["snowflake"]
    },
    {
        name: "slist",
        desc: "Server list of servers HiddenPhox is in.",
        func: slist,
        group: "utils",
        aliases: ["servers", "serverlist"]
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
        group: "utils",
        aliases: ["e", "emote", "emoji"]
    },
    {
        name: "einfo",
        desc: "Get info of an emoji.",
        func: einfo,
        group: "utils",
        aliases: ["emoteinfo", "emojiinfo"]
    },
    {
        name: "translate",
        desc: "Translate text from one language to another.",
        func: translate,
        group: "utils",
        aliases: ["tr"]
    },
    {
        name: "quote",
        desc: "Inline quote a message.",
        fulldesc: `
**This does not work like dogbot's quotes**, you cannot store them for later, nor quote multiple messages at once.

Allows you to inline quote messages.
Use \`channelid|messageid\` to crosschannel quote.
If the bot has Manage Messages, it'll delete your regular command message.`,
        func: quote,
        group: "utils",
        aliases: ["q"]
    },
    {
        name: "charinfo",
        desc: "Get information on a character or string of characters.",
        func: charinfo,
        group: "utils",
        aliases: ["char", "character"]
    }
];
