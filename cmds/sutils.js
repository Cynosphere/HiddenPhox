let snipe = async function(ctx, msg, args) {
    let data = await ctx.db.models.sdata.findOrCreate({
        where: { id: msg.channel.guild.id }
    });
    let canSnipe = data[0].dataValues.allow_snipe;

    if (!msg.channel.guild) {
        msg.channel.createMessage("Not in a guild.");
    } else if (!ctx.snipes.get(msg.channel.id)) {
        msg.channel.createMessage("No messages deleted recently to snipe.");
    } else if (canSnipe === false) {
        msg.channel.createMessage(
            "This server has opted to disable sniping of messages and edits."
        );
    } else {
        let m = ctx.snipes.get(msg.channel.id);
        msg.channel.createMessage({
            embed: {
                author: {
                    name: `${m.author.username}#${m.author.discriminator}`,
                    icon_url: m.author.avatarURL
                },
                description: m.content,
                footer: {
                    text: `Sniped by ${msg.author.username}#${
                        msg.author.discriminator
                    }`,
                    icon_url: msg.author.avatarURL
                },
                image: {
                    url:
                        (m.attachments.length > 0 && m.attachments[0].url) || ""
                },
                timestamp: new Date(m.timestamp)
            }
        });
    }
};

let esnipe = async function(ctx, msg, args) {
    let data = await ctx.db.models.sdata.findOrCreate({
        where: { id: msg.channel.guild.id }
    });
    let canSnipe = data[0].dataValues.allow_snipe;

    if (!msg.channel.guild) {
        msg.channel.createMessage("Not in a guild.");
    } else if (!ctx.esnipes.get(msg.channel.id)) {
        msg.channel.createMessage("No messages edited recently to snipe.");
    } else if (canSnipe === false) {
        msg.channel.createMessage(
            "This server has opted to disable sniping of messages and edits."
        );
    } else {
        let om = ctx.esnipes.get(msg.channel.id).omsg;
        let m = ctx.esnipes.get(msg.channel.id).msg;
        msg.channel.createMessage({
            embed: {
                author: {
                    name: `${m.author.username}#${m.author.discriminator}`,
                    icon_url: m.author.avatarURL
                },
                fields: [
                    { name: "Old Message", value: om.content, inline: true },
                    { name: "New Message", value: m.content, inline: true }
                ],
                footer: {
                    text: `Edit sniped by ${msg.author.username}#${
                        msg.author.discriminator
                    }`,
                    icon_url: msg.author.avatarURL
                },
                timestamp: new Date(m.timestamp)
            }
        });
    }
};

let dehoist = function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage("Arguments required.");
    } else if (
        !msg.channel.permissionsOf(msg.author.id).has("manageNicknames")
    ) {
        msg.channel.createMessage(
            "You do not have `Manage Nicknames` permission."
        );
    } else if (
        !msg.channel.permissionsOf(ctx.bot.user.id).has("manageNicknames")
    ) {
        msg.channel.createMessage(
            "I do not have `Manage Nicknames` permission."
        );
    } else {
        ctx.utils.lookupUser(ctx, msg, args || "").then(u => {
            u = msg.channel.guild.members.get(u.id);
            if (u.nick && u.nick.startsWith("\uD82F\uDCA2")) {
                msg.channel.createMessage("User already dehoisted.");
                return;
            }
            u
                .edit({
                    nick: `\uD82F\uDCA2${(u.nick && u.nick.slice(0, 30)) ||
                        u.username.slice(0, 30)}`
                })
                .then(() => {
                    msg.addReaction("\uD83D\uDC4C");
                })
                .catch(r => {
                    msg.channel.createMessage(
                        `Could not set nick:\n\`\`\`\n${r}\`\`\``
                    );
                });
        });
    }
};

