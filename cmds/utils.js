const jimp = require("jimp");
const path = require("path");
const superagent = require("superagent");

const statusIcons = {
    online: "<:online:493173082421461002>",
    idle: "<:idle:493173082006093836>",
    dnd: "<:dnd:493173082261815307>",
    offline: "<:offline:493173082253426688>",
};

async function avatar(ctx, msg, args) {
    if (args && (args == "--server" || args == "--guild")) {
        if (!msg.channel.guild) {
            msg.channel.createMessage(
                "`--server/--guild` can only be used in guilds."
            );
        } else {
            msg.channel.createMessage({
                embed: {
                    title: `Server Icon:`,
                    image: {
                        url: `https://cdn.discordapp.com/icons/${
                            msg.channel.guild.id
                        }/${msg.channel.guild.icon}.${
                            msg.channel.guild.icon.startsWith("a_")
                                ? "gif?size=1024&_=.gif"
                                : "png?size=1024"
                        }`,
                    },
                },
            });
        }
    } else {
        const user = await ctx.utils
            .lookupUser(ctx, msg, args ? args : msg.author.mention)
            .catch((m) => {
                if (m == "No results." || m == "Canceled") {
                    msg.channel.createMessage(m);
                } else {
                    ctx.utils.logWarn(ctx, "Exception in command: " + m);
                }
            });

        if (!user) return;

        const av = `https://cdn.discordapp.com/avatars/${user.id}/${
            user.avatar
        }.${
            user.avatar.startsWith("a_")
                ? "gif?size=1024&_=.gif"
                : "png?size=1024"
        }`;
        msg.channel.createMessage({
            embed: {
                title: `Avatar for **${user.username}#${user.discriminator}**:`,
                image: {
                    url: av,
                },
            },
        });
    }
}

let cflake = function (ctx, msg, args) {
    let twitter = false;
    if (args.startsWith("--twitter")) {
        twitter = true;
        args = args.replace("--twitter ", "");
    }
    if (!isNaN(parseInt(args))) {
        let snowflake = parseInt(args).toString(2);
        snowflake = "0".repeat(64 - snowflake.length) + snowflake;
        let date = snowflake.substr(0, 42);
        let timestamp =
            parseInt(date, 2) + (twitter ? 1288834974657 : 1420070400000);

        msg.channel.createMessage(
            `The timestamp for \`${args}\` is ${new Date(timestamp)}`
        );
    } else {
        msg.channel.createMessage("Arguments not a number.");
    }
};

let linvite = async function (ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage("No invite code passed.");
        return;
    }
    let data = await superagent
        .get(`https://discordapp.com/api/v7/invites/${args}?with_counts=1`)
        .set("User-Agent", "HiddenPhox (v9, Eris)")
        .set("Content-Type", "application/json")
        .set("Authorization", ctx.bot.token)
        .catch((x) => {
            msg.channel.createMessage("Invite provided is not valid.");
            return;
        });
    if (!data) return;
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
                    inline: true,
                },
                {
                    name: "Channel",
                    value: `**#${inv.channel.name}** (${inv.channel.id})`,
                    inline: true,
                },
                {
                    name: "Member Count",
                    value: `${statusIcons["online"]}${inv.approximate_presence_count} online\t\t${statusIcons["offline"]} ${inv.approximate_member_count} members`,
                    inline: false,
                },
                {
                    name: "Features",
                    value:
                        inv.guild.features && inv.guild.features.length > 0
                            ? `${inv.guild.features
                                  .map((feature) =>
                                      feature
                                          .split("_")
                                          .map(
                                              (x) =>
                                                  x[0] +
                                                  x.substring(1).toLowerCase()
                                          )
                                          .join(" ")
                                  )
                                  .join(", ")}`
                            : "None",
                    inline: false,
                },
            ],
            thumbnail: {
                url:
                    inv.guild.icon !== null
                        ? `https://cdn.discordapp.com/icons/${inv.guild.id}/${
                              inv.guild.icon
                          }.${
                              inv.guild.icon.startsWith("a_")
                                  ? "gif?size=1024&_=.gif"
                                  : "png?size=1024"
                          }`
                        : null,
            },
        };

        if (inv.inviter) {
            edata.fields.push({
                name: "Inviter",
                value: `**${inv.inviter.username}#${inv.inviter.discriminator}** (${inv.inviter.id})`,
                inline: true,
            });
        }

        if (inv.guild.icon || inv.guild.splash) {
            edata.fields.push({
                name: "\u200b",
                value: `${
                    inv.guild.icon !== null
                        ? `[Icon](https://cdn.discordapp.com/icons/${
                              inv.guild.id
                          }/${inv.guild.icon}.${
                              inv.guild.icon.startsWith("a_")
                                  ? "gif?size=1024&_=.gif"
                                  : "png?size=1024"
                          })`
                        : ""
                }${
                    inv.guild.splash !== null
                        ? ` | [Splash](https://cdn.discordapp.com/splashes/${inv.guild.id}/${inv.guild.splash}.png?size=2048)`
                        : ""
                }`,
                inline: false,
            });
        }

        if (inv.guild.splash !== null) {
            edata.image = {
                url: `https://cdn.discordapp.com/splashes/${inv.guild.id}/${inv.guild.splash}.png?size=256`,
            };
        }

        msg.channel.createMessage({
            embed: edata,
        });
    }
};

let mods = function (ctx, msg, args) {
    if (msg.channel.guild) {
        if (!args) {
            let res = "Moderators for **" + msg.channel.guild.name + "**:";

            let a = {
                online: "",
                idle: "",
                dnd: "",
                offline: "",
            };

            for (const u of msg.channel.guild.members.values()) {
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
            }

            for (s in a) {
                res += a[s];
            }
            msg.channel.createMessage(res);
        } else if (args == "online" || args == "o") {
            let res =
                "Online moderators for **" + msg.channel.guild.name + "**:";

            for (const u of msg.channel.guild.members.values()) {
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
            }
            msg.channel.createMessage(res);
        }
    } else {
        msg.channel.createMessage("Command cannot be used outside of servers.");
    }
};

