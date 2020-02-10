//Util functions
let isLoggingEnabled = async function(ctx, msg) {
    if (!msg.channel.guild) return false;
    let data = await ctx.db.models.sdata.findOne({
        where: { id: msg.channel.guild.id }
    });

    return data ? data.logging : false;
};

let getLogChannel = async function(ctx, msg) {
    let data = await ctx.db.models.sdata.findOne({
        where: { id: msg.channel.guild.id }
    });
    let channel = data.logchan;

    return msg.channel.guild.channels.get(channel);
};

//Events
let messageUpdate = async function(msg, oldMsg, ctx) {
    if (!msg.channel.guild) return;
    if ((await isLoggingEnabled(ctx, msg)) === true) {
        if (msg.content === oldMsg.content) return;
        let log = await getLogChannel(ctx, msg);
        log.createMessage({
            embed: {
                title: ":pencil2: Message Update",
                color: 0xffaa00,
                fields: [
                    {
                        name: "ID",
                        value: msg.id ? msg.id : "<no id given>",
                        inline: true
                    },
                    {
                        name: "Old Message",
                        value:
                            oldMsg.content.length > 0
                                ? oldMsg.content.substring(0, 128) +
                                  (oldMsg.content.length > 128 ? "..." : "")
                                : "<no content>",
                        inline: true
                    },
                    {
                        name: "New Message",
                        value:
                            msg.content.length > 0
                                ? msg.content.substring(0, 128) +
                                  (msg.content.length > 128 ? "..." : "")
                                : "<no content???>",
                        inline: true
                    },
                    {
                        name: "User",
                        value: `<@${msg.author.id}>`,
                        inline: true
                    },
                    {
                        name: "Channel",
                        value: `<#${msg.channel.id}>`,
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString()
            }
        });
    }
};

let reactionAdd = async function(msg, emoji, uid, ctx) {
    if (!msg.channel.guild) return;
    if ((await isLoggingEnabled(ctx, msg)) === true) {
        let log = await getLogChannel(ctx, msg);
        log.createMessage({
            embed: {
                title: ":heart: Reaction Added",
                color: 0x00aa00,
                fields: [
                    { name: "Message ID", value: msg.id, inline: true },
                    {
                        name: "Emoji",
                        value: emoji.id
                            ? `:${emoji.name}: <${emoji.animated ? "a" : ""}:${
                                  emoji.name
                              }:${emoji.id}>`
                            : emoji.name,
                        inline: true
                    },
                    { name: "User", value: `<@${uid}>`, inline: true }
                ],
                thumbnail: {
                    url: emoji.id
                        ? `https://cdn.discordapp.com/emojis/${emoji.id}.png?v=1`
                        : ""
                },
                timestamp: new Date().toISOString()
            }
        });
    }
};

let reactionDelete = async function(msg, emoji, uid, ctx) {
    if (!msg.channel.guild) return;
    if ((await isLoggingEnabled(ctx, msg)) === true) {
        let log = await getLogChannel(ctx, msg);
        log.createMessage({
            embed: {
                title: ":black_heart: Reaction Removed",
                color: 0xaa0000,
                fields: [
                    { name: "Message ID", value: msg.id, inline: true },
                    {
                        name: "Emoji",
                        value: emoji.id
                            ? `:${emoji.name}: <${emoji.animated ? "a" : ""}:${
                                  emoji.name
                              }:${emoji.id}>`
                            : emoji.name,
                        inline: true
                    },
                    { name: "User", value: `<@${uid}>`, inline: true }
                ],
                thumbnail: {
                    url: emoji.id
                        ? `https://cdn.discordapp.com/emojis/${emoji.id}.png?v=1`
                        : ""
                },
                timestamp: new Date().toISOString()
            }
        });
    }
};

let messageDelete = async function(msg, ctx) {
    if (!msg.channel.guild) return;
    if ((await isLoggingEnabled(ctx, msg)) === true) {
        let fields = [
            {
                name: "ID",
                value: msg.id ? msg.id : "<no id given>",
                inline: true
            },
            {
                name: "Message",
                value:
                    msg.content.length > 0
                        ? msg.content.substring(0, 128) +
                          (msg.content.length > 128 ? "..." : "")
                        : "<no content>",
                inline: true
            },
            {
                name: "Attachments/Embeds",
                value: `${msg.attachments.length} attachments, ${msg.embeds.length} embeds.`
            },
            { name: "Sender", value: `<@${msg.author.id}>`, inline: true },
            { name: "Channel", value: `<#${msg.channel.id}>`, inline: true }
        ];

        let log = await getLogChannel(ctx, msg);
        log.createMessage({
            embed: {
                title: ":x: Message Delete",
                color: 0xaa0000,
                fields: fields,
                timestamp: new Date().toISOString()
            }
        });
    }
};

let types = {
    0: "Text",
    2: "Voice",
    4: "Category",
    5: "News",
    6: "Commerce"
};

let channelUpdate = async function(channel, oldChannel, ctx) {
    if (!channel.guild) return;
    if (channel.positions != oldChannel.position) return;
    if ((await isLoggingEnabled(ctx, { channel: channel })) === true) {
        let fields = [
            {
                name: "ID",
                value: channel.id ? channel.id : "<no id given>",
                inline: true
            },
            { name: "Name", value: channel.name, inline: true },
            { name: "Type", value: types[channel.type], inline: true }
        ];

        if (channel.name != oldChannel.name) {
            fields.push({
                name: "Name",
                value: `${channel.name} (was ${oldChannel.name})`,
                inline: true
            });
        }
        if (channel.bitrate != oldChannel.bitrate) {
            fields.push({
                name: "Bitrate",
                value: `${channel.bitrate} (was ${oldChannel.bitrate})`,
                inline: true
            });
        }
        if (
            channel.permissionOverwrites.size !=
            oldChannel.permissionOverwrites.size
        ) {
            fields.push({
                name: "Permissions Size",
                value: `${channel.permissionOverwrites.size} (was ${oldChannel.permissionOverwrites.size})`,
                inline: true
            });
        }
        if (channel.nsfw != oldChannel.nsfw) {
            fields.push({
                name: "NSFW Flag",
                value: `${channel.nsfw} (was ${oldChannel.nsfw})`,
                inline: true
            });
        }
        if (channel.topic != oldChannel.topic) {
            fields.push({
                name: "Topic",
                value: `${channel.topic} (was ${oldChannel.topic})`,
                inline: true
            });
        }

        let log = await getLogChannel(ctx, { channel: channel });
        log.createMessage({
            embed: {
                title: ":pencil2: Channel Update",
                color: 0xffaa00,
                fields: fields,
                timestamp: new Date().toISOString()
            }
        });
    }
};

let banAdd = async function(guild, user, ctx) {
    if ((await isLoggingEnabled(ctx, { channel: { guild: guild } })) === true) {
        const logEntry = guild
            .getAuditLogs(
                1,
                null,
                ctx.libs.eris.Constants.AuditLogActions.MEMBER_BAN_ADD
            )
            .then(x => x.entries[0])
            .catch(x => {});
        const log = await getLogChannel(ctx, { channel: { guild: guild } });

        let embed = {
            title: ":hammer: User Banned",
            color: 0xaa0000,
            fields: [
                {
                    name: "User",
                    value: `<@${user.id}> (${user.username}#${user.discriminator} - \`${user.id}\`)`,
                    inline: true
                }
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
                        : `https://cdn.discordapp.com/embed/avatars/${user.discriminator %
                              5}.png`
            },
            timestamp: new Date().toISOString()
        };

        if (logEntry && logEntry.targetID == user.id) {
            embed.fields.push({
                name: "Banner",
                value: `<@${logEntry.user.id}> (${logEntry.user.username}#${logEntry.user.discriminator} - \`${logEntry.user.id}\`)`,
                inline: true
            });
            embed.fields.push({
                name: "Reason",
                value: logEntry.reason || "<no reason given>",
                inline: true
            });
        }

        log.createMessage({
            embed: embed
        });
    }
};

let banRem = async function(guild, user, ctx) {
    if ((await isLoggingEnabled(ctx, { channel: { guild: guild } })) === true) {
        const logEntry = guild
            .getAuditLogs(
                1,
                null,
                ctx.libs.eris.Constants.AuditLogActions.MEMBER_BAN_REMOVE
            )
            .then(x => x.entries[0])
            .catch(x => {});
        const log = await getLogChannel(ctx, { channel: { guild: guild } });

        let embed = {
            title: ":hammer: User Unbanned",
            color: 0x00aa00,
            fields: [
                {
                    name: "User",
                    value: `<@${user.id}> (${user.username}#${user.discriminator} - \`${user.id}\`)`,
                    inline: true
                }
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
                        : `https://cdn.discordapp.com/embed/avatars/${user.discriminator %
                              5}.png`
            },
            timestamp: new Date().toISOString()
        };

        if (logEntry && logEntry.targetID == user.id) {
            embed.fields.push({
                name: "Banner",
                value: `<@${logEntry.user.id}> (${logEntry.user.username}#${logEntry.user.discriminator} - \`${logEntry.user.id}\`)`,
                inline: true
            });
            embed.fields.push({
                name: "Reason",
                value: logEntry.reason || "<no reason given>",
                inline: true
            });
        }

        log.createMessage({
            embed: embed
        });
    }
};

let userJoin = async function(guild, user, ctx) {
    if ((await isLoggingEnabled(ctx, { channel: { guild: guild } })) === true) {
        let log = await getLogChannel(ctx, { channel: { guild: guild } });
        log.createMessage({
            embed: {
                title: ":inbox_tray: User Joined",
                color: 0x00aa00,
                fields: [
                    {
                        name: "User",
                        value: `<@${user.id}> (${user.username}#${user.discriminator} - \`${user.id}\`)`,
                        inline: true
                    },
                    {
                        name: "Created At",
                        value: `${new Date(
                            user.createdAt
                        ).toUTCString()} (${ctx.utils.toReadableTime(
                            Date.now() - user.createdAt
                        )} ago)`,
                        inline: true
                    }
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
                            : `https://cdn.discordapp.com/embed/avatars/${user.discriminator %
                                  5}.png`
                },
                timestamp: new Date().toISOString()
            }
        });
    }
};

let userLeft = async function(guild, user, ctx) {
    if ((await isLoggingEnabled(ctx, { channel: { guild: guild } })) === true) {
        let log = await getLogChannel(ctx, { channel: { guild: guild } });
        log.createMessage({
            embed: {
                title: ":outbox_tray: User Left",
                color: 0xaa0000,
                fields: [
                    {
                        name: "User",
                        value: `<@${user.id}> (${user.user.username}#${user.user.discriminator} - \`${user.user.id}\`)`,
                        inline: true
                    },
                    {
                        name: "Created At",
                        value: `${new Date(
                            user.createdAt
                        ).toUTCString()} (${ctx.utils.toReadableTime(
                            Date.now() - user.createdAt
                        )} ago)`,
                        inline: true
                    },
                    {
                        name: "Roles",
                        value:
                            user.roles && user.roles.length > 0
                                ? user.roles.map(r => `<@&${r}>`).join(" ")
                                : "None",
                        inline: true
                    }
                ],
                thumbnail: {
                    url: `https://cdn.discordapp.com/avatars/${user.id}/${
                        user.user.avatar
                    }.${user.avatar.startsWith("a_") ? "gif" : "png?size=256"}`
                },
                timestamp: new Date().toISOString()
            }
        });
    }
};

let msgDelBulk = async function(msgs, ctx) {
    if ((await isLoggingEnabled(ctx, { channel: { guild: guild } })) === true) {
        let messages = [];

        for (let i in msgs) {
            let msg = msgs[i];
            let time = new Date(msg.timestamp);

            messages.push(
                `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] ${
                    msg.author.username
                }#${msg.author.discriminator}: ${msg.cleanContent}`
            );
        }

        let req = await ctx.libs.superagent
            .post("https://mystb.in/documents")
            .send(messages.join("\n"));

        let log = await getLogChannel(ctx, { channel: { guild: guild } });
        log.createMessage({
            embed: {
                title: ":trashcan: Bulk Message Delete",
                color: 0xaa0000,
                description: `[${msgs.length} Deleted Messages](https://mystb.in/${req.body.key})`,
                timestamp: new Date().toISOString()
            }
        });
    }
};

let userUpdate = async function(user, oldUser, ctx) {
    for (const g of ctx.bot.guilds.values()) {
        if (!g.members.get(user.id)) return;
        if (
            user &&
            oldUser &&
            (user.username == oldUser.username ||
                user.discriminator == oldUser.discriminator ||
                user.avatar == oldUser.avatar)
        )
            return;
        if ((await isLoggingEnabled(ctx, { channel: { guild: g } })) === true) {
            let e = {
                title: ":credit_card: User Updated",
                color: 0xaa0000,
                fields: [
                    {
                        name: "User",
                        value: `<@${user.id}> (${user.username}#${user.discriminator})`,
                        inline: true
                    }
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
                            : `https://cdn.discordapp.com/embed/avatars/${user.discriminator %
                                  5}.png`
                },
                timestamp: new Date().toISOString()
            };

            if (user.username != oldUser.username) {
                e.fields.push({
                    name: "Name",
                    value: `${user.username} (was ${oldUser.name})`,
                    inline: true
                });
            }
            if (user.discriminator != oldUser.discriminator) {
                e.fields.push({
                    name: "Discrim",
                    value: `#${user.discriminator} (was #${oldUser.discriminator})`,
                    inline: true
                });
            }
            if (user.avatar != oldUser.avatar) {
                e.fields.push({
                    name: "Avatar Updated",
                    value: `${user.avatar} (was ${oldUser.avatar})`,
                    inline: true
                });
            }

            let log = await getLogChannel(ctx, { channel: { guild: guild } });
            log.createMessage({ embed: e });
        }
    }
};

module.exports = [
    {
        event: "messageUpdate",
        name: "ServerLogging-MsgUpd",
        func: messageUpdate
    },
    {
        event: "messageDelete",
        name: "ServerLogging-MsgDel",
        func: messageDelete
    },
    {
        event: "messageReactionAdd",
        name: "ServerLogging-ReactAdd",
        func: reactionAdd
    },
    {
        event: "messageReactionRemove",
        name: "ServerLogging-ReactRem",
        func: reactionDelete
    },
    {
        event: "channelUpdate",
        name: "ServerLogging-ChanUpd",
        func: channelUpdate
    },
    {
        event: "guildBanAdd",
        name: "ServerLogging-BanAdd",
        func: banAdd
    },
    {
        event: "guildBanRemove",
        name: "ServerLogging-BanRem",
        func: banRem
    },
    {
        event: "guildMemberAdd",
        name: "ServerLogging-UserJoin",
        func: userJoin
    },
    {
        event: "guildMemberRemove",
        name: "ServerLogging-UserLeft",
        func: userLeft
    },
    {
        event: "userUpdate",
        name: "ServerLogging-UserUpdated",
        func: userUpdate
    }
];