let roleme = async function(ctx, msg, args) {
    args = args.split(" ");
    let sub = args[0];
    let sargs = args.splice(1, args.length).join(" ");

    let data = await ctx.db.models.sdata.findOrCreate({
        where: { id: msg.channel.guild.id }
    });
    let rme = JSON.parse(data[0].dataValues.roleme) || [];

    let rmefilter = function(r) {
        for (let i = 0; i < rme.length; i++) {
            let role = rme[i];
            if (r.id == role) return r;
        }
    };

    if (sub == "add") {
        if (!msg.channel.permissionsOf(msg.author.id).has("manageRoles")) {
            msg.channel.createMessage(
                "You do not have `Manage Roles` permission."
            );
            return;
        }
        if (!msg.channel.permissionsOf(ctx.bot.user.id).has("manageRoles")) {
            msg.channel.createMessage(
                "I do not have `Manage Roles` permission."
            );
            return;
        }

        ctx.utils
            .lookupRole(ctx, msg, sargs || "")
            .then(async r => {
                let data = await ctx.db.models.sdata.findOrCreate({
                    where: { id: msg.channel.guild.id }
                });
                let rme = JSON.parse(data[0].dataValues.roleme) || [];

                if (rme.includes(r.id)) {
                    msg.channel.createMessage("Role already in roleme list.");
                } else {
                    rme.push(r.id);
                    ctx.db.models.sdata.update(
                        { roleme: JSON.stringify(rme) },
                        { where: { id: msg.channel.guild.id } }
                    );
                    msg.channel.createMessage(
                        `Added **${r.name}** to server roleme list.`
                    );
                }
            })
            .catch(m => {
                if (m == "No results." || m == "Canceled") {
                    msg.channel.createMessage(m);
                } else {
                    ctx.utils.logWarn(ctx, `[roleme] ${m}`);
                }
            });
    } else if (sub == "del" || sub == "delete") {
        if (!msg.channel.permissionsOf(msg.author.id).has("manageRoles")) {
            msg.channel.createMessage(
                "You do not have `Manage Roles` permission."
            );
            return;
        }
        if (!msg.channel.permissionsOf(ctx.bot.user.id).has("manageRoles")) {
            msg.channel.createMessage(
                "I do not have `Manage Roles` permission."
            );
            return;
        }

        ctx.utils
            .lookupRole(ctx, msg, sargs || "")
            .then(async r => {
                let data = await ctx.db.models.sdata.findOrCreate({
                    where: { id: msg.channel.guild.id }
                });
                let rme = JSON.parse(data[0].dataValues.roleme) || [];

                if (rme.includes(r.id)) {
                    ctx.db.models.sdata.update(
                        { roleme: JSON.stringify(rme.filter(v => v !== r.id)) },
                        { where: { id: msg.channel.guild.id } }
                    );
                    msg.channel.createMessage(
                        `Removed **${r.name}** from server roleme list.`
                    );
                } else {
                    msg.channel.createMessage(
                        "Role was never added to roleme list."
                    );
                }
            })
            .catch(m => {
                if (m == "No results." || m == "Canceled") {
                    msg.channel.createMessage(m);
                } else {
                    ctx.utils.logWarn(ctx, `[roleme] ${m}`);
                }
            });
    } else if (sub == "give") {
        if (!msg.channel.permissionsOf(ctx.bot.user.id).has("manageRoles")) {
            msg.channel.createMessage(
                "I do not have `Manage Roles` permission."
            );
            return;
        }

        ctx.utils
            .lookupRole(ctx, msg, sargs || "", rmefilter)
            .then(async r => {
                let data = await ctx.db.models.sdata.findOrCreate({
                    where: { id: msg.channel.guild.id }
                });
                let rme = JSON.parse(data[0].dataValues.roleme) || [];

                if (rme.includes(r.id)) {
                    msg.member.addRole(r.id, "[HiddenPhox] Added via roleme.");
                    msg.addReaction("\uD83D\uDC4C");
                } else {
                    msg.channel.createMessage("Role not elegible for roleme.");
                }
            })
            .catch(m => {
                if (m == "No results." || m == "Canceled") {
                    msg.channel.createMessage(m);
                } else {
                    ctx.utils.logWarn(ctx, `[roleme] ${m}`);
                }
            });
    } else if (sub == "rem" || sub == "remove") {
        if (!msg.channel.permissionsOf(ctx.bot.user.id).has("manageRoles")) {
            msg.channel.createMessage(
                "I do not have `Manage Roles` permission."
            );
            return;
        }

        ctx.utils
            .lookupRole(ctx, msg, sargs || "", rmefilter)
            .then(async r => {
                let data = await ctx.db.models.sdata.findOrCreate({
                    where: { id: msg.channel.guild.id }
                });
                let rme = JSON.parse(data[0].dataValues.roleme) || [];

                if (rme.includes(r.id)) {
                    msg.member.removeRole(
                        r.id,
                        "[HiddenPhox] Removed via roleme."
                    );
                    msg.addReaction("\uD83D\uDC4C");
                } else {
                    msg.channel.createMessage(
                        "Role not elegible for roleme. If this role was previously added to roleme, contact someone that can manage roles."
                    );
                }
            })
            .catch(m => {
                if (m == "No results." || m == "Canceled") {
                    msg.channel.createMessage(m);
                } else {
                    ctx.utils.logWarn(ctx, `[roleme] ${m}`);
                }
            });
    } else if (sub == "list") {
        let data = await ctx.db.models.sdata.findOrCreate({
            where: { id: msg.channel.guild.id }
        });
        let rme = JSON.parse(data[0].dataValues.roleme) || [];

        if (rme.length > 0) {
            let roles = [];
            for (let i = 0; i < rme.length; i++) {
                roles.push(msg.channel.guild.roles.get(rme[i]).name);
            }
            msg.channel.createMessage(
                `__**Elegible roles for roleme**__\n\`\`\`\n${roles.join(
                    ", "
                )}\n\`\`\``
            );
        } else {
            msg.channel.createMessage(
                "No roles have been added to this server's roleme."
            );
        }
    } else if (sub == "preset") {
        /*if(!msg.channel.permissionsOf(ctx.bot.user.id).has("manageRoles")){
            msg.channel.createMessage("I do not have `Manage Roles` permission.");
            return;
        }*/
        msg.channel.createMessage("soon:tm:");
    } else if (sub == "help") {
        let sub = [
            "  \u2022 give - Give a roleme set role.",
            "  \u2022 rem(ove) - Remove a roleme set role.",
            "  \u2022 list - List servers set of elegible roles.",
            "",
            " **Manage Roles needed:**",
            "  \u2022 add - Add a role to server roleme list.",
            "  \u2022 del(ete) - Remove a role from server roleme list."
        ];

        msg.channel.createMessage(
            `__**Subcommands for roleme**__\n${sub.join("\n")}`
        );
    } else {
        ctx.utils
            .lookupRole(ctx, msg, args.join(" "), rmefilter)
            .then(async r => {
                if (
                    !msg.channel
                        .permissionsOf(ctx.bot.user.id)
                        .has("manageRoles")
                ) {
                    msg.channel.createMessage(
                        "I do not have `Manage Roles` permission."
                    );
                    return;
                }

                let data = await ctx.db.models.sdata.findOrCreate({
                    where: { id: msg.channel.guild.id }
                });
                let rme = JSON.parse(data[0].dataValues.roleme) || [];

                if (rme.includes(r.id)) {
                    msg.member.addRole(r.id, "[HiddenPhox] Added via roleme.");
                    msg.addReaction("\uD83D\uDC4C");
                } else {
                    msg.channel.createMessage("Role not elegible for roleme.");
                }
            })
            .catch(m => {
                if (m == "No results.") {
                    msg.channel.createMessage(
                        `No roles found. See \`${
                            ctx.prefix
                        }roleme list\` for a list and \`${
                            ctx.prefix
                        }roleme help\` for a full set of subcommands.`
                    );
                } else if (m == "Canceled") {
                    msg.channel.createMessage(m);
                } else {
                    msg.channel.createMessage(
                        "An error occured and has been reported."
                    );
                    ctx.utils.logWarn(ctx, `[roleme] ${m}`);
                }
            });
    }
};