/*async function binfo(ctx, msg, args) {
    let u = await ctx.utils
        .lookupUser(ctx, msg, args || msg.author.mention)
        .catch(m => {
            if (m == "No results." || m == "Canceled") {
                msg.channel.createMessage(m);
            }
        });

    if (u.bot) {
        let req = await superagent
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
        let req = await superagent
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
                `**${u.username}#${u.discriminator}** owns **${bots.length} bot(s)**:\n\n` +
                bots.join("\n"),
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
};*/

const status_types = [
    "Playing",
    "Streaming",
    "Listening to",
    "Watching",
    "Custom Status",
];

async function uinfo(ctx, msg, args) {
    let user = await ctx.utils
        .lookupUser(ctx, msg, args || msg.author.id)
        .catch((m) => {
            if (m == "No results." || m == "Canceled") {
                msg.channel.createMessage(m);
            } else {
                ctx.utils.logWarn(ctx, "Exception in command: " + m);
            }
        });

    if (!user) return;

    if (msg.channel.guild && msg.channel.guild.members.get(user.id)) {
        user = msg.channel.guild.members.get(user.id);
        let embed = {
            color: ctx.utils.topColor(ctx, msg, user.id),
            title: `User Info: \`${user.username}#${user.discriminator}\` ${
                user.bot ? "<:boat:546212361472835584>" : ""
            }`,
            fields: [
                {
                    name: "ID",
                    value: user.id,
                    inline: true,
                },
                {
                    name: "Nickname",
                    value: user.nick ? user.nick : "None",
                    inline: true,
                },
                {
                    name: "Status",
                    value: user.game
                        ? user.game.url
                            ? "<:streaming:493173082308083722> [Streaming](" +
                              user.game.url +
                              ")"
                            : statusIcons[user.status] + " " + user.status
                        : statusIcons[user.status] + " " + user.status,
                    inline: true,
                },
                {
                    name: status_types[(user.game && user.game.type) || 0],
                    value: `${
                        user.game && user.game.emoji
                            ? user.game.emoji.id &&
                              ctx.emotes.get(user.game.emoji.id)
                                ? `<${user.game.emoji.animated ? "a" : ""}:_:${
                                      user.game.emoji.id
                                  }> `
                                : user.game.emoji.id
                                ? ""
                                : user.game.emoji.name + " "
                            : ""
                    }${
                        user.game
                            ? user.game.type == 4
                                ? user.game.state
                                    ? user.game.state
                                    : ctx.emotes.get(user.game.emoji.id)
                                    ? ""
                                    : "<bot doesnt have emote> "
                                : user.game.name
                            : "Nothing"
                    }`,
                    inline: true,
                },
                {
                    name: "Roles",
                    value: user.guild
                        ? user.roles.length > 0
                            ? user.roles.map((r) => `<@&${r}>`).join(", ")
                            : "No roles"
                        : "No roles",
                    inline: true,
                },
                {
                    name: "Shared Servers",
                    value: `${
                        ctx.bot.guilds.filter((a) => a.members.get(user.id))
                            .length
                    } servers`,
                    inline: true,
                },
                {
                    name: "Created At",
                    value: `${new Date(
                        user.createdAt
                    ).toUTCString()} (${ctx.utils.toReadableTime(
                        Date.now() - user.createdAt
                    )} ago)`,
                    inline: true,
                },
                {
                    name: "Joined At",
                    value: `${new Date(
                        user.joinedAt
                    ).toUTCString()} (${ctx.utils.toReadableTime(
                        Date.now() - user.joinedAt
                    )} ago)`,
                    inline: true,
                },
                {
                    name: "Avatar",
                    value:
                        user.avatar !== null
                            ? `[Full Size](https://cdn.discordapp.com/avatars/${
                                  user.id
                              }/${user.avatar}.${
                                  user.avatar.startsWith("a_") ? "gif" : "png"
                              }?size=1024)`
                            : `[Full Size](https://cdn.discordapp.com/embed/avatars/${
                                  user.discriminator % 5
                              }.png)`,
                    inline: true,
                },
            ],
            thumbnail: {
                url:
                    user.avatar !== null
                        ? `https://cdn.discordapp.com/avatars/${user.id}/${
                              user.avatar
                          }.${
                              user.avatar.startsWith("a_")
                                  ? "gif"
                                  : "png?size=256"
                          }`
                        : `https://cdn.discordapp.com/embed/avatars/${
                              user.discriminator % 5
                          }.png`,
            },
        };

        msg.channel.createMessage({
            embed: embed,
        });
    } else {
        let snowflake = parseInt(user.id).toString(2);
        snowflake = "0".repeat(64 - snowflake.length) + snowflake;
        const date = snowflake.substr(0, 42);
        const createdAt = parseInt(date, 2) + 1420070400000;

        let embed = {
            color: 0x7289da,

            title: `User Info: \`${user.username}#${user.discriminator}\` ${
                user.bot ? "<:boat:546212361472835584>" : ""
            }`,
            fields: [
                {
                    name: "ID",
                    value: user.id,
                    inline: true,
                },
                {
                    name: "Shared Servers",
                    value: `${
                        ctx.bot.guilds.filter((a) => a.members.get(user.id))
                            .length
                    } servers`,
                    inline: true,
                },
                {
                    name: "Created At",
                    value: `${new Date(
                        createdAt
                    ).toUTCString()} (${ctx.utils.toReadableTime(
                        Date.now() - createdAt
                    )} ago)`,
                    inline: true,
                },
                {
                    name: "Avatar",
                    value:
                        user.avatar !== null
                            ? `[Full Size](https://cdn.discordapp.com/avatars/${
                                  user.id
                              }/${user.avatar}.${
                                  user.avatar.startsWith("a_")
                                      ? "gif"
                                      : "png?size=1024"
                              })`
                            : `[Full Size](https://cdn.discordapp.com/embed/avatars/${
                                  user.discriminator % 5
                              }.png)`,
                    inline: true,
                },
            ],
            thumbnail: {
                url:
                    user.avatar !== null
                        ? `https://cdn.discordapp.com/avatars/${user.id}/${
                              user.avatar
                          }.${
                              user.avatar.startsWith("a_")
                                  ? "gif"
                                  : "png?size=256"
                          }`
                        : `https://cdn.discordapp.com/embed/avatars/${
                              user.discriminator % 5
                          }.png`,
            },
        };

        msg.channel.createMessage({
            embed: embed,
        });
    }
}

const region_flags = {
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
    russia: ":flag_ru:",
};

const verification_levels = [
    "None",
    "Low",
    "Medium",
    "(╯°□°）╯︵ ┻━┻ (High)",
    "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻ (Very High/Phone)",
];
const notification_types = ["All Messages", "Mentions Only"];
const emoji_tiers = [100, 200, 300, 500]; //double the count because each category has the limit
const boost_tiers = [2, 10, 20, 20];

async function sinfo(ctx, msg, args) {
    if (!msg.channel.guild) {
        msg.channel.createMessage("This command can only be used in servers.");
        return;
    }

    const guild = msg.channel.guild;

    const bots = guild.members.filter((u) => u.bot).length;
    const everyone = guild.roles.filter((x) => x.name == "@everyone")[0];

    const info = {
        color: ctx.utils.topColor(ctx, msg, ctx.bot.user.id),
        title: `Server Info for \`${guild.name}\``,
        fields: [
            {
                name: "ID",
                value: guild.id,
                inline: true,
            },
            {
                name: "Owner",
                value: `<@${guild.ownerID}>`,
                inline: true,
            },
            {
                name: "Total Members",
                value: guild.memberCount,
                inline: true,
            },
            {
                name: "Humans",
                value: `${guild.memberCount - bots} (${Math.round(
                    ((guild.memberCount - bots) / guild.memberCount) * 100
                )}% of members)`,
                inline: true,
            },
            {
                name: "Bots",
                value: `${bots} (${Math.round(
                    (bots / guild.memberCount) * 100
                )}% of members)`,
                inline: true,
            },
            {
                name: "Channels",
                value: `${guild.channels.size}/500 (${
                    guild.channels.filter((x) => x.type == 0).length
                } text, ${
                    guild.channels.filter((x) => x.type == 2).length
                } voice, ${
                    guild.channels.filter((x) => x.type == 4).length
                } categories, ${
                    guild.channels.filter(
                        (x) =>
                            x.permissionOverwrites &&
                            x.permissionOverwrites.get(everyone.id) &&
                            x.permissionOverwrites.get(everyone.id).json
                                .readMessages == false
                    ).length
                } hidden, ${guild.channels.filter((x) => x.nsfw).length} NSFW)`,
                inline: true,
            },
            {
                name: "Region",
                value:
                    (region_flags[guild.region] || ":flag_black:") +
                    " " +
                    (guild.region || "Unknown Region???"),
                inline: true,
            },
            {
                name: "Shard",
                value: guild.shard.id,
                inline: true,
            },
            {
                name: "Roles",
                value: `${guild.roles.size}/250 (${
                    guild.roles.filter((x) => x.managed).length
                } managed)`,
                inline: true,
            },
            {
                name: "Emoji Count",
                value: `${guild.emojis.length}/${
                    emojiTiers[guild.premiumTier]
                } (${guild.emojis.filter((x) => x.animated).length} animated, ${
                    guild.emojis.filter((x) => x.managed).length
                } managed)`,
                inline: true,
            },
            {
                name: "Created At",
                value: new Date(guild.createdAt).toUTCString(),
                inline: true,
            },
            {
                name: "Verification Level",
                value: verification_levels[guild.verificationLevel],
                inline: true,
            },
            {
                name: "Voice AFK",
                value: `Timeout: ${guild.afkTimeout}s\nChannel: ${
                    guild.afkChannelID == null
                        ? "None"
                        : `<#${guild.afkChannelID}>`
                }`,
                inline: true,
            },
            {
                name: "Default Notifications",
                value: notification_types[guild.defaultNotifications],
                inline: true,
            },
            {
                name: "MFA For Perms",
                value: guild.mfaLevel == 0 ? "False" : "True",
                inline: true,
            },
            {
                name: 'Considered "Large"',
                value: guild.large,
                inline: true,
            },
            {
                name: "Nitro Boost Tier",
                value: `Tier ${guild.premiumTier} with ${
                    guild.premiumSubscriptionCount
                }/${boost_tiers[guild.premiumTier]} boosters.`,
                inline: true,
            },
            {
                name: `Icon${guild.splash ? "/Splash" : ""}${
                    guild.banner ? "/Banner" : ""
                }`,
                value:
                    `[Full Size](https://cdn.discordapp.com/icons/${guild.id}/${
                        guild.icon
                    }.${
                        guild.icon.startsWith("a_")
                            ? "gif?size=1024&_=.gif"
                            : "png?size=1024"
                    })` +
                    (guild.splash
                        ? ` | [Invite Splash](https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.png?size=2048)`
                        : "") +
                    (guild.banner
                        ? ` | [Banner](https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=2048)`
                        : ""),
                inline: true,
            },
        ],
        thumbnail: {
            url: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${
                guild.icon.startsWith("a_")
                    ? "gif?size=256&_=.gif"
                    : "png?size=256"
            }`,
        },
    };

    if (guild.features && guild.features.length > 0) {
        info.fields.push({
            name: "Features",
            value: `${guild.features
                .map((feature) =>
                    feature
                        .split("_")
                        .map((x) => x[0] + x.substring(1).toLowerCase())
                        .join(" ")
                )
                .join(", ")}`,
            inline: true,
        });
    }

    if (guild.vanityURL) {
        info.fields.push({
            name: "Vanity URL",
            value: `\`discord.gg/${guild.vanityURL}\``,
            inline: true,
        });
    }

    msg.channel.createMessage({
        embed: info,
    });
}