let sconfig = async function(ctx, msg, args) {
    if (
        !msg.channel.permissionsOf(msg.author.id).has("manageGuild") &&
        msg.author.id !== ctx.ownerid
    ) {
        msg.channel.createMessage(
            "You do not have `Manage Server` permission."
        );
        return;
    }

    let keys = [
        {
            name: "logging",
            desc: "[WIP] Enable server logging to a channel",
            type: "boolean"
        },
        {
            name: "logchan",
            desc: "[WIP] Server logging channel ID",
            type: "string"
        },
        {
            name: "allow_snipe",
            desc: "Allow sniping of deleted and edited messages",
            type: "boolean"
        },
        {
            name: "shortlinks",
            desc: "Shortcuts for longer urls",
            type: "boolean"
        }
    ];

    args = args.split(" ");

    let cmd = args[0];
    let key = args[1];
    let val = args[2];

    if (cmd == "set") {
        if (!key) {
            msg.channel.createMessage("No key given.");
            return;
        }
        if (!val) {
            msg.channel.createMessage("No value given.");
            return;
        }

        if (keys.find(k => k.name == val) == "undefined") {
            msg.channel.createMessage(
                `Cannot find specified key \`${key}\`. Do \`${
                    ctx.prefix
                }config list\` for valid keys.`
            );
            return;
        }

        let data = {};
        data[key] = val;

        try {
            let find = await ctx.db.models.sdata.findOrCreate({
                where: { id: msg.channel.guild.id }
            });
            if (find) {
                await ctx.db.models.sdata.update(data, {
                    where: { id: msg.channel.guild.id }
                });
                msg.channel.createMessage(
                    `Set \`${key}\` to value \`${val}\`.`
                );
            }
        } catch (e) {
            msg.channel.createMessage("Could not set value, try again later.");
            ctx.utils.logWarn(ctx, e);
        }
    } else if (cmd == "get") {
        if (!key) {
            msg.channel.createMessage("No key given.");
            return;
        }

        if (keys.find(k => k.name == val) == "undefined") {
            msg.channel.createMessage(
                `Cannot find specified key \`${key}\`. Do \`${
                    ctx.prefix
                }config list\` for valid keys.`
            );
            return;
        }

        let data = await ctx.db.models.sdata.findOrCreate({
            where: { id: msg.channel.guild.id }
        });

        msg.channel.createMessage(
            `Key \`${key}\` has value \`${data[0].dataValues[key]}\`.`
        );
    } else if (cmd == "list") {
        let data = [];
        keys.map(k => data.push(`${k.type} | ${k.name} | ${k.desc}`));

        msg.channel.createMessage(
            `__Config Options__\n\`\`\`\n${data.join("\n")}\n\`\`\``
        );
    } else {
        msg.channel.createMessage(
            "__**Subcommands for config**__\n  set - Set value\n  get - Get value\n  list - List all possible keys"
        );
    }
};