async function emotes(ctx, msg, args) {
    if (!msg.channel.guild) {
        msg.channel.createMessage("This command can only be used in servers.");
        return;
    }

    if (msg.channel.guild.emojis.length == 0) {
        msg.channel.createMessage("Server has no emojis.");
        return;
    }

    const embed = {
        color: ctx.utils.topColor(ctx, msg, ctx.bot.user.id),
        title: `Emojis for \`${msg.channel.guild.name}\``,
        fields: [],
    };

    const emojis = [];
    for (const emote of msg.channel.guild.emojis.values()) {
        const hasRole = false;

        for (const role of emote.roles.values()) {
            if (
                msg.channel.guild.members
                    .get(ctx.bot.user.id)
                    .roles.includes(role)
            )
                hasRole = true;
        }

        if (emote.managed && hasRole == false) return;
        emojis.push(`<${emote.animated ? "a" : ""}:${emote.name}:${emote.id}>`);
    }

    emojis = emojis.sort(function (a, b) {
        a = a.toLowerCase().replace(/<(a)?:(.+):(.+)>/, "$2");
        b = b.toLowerCase().replace(/<(a)?:(.+):(.+)>/, "$2");
        return a < b ? 1 : a > b ? -1 : 0;
    });

    const tmp = [];
    for (const emote of emojis.values()) {
        tmp.push(emote.replace(/:(.*?):/, ":_:"));
    }
    emojis = tmp;
    delete tmp;

    const index = 0;
    for (const i = 0; i < emojis.length; i += 25) {
        embed.fields.push({
            name: `${25 * index + 1} - ${25 * (index + 1)}`,
            value: emojis.slice(25 * index, 25 * (index + 1)).join(" "),
            inline: true,
        });
        index++;
    }

    msg.channel.createMessage({
        embed: embed,
    });
}

async function rinfo(ctx, msg, args) {
    const role = await ctx.utils.lookupRole(ctx, msg, args || "").catch((m) => {
        if (m == "No results." || m == "Canceled") {
            msg.channel.createMessage(m);
        }
    });

    if (!role) return;

    let users = 0;
    let bots = 0;
    for (const m of msg.channel.guild.members.values()) {
        if (m.roles.indexOf(role.id) > -1) {
            if (m.bot) bots++;
            users++;
        }
    }

    let perms = [];
    for (const k in role.permissions.json) {
        perms.push(
            `${role.permissions.json[k] == true ? "\u2705" : "\u274C"} ${k}`
        );
    }

    if (perms.length == 0) {
        perms.push("None");
    }
    msg.channel.createMessage({
        embed: {
            color: role.color,

            title: `Role Info: \`${role.name}\``,
            fields: [
                {
                    name: "ID",
                    value: role.id,
                    inline: true,
                },
                {
                    name: "Color",
                    value: role.color
                        ? "#" +
                          (role.color.toString(16).length < 6
                              ? "0".repeat(6 - role.color.toString(16).length)
                              : "") +
                          role.color.toString(16).toUpperCase()
                        : "None",
                    inline: true,
                },
                {
                    name: "Users in role",
                    value: users,
                    inline: true,
                },
                {
                    name: "Bots in role",
                    value: bots,
                    inline: true,
                },
                {
                    name: "Mentionable",
                    value: role.mentionable ? role.mentionable : "false",
                    inline: true,
                },
                {
                    name: "Managed",
                    value: role.managed ? role.managed : "false",
                    inline: true,
                },
                {
                    name: "Position",
                    value: role.position,
                    inline: true,
                },
                {
                    name: "Permissions",
                    value: perms.join(", "),
                },
            ],
        },
    });
}

let slist = function (ctx, msg, args) {
    let servers = [];

    for (const s of ctx.bot.guilds.values()) {
        servers.push(s);
    }

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
        let bots = s.members.filter((u) => u.bot).length;
        let owner = ctx.bot.users.get(s.ownerID);
        list.push({
            name: i + 1 + (index - 1) * 10 + ". " + s.name,
            value: `${s.memberCount} members, ${bots} bots (${Math.floor(
                (bots / s.memberCount) * 100
            )}%)\n${s.channels.size} channels, ${s.roles.size} roles\nOwner: ${
                owner.username
            }#${owner.discriminator} (${s.ownerID})`,
            inline: true,
        });
    });

    msg.channel.createMessage({
        embed: {
            title: "Server List",
            fields: list,
            footer: {
                text: `Page ${index} of ${Math.floor(
                    ctx.bot.guilds.size / 10
                )} | ${ctx.bot.guilds.size} total servers`,
            },
        },
    });
};

let presence = function (ctx, msg, args) {
    if (!msg.channel.guild) {
        msg.channel.createMessage(
            "Can only be used in guilds due to API limitations."
        );
        return;
    }

    ctx.utils.lookupUser(ctx, msg, args || msg.member.mention).then((u) => {
        u = msg.channel.guild.members.get(u.id);

        if (u.game && u.game.type != 4) {
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
                        inline: true,
                    },
                    {
                        name: status_types[(u.game && u.game.type) || 0],
                        value: u.game ? u.game.name : "Nothing",
                        inline: true,
                    },
                    {
                        name: "Extended Statuses",
                        value: `\uD83C\uDF10 **Web:** ${
                            statusIcons[u.clientStatus.web] +
                            " " +
                            u.clientStatus.web
                        }\n\uD83D\uDDA5 **Desktop:** ${
                            statusIcons[u.clientStatus.desktop] +
                            " " +
                            u.clientStatus.desktop
                        }\n\uD83D\uDCF1 **Mobile:** ${
                            statusIcons[u.clientStatus.mobile] +
                            " " +
                            u.clientStatus.mobile
                        }`,
                        inline: true,
                    },
                ],
                color:
                    u.game.name == "Spotify"
                        ? 0x1db954
                        : ctx.utils.topColor(ctx, msg, u.id),
            };

            if (u.game.application_id || u.game.flags == 48) {
                if (u.game.details)
                    embed.fields.push({
                        name: "Details",
                        value: u.game.details,
                        inline: true,
                    });
                if (u.game.state)
                    embed.fields.push({
                        name: "State",
                        value: u.game.state,
                        inline: true,
                    });
                if (u.game.party && u.game.party.size)
                    embed.fields.push({
                        name: "Party Size",
                        value: `${u.game.party.size[0]} of ${u.game.party.size[1]}`,
                        inline: true,
                    });
                if (u.game.assets && u.game.assets.large_text)
                    embed.fields.push({
                        name: "Large Icon Text",
                        value: u.game.assets.large_text,
                        inline: true,
                    });
                if (u.game.assets && u.game.assets.small_text)
                    embed.fields.push({
                        name: "Small Icon Text",
                        value: u.game.assets.small_text,
                        inline: true,
                    });

                embed.thumbnail = {
                    url:
                        u.game.assets && u.game.assets.large_image
                            ? "attachment://rpcicon.png"
                            : "https://cdn.discordapp.com/emojis/543598700639813653.png",
                };
            }

            if (u.game.timestamps && u.game.timestamps.start)
                embed.fields.push({
                    name: "Time Elapsed",
                    value:
                        ctx.utils.remainingTime(
                            new Date().getTime() - u.game.timestamps.start
                        ) + " elapsed",
                    inline: true,
                });
            if (u.game.timestamps && u.game.timestamps.end)
                embed.fields.push({
                    name: "End Time",
                    value:
                        ctx.utils.remainingTime(
                            u.game.timestamps.end - u.game.created_at
                        ) + " remaining",
                    inline: true,
                });

            if (u.game.created_at) {
                embed.timestamp = new Date(u.game.created_at).toISOString();
                embed.footer = {
                    text: "Started at ",
                };
            }

            if (u.game.assets && u.game.assets.large_image) {
                jimp.read(
                    u.game.assets.large_image.startsWith("spotify:")
                        ? u.game.assets.large_image.replace(
                              "spotify:",
                              "http://i.scdn.co/image/"
                          )
                        : `https://cdn.discordapp.com/${path.normalize(
                              `app-assets/${u.game.application_id}/${u.game.assets.large_image}.png?size=128`
                          )}`
                ).then(async (i) => {
                    let a = i.clone().resize(96, jimp.AUTO);
                    let b =
                        u.game.assets && u.game.assets.small_image
                            ? `https://cdn.discordapp.com/${path.normalize(
                                  `app-assets/${u.game.application_id}/${u.game.assets.small_image}.png?size=128`
                              )}`
                            : "";

                    if (b.length > 0) {
                        b = await jimp.read(b);
                        b = b.resize(32, jimp.AUTO);
                        a.composite(b, 96 - 32, 96 - 32);
                    }

                    a.getBuffer(jimp.MIME_PNG, (e, f) => {
                        msg.channel.createMessage(
                            {
                                embed: embed,
                            },
                            {
                                name: "rpcicon.png",
                                file: f,
                            }
                        );
                    });
                });
            } else {
                msg.channel.createMessage({
                    embed: embed,
                });
            }
        } else if (
            u.game &&
            u.game.type == 4 &&
            u.game.name == "Custom Status"
        ) {
            msg.channel.createMessage(
                `**${u.username}#${u.discriminator}**: ${
                    u.game && u.game.emoji
                        ? u.game.emoji.id && ctx.emotes.get(u.game.emoji.id)
                            ? `<${u.game.emoji.animated ? "a" : ""}:_:${
                                  u.game.emoji.id
                              }> `
                            : u.game.emoji.id
                            ? ""
                            : u.game.emoji.name + " "
                        : ""
                }${u.game.state ? u.game.state : ""}\n**Status:** ${
                    statusIcons[u.status] + " " + u.status
                }\n\n__**Extended Status**__\n\uD83C\uDF10 **Web:** ${
                    statusIcons[u.clientStatus.web] + " " + u.clientStatus.web
                }\n\uD83D\uDDA5 **Desktop:** ${
                    statusIcons[u.clientStatus.desktop] +
                    " " +
                    u.clientStatus.desktop
                }\n\uD83D\uDCF1 **Mobile:** ${
                    statusIcons[u.clientStatus.mobile] +
                    " " +
                    u.clientStatus.mobile
                }`
            );
        } else {
            msg.channel.createMessage(
                `**${u.username}#${
                    u.discriminator
                }** is not playing a game.\n**Status:** ${
                    statusIcons[u.status] + " " + u.status
                }\n\n__**Extended Status**__\n\uD83C\uDF10 **Web:** ${
                    statusIcons[u.clientStatus.web] + " " + u.clientStatus.web
                }\n\uD83D\uDDA5 **Desktop:** ${
                    statusIcons[u.clientStatus.desktop] +
                    " " +
                    u.clientStatus.desktop
                }\n\uD83D\uDCF1 **Mobile:** ${
                    statusIcons[u.clientStatus.mobile] +
                    " " +
                    u.clientStatus.mobile
                }`
            );
        }
    });
};