let kick = function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage(`Usage: ${ctx.prefix}kick <user> [reason]`);
    } else {
        if (!msg.channel.permissionsOf(msg.author.id).has("kickMembers")) {
            msg.channel.createMessage(
                "You do not have `Kick Members` permission."
            );
            return;
        }
        if (!msg.channel.permissionsOf(ctx.bot.user.id).has("kickMembers")) {
            msg.channel.createMessage(
                "I do not have `Kick Members` permission."
            );
            return;
        }

        args = ctx.utils.formatArgs(args);
        let user = args[0];
        let reason = args.splice(1, args.length).join(" ");

        ctx.utils
            .lookupUser(ctx, msg, user || "")
            .then(u => {
                try {
                    ctx.utils.awaitMessage(
                        ctx,
                        msg,
                        `${msg.author.mention}, you're about to kick **${
                            u.username
                        }#${u.discriminator}** for reason \`${
                            reason ? reason : "No reason given"
                        }\`.\n\nTo confirm type \`yes\` otherwise type anything else.`,
                        m => {
                            if (m.content.toLowerCase() == "yes") {
                                ctx.bot.kickGuildMember(
                                    msg.channel.guild.id,
                                    u.id,
                                    `[${msg.author.username}#${
                                        msg.author.discriminator
                                    }] ${reason}` ||
                                        `[${msg.author.username}#${
                                            msg.author.discriminator
                                        }] No reason given.`
                                );
                                msg.addReaction("\uD83D\uDC4C");
                                m.delete().catch(() => {});
                                ctx.bot.removeListener(
                                    "messageCreate",
                                    ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                        .func
                                );
                            } else {
                                msg.channel.createMessage("Kick aborted.");
                                m.delete().catch(() => {});
                                ctx.bot.removeListener(
                                    "messageCreate",
                                    ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                        .func
                                );
                            }
                        }
                    );
                } catch (e) {
                    msg.channel.createMessage(
                        `Could not kick:\n\`\`\`\n${e.message}\n\`\`\``
                    );
                    ctx.utils.logWarn(ctx, "[kick] " + e.message);
                }
            })
            .catch(m => {
                if (m == "No results." || m == "Canceled") {
                    msg.channel.createMessage(m);
                }
            });
    }
};