const emojiSets = {
    blobs: {
        url:
            "https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@e456654119cc3a5f9bebb7bbd00512456f983d2d/svg/emoji_u",
        joiner: "_",
        ext: ".svg",
    },
    noto: {
        url: "gitcdn.xyz/repo/googlefonts/noto-emoji/master/svg/emoji_u",
        joiner: "_",
        ext: ".svg",
    },
    twemoji: {
        url: "https://twemoji.maxcdn.com/v/latest/svg/",
        joiner: "-",
        ext: ".svg",
    },
    mustd: {
        url:
            "https://cdn.jsdelivr.net/gh/Mstrodl/mutant-standard-mirror@eb06c291bb13eea305d92bcebbb308fc87a84d09/emoji/",
        joiner: "-",
        ext: ".svg",
    },
    apple: {
        url: "https://intrnl.github.io/assetsEmoji/AppleColor/emoji_u",
        joiner: "_",
        ext: ".png",
    },
    facebook: {
        url: "https://intrnl.github.io/assetsEmoji/facebook/emoji_u",
        joiner: "_",
        ext: ".png",
    },
};
emojiSets["noto-old"] = emojiSets.blobs;
emojiSets.mutant = emojiSets.mustd;
emojiSets.mutstd = emojiSets.mustd;
emojiSets.ms = emojiSets.mustd;
emojiSets.twitter = emojiSets.twemoji;
emojiSets.fb = emojiSets.facebook;

const svg2png = require("svg2png");

let jumbo = async function (ctx, msg, args) {
    let emojiNames = await superagent
        .get("https://unpkg.com/emoji.json/emoji.json")
        .then((x) => x.body);
    let temp = [];
    emojiNames.map((x) => (temp[x.char] = x.name.replace(/ /g, "_")));
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
                    }?v=1`,
                },
            },
        });
    } else {
        let pack = "twemoji";
        for (const x in emojiSets) {
            if (args.startsWith(`--${x} `)) {
                pack = x;
                args = args.replace(`--${x} `, "");
            }
        }
        let emoji = Array.from(args)
            .map((x) => x.codePointAt().toString(16))
            .join(emojiSets[pack].joiner);
        let emojiurl = emojiSets[pack].url + emoji + emojiSets[pack].ext;
        superagent
            .get(emojiurl)
            .buffer(1)
            .then((x) => {
                if (emojiSets[pack].ext == ".png") {
                    msg.channel.createMessage({
                        embed: {
                            title: `${
                                emojiNames[args]
                                    ? `\\:${emojiNames[args]}\\:`
                                    : ctx.utils.unilib.getNamesFromString(
                                          args
                                      )[0][1]
                            } (${emoji.toUpperCase().replace(/[-_]/g, ", ")})`,
                            url: emojiurl,
                            image: {
                                url: emojiurl,
                            },
                        },
                    });
                } else {
                    svg2png(x.body ? x.body : x.text, {
                        width: 512,
                        height: 512,
                    }).then((y) => {
                        msg.channel.createMessage(
                            {
                                embed: {
                                    title: `${
                                        emojiNames[args]
                                            ? `\\:${emojiNames[args]}\\:`
                                            : ctx.utils.unilib.getNamesFromString(
                                                  args
                                              )[0][1]
                                    } (${emoji
                                        .toUpperCase()
                                        .replace(/[-_]/g, ", ")})`,
                                    url: emojiurl,
                                    image: {
                                        url: "attachment://emoji.png",
                                    },
                                },
                            },
                            {
                                file: y,
                                name: "emoji.png",
                            }
                        );
                    });
                }
            })
            .catch((e) => {
                msg.channel.createMessage(
                    "Emote not found. The emoji set chosen might not have this emote as an image."
                );
            });
    }
};

let einfo = function (ctx, msg, args) {
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
                        inline: true,
                    },
                    {
                        name: "Full Code",
                        value: a[0].replace("<", "\\<").replace(">", "\\>"),
                        inline: true,
                    },
                    {
                        name: "Animated?",
                        value: animated,
                        inline: true,
                    },
                    {
                        name: "Guild",
                        value: guild
                            ? `${guild.name} \`(${guild.id})\``
                            : "Not found",
                        inline: true,
                    },
                ],
                thumbnail: {
                    url: `https://cdn.discordapp.com/emojis/${id}.${
                        animated ? "gif" : "png"
                    }?v=1`,
                },
            },
        });
    } else {
        msg.channel.createMessage(
            "Emote not found. This currently only works for custom ones."
        );
    }
};

const turkey =
    "trnsl.1.1.20150413T153034Z.d00fcc65d2f0083e.b8ed4e7ef8174912a00c422c951bf9674d64bafe"; // tr?