let ban = function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage(`Usage: ${ctx.prefix}ban <user> [reason]`);
    } else {
        if (!msg.channel.permissionsOf(msg.author.id).has("banMembers")) {
            msg.channel.createMessage(
                "You do not have `Ban Members` permission."
            );
            return;
        }
        if (!msg.channel.permissionsOf(ctx.bot.user.id).has("banMembers")) {
            msg.channel.createMessage(
                "I do not have `Ban Members` permission."
            );
            return;
        }

        args = ctx.utils.formatArgs(args);
        let user = args[0];
        let reason = args.splice(1, args.length).join(" ");

        ctx.utils
            .lookupUser(ctx, msg, user || "")
            .then(u => {
                try {
                    ctx.utils.awaitMessage(
                        ctx,
                        msg,
                        `${msg.author.mention}, you're about to ban **${
                            u.username
                        }#${u.discriminator}** for reason \`${
                            reason ? reason : "No reason given"
                        }\`.\n\nTo confirm type \`yes\` otherwise type anything else.`,
                        async m => {
                            if (m.content.toLowerCase() == "yes") {
                                ctx.bot.banGuildMember(
                                    msg.channel.guild.id,
                                    u.id,
                                    0,
                                    `[${msg.author.username}#${
                                        msg.author.discriminator
                                    }] ${reason}` ||
                                        `[${msg.author.username}#${
                                            msg.author.discriminator
                                        }] No reason given.`
                                );
                                msg.addReaction("\uD83D\uDC4C");
                                m.delete().catch(() => {});
                                ctx.bot.removeListener(
                                    "messageCreate",
                                    ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                        .func
                                );
                            } else {
                                msg.channel.createMessage("Ban aborted.");
                                m.delete().catch(() => {});
                                ctx.bot.removeListener(
                                    "messageCreate",
                                    ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                        .func
                                );
                            }
                        }
                    );
                } catch (e) {
                    msg.channel.createMessage(
                        `Could not ban:\n\`\`\`\n${e.message}\n\`\`\``
                    );
                    ctx.utils.logWarn(ctx, "[ban] " + e.message);
                }
            })
            .catch(m => {
                if (m == "No results." || m == "Canceled") {
                    msg.channel.createMessage(m);
                }
            });
    }
};

let unban = function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage(`Usage: ${ctx.prefix}ban <user> [reason]`);
    } else {
        if (!msg.channel.permissionsOf(msg.author.id).has("banMembers")) {
            msg.channel.createMessage(
                "You do not have `Ban Members` permission."
            );
            return;
        }
        if (!msg.channel.permissionsOf(ctx.bot.user.id).has("banMembers")) {
            msg.channel.createMessage(
                "I do not have `Ban Members` permission."
            );
            return;
        }

        args = ctx.utils.formatArgs(args);
        let user = args[0];
        let reason = args.splice(1, args.length).join(" ");

        ctx.utils
            .lookupUser(ctx, msg, user || "")
            .then(u => {
                try {
                    ctx.bot.unbanGuildMember(
                        msg.channel.guild.id,
                        u.id,
                        `[${msg.author.username}#${
                            msg.author.discriminator
                        }] ${reason}` ||
                            `[${msg.author.username}#${
                                msg.author.discriminator
                            }] No reason given.`
                    );
                    msg.addReaction("\uD83D\uDC4C");
                } catch (e) {
                    msg.channel.createMessage(
                        `Could not unban:\n\`\`\`\n${e.message}\n\`\`\``
                    );
                    ctx.utils.logWarn(ctx, "[unban] " + e.message);
                }
            })
            .catch(m => {
                if (m == "No results." || m == "Canceled") {
                    msg.channel.createMessage(m);
                }
            });
    }
};

let multikick = function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage(
            `Usage: ${ctx.prefix}kick <id1> <id2> ... [reason]`
        );
    } else {
        if (!msg.channel.permissionsOf(msg.author.id).has("kickMembers")) {
            msg.channel.createMessage(
                "You do not have `Kick Members` permission."
            );
            return;
        }
        if (!msg.channel.permissionsOf(ctx.bot.user.id).has("kickMembers")) {
            msg.channel.createMessage(
                "I do not have `Kick Members` permission."
            );
            return;
        }

        args = ctx.utils.formatArgs(args);
        let reason = args.splice(args.length - 1).join(" ");
        args = args.splice(0, args.length);

        try {
            ctx.utils.awaitMessage(
                ctx,
                msg,
                `${msg.author.mention}, you're about to kick **${
                    args.length
                } users** for reason \`${
                    reason ? reason : "No reason given"
                }\`.\n\nTo confirm type \`yes\` otherwise type anything else.`,
                async m => {
                    if (m.content.toLowerCase() == "yes") {
                        args.map(async i => {
                            let u = await ctx.utils.lookupUser(ctx, msg, i);
                            ctx.bot
                                .kickGuildMember(
                                    msg.channel.guild.id,
                                    u.id,
                                    `[multikick] [${msg.author.username}#${
                                        msg.author.discriminator
                                    }] ${reason}` ||
                                        `[multikick] [${msg.author.username}#${
                                            msg.author.discriminator
                                        }] No reason given.`
                                )
                                .catch(e => {
                                    msg.channel.createMessage(
                                        `Could not kick **${u.username}#${
                                            u.discriminator
                                        }** (${i}):\n\`\`\`\n${
                                            e.message
                                        }\n\`\`\``
                                    );
                                });
                        });
                        msg.addReaction("\uD83D\uDC4C");
                        m.delete().catch(() => {});
                        ctx.bot.removeListener(
                            "messageCreate",
                            ctx.awaitMsgs.get(msg.channel.id)[msg.id].func
                        );
                    } else {
                        msg.channel.createMessage("Multikick aborted.");
                        m.delete().catch(() => {});
                        ctx.bot.removeListener(
                            "messageCreate",
                            ctx.awaitMsgs.get(msg.channel.id)[msg.id].func
                        );
                    }
                }
            );
        } catch (e) {
            msg.channel.createMessage(
                `Could not kick:\n\`\`\`\n${e.message}\n\`\`\``
            );
            ctx.utils.logWarn(ctx, "[multikick] " + e.message);
        }
    }
};