const langCodes = [
    "Afrikaans - af",
    "Albanian - sq",
    "Amharic - am",
    "Arabic - ar",
    "Armenian - hy",
    "Azerbaijan - az",
    "Bashkir - ba",
    "Basque - eu",
    "Belarusian - be",
    "Bengali - bn",
    "Bosnian - bs",
    "Bulgarian - bg",
    "Burmese - my",
    "Catalan - ca",
    "Cebuano - ceb",
    "Chinese - zh",
    "Croatian - hr",
    "Czech - cs",
    "Danish - da",
    "Dutch - nl",
    "English - en",
    "Esperanto - eo",
    "Estonian - et",
    "Finnish - fi",
    "French - fr",
    "Galician - gl",
    "Georgian - ka",
    "German - de",
    "Greek - el",
    "Gujarati - gu",
    "Haitian/Creole - ht",
    "Hebrew - he",
    "Hill - Mari - mrj",
    "Hindi - hi",
    "Hungarian - hu",
    "Icelandic - is",
    "Indonesian - id",
    "Irish - ga",
    "Italian - it",
    "Japanese - ja",
    "Javanese - jv",
    "Kannada - kn",
    "Kazakh - kk",
    "Khmer - km",
    "Korean - ko",
    "Kyrgyz - ky",
    "Laotian - lo",
    "Latin - la",
    "Latvian - lv",
    "Lithuanian - lt",
    "Luxembourgish - lb",
    "Macedonian - mk",
    "Malagasy - mg",
    "Malay - ms",
    "Malayalam - ml",
    "Maltese - mt",
    "Maori - mi",
    "Marathi - mr",
    "Mari - mhr",
    "Mongolian - mn",
    "Nepali - ne",
    "Norwegian - no",
    "Papiamento - pap",
    "Persian - fa",
    "Polish - pl",
    "Portuguese - pt",
    "Punjabi - pa",
    "Romanian - ro",
    "Russian - ru",
    "Scottish - gd",
    "Serbian - sr",
    "Sinhala - si",
    "Slovakian - sk",
    "Slovenian - sl",
    "Spanish - es",
    "Sundanese - su",
    "Swahili - sw",
    "Swedish - sv",
    "Tagalog - tl",
    "Tajik - tg",
    "Tamil - ta",
    "Tatar - tt",
    "Telugu - te",
    "Thai - th",
    "Turkish - tr",
    "Udmurt - udm",
    "Ukrainian - uk",
    "Urdu - ur",
    "Uzbek - uz",
    "Vietnamese - vi",
    "Welsh - cy",
    "Xhosa - xh",
    "Yiddish - yi",
];
let translate = async function (ctx, msg, args) {
    args = ctx.utils.formatArgs(args);

    if (args[0] == "languages") {
        let tbl1 = new ctx.utils.table([
            "Language",
            "Code",
            "Language",
            "Code",
        ]);
        let tbl2 = new ctx.utils.table([
            "Language",
            "Code",
            "Language",
            "Code",
        ]);
        let set1 = langCodes.slice(0, Math.ceil(langCodes.length / 2));
        let set2 = langCodes.slice(
            Math.ceil(langCodes.length / 2),
            langCodes.length
        );

        for (let i = 0; i < set1.length; i = i + 2) {
            let val1 = (set1[i] ? set1[i] : " - ").split(" - ");
            let val2 = (set1[i + 1] ? set1[i + 1] : " - ").split(" - ");
            tbl1.addRow([
                val1[0] ? " " + val1[0] : "",
                val1[1] ? " " + val1[1] : "",
                val2[0] ? " " + val2[0] : "",
                val2[1] ? " " + val2[1] : "",
            ]);
        }
        for (let i = 0; i < set2.length; i = i + 2) {
            let val1 = (set2[i] ? set2[i] : " - ").split(" - ");
            let val2 = (set2[i + 1] ? set2[i + 1] : " - ").split(" - ");
            tbl2.addRow([
                val1[0] ? " " + val1[0] : "",
                val1[1] ? " " + val1[1] : "",
                val2[0] ? " " + val2[0] : "",
                val2[1] ? " " + val2[1] : "",
            ]);
        }

        msg.channel
            .createMessage({
                embed: {
                    title: "Valid language codes (1/2)",
                    color: ctx.utils.topColor(
                        ctx,
                        msg,
                        ctx.bot.user.id,
                        0x8060c0
                    ),
                    description: `\`\`\`${tbl1.render()}\`\`\``,
                },
            })
            .then((_) => {
                msg.channel.createMessage({
                    embed: {
                        title: "Valid language codes (2/2)",
                        color: ctx.utils.topColor(
                            ctx,
                            msg,
                            ctx.bot.user.id,
                            0x8060c0
                        ),
                        description: `\`\`\`${tbl2.render()}\`\`\``,
                    },
                });
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
    inp = inp.replace(/\n/g, " ");
    let lang1 = args.length == 3 ? args[0] : "auto";
    let lang2 = args.length == 3 ? args[1] : args[0];

    let out = await superagent
        .get(
            `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${turkey}&lang=${encodeURIComponent(
                lang1 != "auto" ? lang1 + "-" + lang2 : lang2
            )}&text=${encodeURIComponent(inp)}`
        )
        .then((x) => x.body.text.join(" | "))
        .catch((e) => e);

    msg.channel.createMessage(
        `[${lang1} -> ${lang2}] \`${inp}\` translates to \`${out}\``
    );
};

let quote = async function (ctx, msg, args) {
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
                name: `${message.author.username}#${message.author.discriminator}`,
                icon_url: message.author.avatarURL,
            },
            description: message.content,
            color: ctx.utils.topColor(ctx, msg, message.author.id),
            timestamp: new Date(message.timestamp).toISOString(),
            fields: [
                {
                    name: "Jump to",
                    value: `https://canary.discordapp.com/channels/${msg.channel.guild.id}/${message.channel.id}/${message.id}`,
                },
            ],
        };
        if (message.attachments.length > 0) {
            embed.image = {
                url: message.attachments[0].url,
            };
        }

        msg.channel.createMessage({
            content:
                quote === ""
                    ? `Quoted by **${msg.author.username}#${msg.author.discriminator}**`
                    : `**${msg.author.username}#${msg.author.discriminator}:** ${quote}`,
            embed: embed,
        });

        msg.delete().catch((_) => {});
    } catch (e) {
        msg.channel.createMessage(
            `<@${msg.author.id}> Message not found. Are you in the right channel?`
        );
    }
};