let tidy = function(ctx, msg, args) {
    args = ctx.utils.formatArgs(args);
    let cmd = args[0];
    args = args.splice(1);

    if (!msg.channel.permissionsOf(msg.author.id).has("manageMessages")) {
        msg.channel.createMessage(
            "You do not have `Manage Messages` permission."
        );
        return;
    }
    if (!msg.channel.permissionsOf(ctx.bot.user.id).has("manageMessages")) {
        msg.channel.createMessage(
            "I do not have `Manage Messages` permission."
        );
        return;
    }

    if (cmd == "all") {
        let amt = parseInt(args.join(" ")) > 0 ? parseInt(args.join(" ")) : 10;

        msg.channel.getMessages(amt + 1).then(m => {
            let msgs = m.map(_m => _m.id);

            msg.channel.deleteMessages(msgs).then(() => {
                msg.channel.createMessage(`Deleted ${msgs.length} messages.`);
            });
        });
    } else if (cmd == "user") {
        let amt = parseInt(args[1]) > 0 ? parseInt(args[1]) : 10;

        ctx.utils.lookupUser(ctx, msg, args[0]).then(u => {
            msg.channel.getMessages(amt + 1).then(m => {
                let msgs = m
                    .filter(_m => _m.author.id == u.id)
                    .map(_m => _m.id);

                msg.channel.deleteMessages(msgs).then(() => {
                    msg.channel.createMessage(
                        `Deleted ${msgs.length} messages.`
                    );
                });
            });
        });
    } else if (cmd == "bots") {
        let amt = parseInt(args.join(" ")) > 0 ? parseInt(args.join(" ")) : 50;

        msg.channel.getMessages(amt + 1).then(m => {
            let msgs = m.filter(_m => _m.author.bot).map(_m => _m.id);

            msg.channel.deleteMessages(msgs).then(() => {
                msg.channel.createMessage(`Deleted ${msgs.length} messages.`);
            });
        });
    } else if (cmd == "filter") {
        let amt = parseInt(args[1]) > 0 ? parseInt(args[1]) : 10;

        msg.channel.getMessages(amt + 1).then(m => {
            let msgs = m
                .filter(_m => _m.content.indexOf(args[0]) > -1)
                .map(_m => _m.id);

            msg.channel.deleteMessages(msgs).then(() => {
                msg.channel.createMessage(`Deleted ${msgs.length} messages.`);
            });
        });
    } else {
        msg.channel.createMessage(
            '__Tidy usage__\n  all [num] - Last x messages (def. 10)\n  user <user> [num] - Messages from a user within x messages (def. 10)\n  bots [num] - Prune all bot messages within x messages (def. 50)\n  filter <"string"> [num] - Messages that contain a string within x messages (def. 10)'
        );
    }
};

let esteal = async function(ctx, msg, args) {
    if (!msg.channel.permissionsOf(ctx.bot.user.id).has("manageEmojis")) {
        msg.channel.createMessage("I do not have `Manage Emojis` permission.");
        return;
    }

    if (!args) {
        msg.channel.getMessages(15).then(m => {
            let emotes = m
                .filter(_m => {
                    /<(a)?:([a-zA-Z0-9_*/-:]*):([0-9]*)>/.test(_m.content);
                })
                .map(_m =>
                    _m.content.match(/<(a)?:([a-zA-Z0-9_*/-:]*):([0-9]*)>/)
                );
        });
    } else {
        args = ctx.utils.formatArgs(args);
    }
};

module.exports = [
    /*{
        name:"snipe",
        desc:"Snipe recently deleted messages.",
        func:snipe,
        group:"Server Utils"
    },
    {
        name:"esnipe",
        desc:"Snipe recently edited messages.",
        func:esnipe,
        group:"Server Utils"
    },*/
    {
        name: "dehoist",
        desc: "Dehoist a user's name or nickname.",
        func: dehoist,
        group: "Server Utils"
    },
    {
        name: "roleme",
        desc: "Allow users to get set roles on your server.",
        func: roleme,
        group: "Server Utils"
    },
    {
        name: "config",
        desc: "Configure server specific values of HiddenPhox.",
        func: sconfig,
        group: "Server Utils",
        usage: "<subcommand> [key] [value]",
        aliases: ["settings"]
    },
    {
        name: "kick",
        desc: "Kick a user.",
        func: kick,
        group: "Server Utils",
        usage: "<user> [reason]"
    },
    {
        name: "ban",
        desc: "Ban a user. (can hackban)",
        func: ban,
        group: "Server Utils",
        usage: "<user> [reason]"
    },
    {
        name: "unban",
        desc: "Unban a user.",
        func: unban,
        group: "Server Utils",
        usage: "<user> [reason]"
    },
    {
        name: "multikick",
        desc: "Kick a group of users.",
        func: multikick,
        group: "Server Utils",
        usage: "<id1> <id2> ... [reason]"
    },

    {
        name: "tidy",
        desc: "Clean up messages.",
        func: tidy,
        group: "Server Utils",
        usage: "<subcommand> [arguments]",
        aliases: ["prune", "purge"]
    }
];