let charinfo = async function (ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage("Arguments required.");
        return;
    }

    let out = ctx.utils.unilib
        .getNamesFromString(args)
        .map(
            (x) =>
                `\`\\u${x[0]}\`: ${x[1]} - ${String.fromCodePoint(
                    `0x${x[0]}`
                )} \u2014 <http://www.fileformat.info/info/unicode/char/${
                    x[0]
                }>`
        )
        .join("\n");

    if (out.toString().length > 2000) {
        let output = out
            .toString()
            .replace(/_/g, "\\_")
            .replace(/\*/g, "\\*")
            .replace(/~/g, "\\~")
            .replace(/`/g, "\\`");
        ctx.utils.makeHaste(
            ctx,
            msg,
            output,
            "\u2705 Output too long to send in a message: "
        );
    } else {
        msg.channel.createMessage(out);
    }
};

let jump = async function (ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage("Arguments required.");
        return;
    }

    args = args.split(" ");
    let channel = false;
    let mid = "";
    let success = false;

    if (args.length > 1) {
        channel = args[0];
        mid = args[1];
    } else {
        mid = args[0];
    }

    let doChecks = new Promise((resolve, reject) => {
        if (channel == false) {
            msg.channel
                .getMessage(mid)
                .then((_) => resolve(true))
                .catch((_) => {
                    reject(
                        "Message not found. Be sure to append channel name or ID before the other ID, seperated with a space if its in another channel."
                    );
                });
        } else {
            if (/[0-9]{17,21}/.test(channel)) {
                let test = msg.channel.guild.channels.get(channel);
                if (!test) {
                    reject(
                        "Channel lookup by ID failed. Be sure its in the same guild."
                    );
                    return;
                }
                test.getMessage(mid)
                    .then((_) => resolve(true))
                    .catch((_) => {
                        reject("Message was not found in channel.");
                    });
            } else if (!/[0-9]{17,21}/.test(channel)) {
                let test = msg.channel.guild.channels.filter(
                    (c) => c.name == channel
                )[0];
                if (!test) {
                    reject(
                        "Channel lookup by name failed. Be sure its the full name."
                    );
                    return;
                }
                test.getMessage(mid)
                    .then((_) => {
                        channel = test.id;
                        resolve(true);
                    })
                    .catch((_) => {
                        reject("Message was not found in channel.");
                    });
            }
        }
    });

    doChecks
        .then((_) =>
            msg.channel.createMessage(
                `https://discordapp.com/channels/${msg.channel.guild.id}/${
                    channel == false ? msg.channel.id : channel
                }/${mid}`
            )
        )
        .catch((e) => msg.channel.createMessage(e));
};

let readtxt = async function (ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage("Arguments required.");
        return;
    }

    if (/[0-9]{17,21}/.test(args)) {
        let m = await msg.channel.getMessage(args);
        if (m) {
            if (m.attachments && m.attachments[0]) {
                let req = await superagent.get(m.attachments[0].url);
                if (req.type == "text/plain") {
                    ctx.utils.makeHaste(ctx, msg, req.text, "");
                } else {
                    msg.channel.createMessage("Attachment is not a text file.");
                    return;
                }
            }
        } else {
            msg.channel.createMessage("Message not found in channel.");
            return;
        }
    } else {
        msg.channel.createMessage("Not an ID.");
        return;
    }
};

module.exports = [
    {
        name: "avatar",
        desc: "Get the avatar of a user.",
        func: avatar,
        usage: "[user]",
        group: "utils",
        aliases: ["pfp"],
    },
    {
        name: "lookupinvite",
        desc: "Lookup an invite",
        func: linvite,
        usage: "<invite>",
        group: "utils",
        aliases: ["linvite"],
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
        group: "utils",
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
        aliases: ["userinfo", "user"],
    },
    {
        name: "sinfo",
        desc: "Displays info of a server",
        func: sinfo,
        group: "utils",
        aliases: ["ginfo", "guildinfo", "serverinfo", "guild", "server"],
    },
    {
        name: "rinfo",
        desc: "Displays info of a role",
        func: rinfo,
        group: "utils",
        aliases: ["roleinfo", "role"],
    },
    {
        name: "cflake",
        desc:
            "Converts a Discord or Twitter (via `--twitter`) snowflake to a readable time.",
        fulldesc: `
(Append \`--twitter\` to convert to Twitter timestamp, the
snowflake of a tweet can be found in the URL)

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
        aliases: ["snowflake"],
    },
    {
        name: "slist",
        desc: "Server list of servers HiddenPhox is in.",
        func: slist,
        group: "utils",
        aliases: ["servers", "serverlist"],
    },
    {
        name: "presence",
        desc: "Get presence/playing game of someone.",
        func: presence,
        group: "utils",
        aliases: ["status"],
    },
    {
        name: "jumbo",
        desc: "Get the raw image of an emoji.",
        func: jumbo,
        group: "utils",
        aliases: ["e", "emote", "emoji"],
    },
    {
        name: "einfo",
        desc: "Get info of an emoji.",
        func: einfo,
        group: "utils",
        aliases: ["emoteinfo", "emojiinfo"],
    },
    {
        name: "translate",
        desc: "Translate text from one language to another.",
        func: translate,
        group: "utils",
        aliases: ["tr"],
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
        aliases: ["q"],
    },
    {
        name: "charinfo",
        desc: "Get information on a character or string of characters.",
        func: charinfo,
        group: "utils",
        aliases: ["char", "character"],
    },
    {
        name: "jump",
        desc: "Get jump URL based on ID.",
        func: jump,
        group: "utils",
        aliases: ["jumpto"],
    },
    {
        name: "emojis",
        desc: "List server emojis.",
        func: emotes,
        group: "utils",
        aliases: ["emotes"],
    },
    {
        name: "readtxt",
        desc:
            "Takes a text file attachment from a message and uploads it to mystbin.",
        func: readtxt,
        group: "utils",
    },
];
