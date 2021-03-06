const superagent = require("superagent");
const sequelize = require("sequelize");

async function account(ctx, msg, args) {
    if (msg.author.bot) {
        msg.channel.createMessage(`Bots cannot create accounts.`);
        return;
    }
    try {
        let succ = await ctx.db.models.econ.create({ id: msg.author.id });
        msg.channel.createMessage(`Account \`${succ.id}\` created.`);
    } catch (e) {
        if (e.name === "SequelizeUniqueConstraintError") {
            msg.channel.createMessage("Account already created.");
        } else {
            msg.channel.createMessage("An error occured: `" + e + "`");
            ctx.utils.logWarn(
                ctx,
                `Error occured creating econ account: "${e}"`
            );
        }
    }
}

async function wallet(ctx, msg, args) {
    let accounts = await ctx.db.models.econ.findAll();

    function filter(m) {
        for (let i = 0; i < accounts.length; i++) {
            let acc = accounts[i];
            if (m.id == acc.id) return m;
        }
    }

    ctx.utils
        .lookupUser(ctx, msg, args || msg.author.mention, filter)
        .then(async (u) => {
            let wallet = await ctx.db.models.econ.findOne({
                where: { id: u.id },
            });
            if (wallet) {
                if (u.id == msg.author.id) {
                    msg.channel.createMessage(
                        `<@${u.id}>, your balance is \`${wallet.currency}FC\`.`
                    );
                } else {
                    msg.channel.createMessage(
                        `**${u.username}#${u.discriminator}**'s balance is \`${wallet.currency}FC\``
                    );
                }
            } else {
                msg.channel.createMessage(
                    `**${u.username}#${u.discriminator}** does not have an account.`
                );
            }
        });
}

async function top(ctx, msg, args) {
    if (args == "g" || args == "global" || !args) {
        let list = await ctx.db.models.econ.findAll();

        list = list.sort((a, b) => {
            if (a.currency < b.currency) {
                return 1;
            }
            if (a.currency > b.currency) {
                return -1;
            }
            return 0;
        });

        list = list.splice(0, 10);

        let _list = new ctx.utils.table(["#", "User", "Currency"]);
        for (let i = 0; i < list.length; i++) {
            let u = ctx.bot.users.get(list[i].id);
            if (u) {
                _list.addRow([
                    i + 1,
                    `${u.username}#${u.discriminator}`,
                    `${list[i].currency}FC`,
                ]);
            } else {
                _list.addRow([
                    i + 1,
                    `Uncached User (${list[i].id})`,
                    `${list[i].currency}FC`,
                ]);
            }
        }

        msg.channel.createMessage(
            `__**Top 10 People with Most PhoxCoins [Global]**__\`\`\`\n${_list.render()}\`\`\``
        );
    } else if (args == "l" || args == "local") {
        if (!msg.channel.guild) {
            msg.channel.createMessage(`Not in a guild`);
            return;
        }

        let list = await ctx.db.models.econ.findAll();

        list = list.filter((u) => msg.channel.guild.members.get(u.id));

        list = list.sort((a, b) => {
            if (a.currency < b.currency) {
                return 1;
            }
            if (a.currency > b.currency) {
                return -1;
            }
            return 0;
        });

        list = list.splice(0, 10);

        let _list = new ctx.utils.table(["#", "User", "Currency"]);
        for (let i = 0; i < list.length; i++) {
            let u = msg.channel.guild.members.get(list[i].id);
            _list.addRow([
                i + 1,
                `${u.user.username}#${u.user.discriminator}`,
                `${list[i].currency}FC`,
            ]);
        }

        msg.channel.createMessage(
            `__**Top 10 People with Most PhoxCoins [Local]**__\`\`\`\n${_list.render()}\`\`\``
        );
    } else if (args == "t" || args == "taxbanks") {
        let list = await ctx.db.models.taxbanks.findAll();

        list = list.sort((a, b) => {
            if (a.currency < b.currency) {
                return 1;
            }
            if (a.currency > b.currency) {
                return -1;
            }
            return 0;
        });

        list = list.splice(0, 10);

        let _list = new ctx.utils.table(["#", "Guild", "Currency"]);
        for (let i = 0; i < list.length; i++) {
            let g = ctx.bot.guilds.get(list[i].id);
            if (g) {
                _list.addRow([i + 1, g.name, `${list[i].currency}FC`]);
            } else {
                _list.addRow([
                    i + 1,
                    `Uncached/Left Guild (${list[i].id})`,
                    `${list[i].currency}FC`,
                ]);
            }
        }

        msg.channel.createMessage(
            `__**Top 10 Taxbanks**__\`\`\`\n${_list.render()}\`\`\``
        );
    }
}

async function noreact(ctx, msg, args) {
    let acc = await ctx.db.models.econ.findOne({
        where: { id: msg.author.id },
    });
    if (acc) {
        let state = !acc.noreact;
        ctx.db.models.econ.update(
            { noreact: state },
            { where: { id: msg.author.id } }
        );
        msg.channel.createMessage(
            `No reactions for \`${msg.author.id}\` set to \`${state}\``
        );
    } else {
        msg.channel.createMessage("No account found.");
    }
}

async function donate(ctx, msg, args) {
    if (!args || isNaN(parseInt(args))) {
        msg.channel.createMessage("Arguments missing or not a number.");
        return;
    }

    if (!msg.channel.guild) {
        msg.channel.createMessage("This command can only be used in guilds.");
        return;
    }

    let acc = await ctx.db.models.econ.findOne({
        where: { id: msg.author.id },
    });
    if (acc) {
        let value = Math.round(parseInt(args));
        if (value > acc.currency) {
            msg.channel.createMessage("Value exceeds funds in wallet.");
        } else if (value > -1) {
            ctx.db.models.econ.update(
                { currency: acc.currency - value },
                { where: { id: msg.author.id } }
            );
            let taxbank = await ctx.db.models.taxbanks.findOrCreate({
                where: { id: msg.channel.guild.id },
            });
            ctx.db.models.taxbanks.update(
                { currency: taxbank[0].dataValues.currency + value },
                { where: { id: msg.channel.guild.id } }
            );
            msg.channel.createMessage(
                `**${msg.author.username}#${
                    msg.author.discriminator
                }** has donated **${value}FC** to this server's taxbank. The taxbank is now ${
                    taxbank[0].dataValues.currency + value
                }FC.`
            );
        } else {
            msg.channel.createMessage("lol no. you're not getting free money.");
        }
    } else {
        msg.channel.createMessage("No account found.");
    }
}

let semoji = [
    ":cherries:",
    ":spades:",
    ":lemon:",
    ":diamonds:",
    ":seven:",
    ":clubs:",
    ":apple:",
    ":eyes:",
    ":hearts:",
    ":money_with_wings:",
];

async function slots(ctx, msg, args) {
    if (!args || isNaN(parseInt(args))) {
        msg.channel.createMessage("Arguments missing or not a number.");
        return;
    }

    let rl = ctx.ratelimits.get(msg.author.id);

    if (rl && rl.slots && rl.slots > new Date().getTime()) {
        msg.channel.createMessage(
            `You are being ratelimited. Time remaining: ${ctx.utils.remainingTime(
                new Date(rl.slots) - new Date()
            )}`
        );
        return;
    }

    let acc = await ctx.db.models.econ.findOne({
        where: { id: msg.author.id },
    });
    if (acc) {
        let value = Math.round(parseInt(args));
        if (value > acc.currency) {
            msg.channel.createMessage("Value exceeds funds in wallet.");
        } else if (value < 0) {
            msg.channel.createMessage("lol no. you're not getting free money.");
        } else {
            ctx.db.models.econ.update(
                { currency: acc.currency - value },
                { where: { id: msg.author.id } }
            );

            //old code cause lazy :^)
            let res = "";

            let s = [[], [], []];

            for (let i = 0; i < 3; i++) {
                let rnd = Math.floor(Math.random() * semoji.length);
                s[i] = [];
                s[i][0] =
                    rnd == 0 ? semoji[semoji.length - 1] : semoji[rnd - 1];
                s[i][1] = semoji[rnd];
                s[i][2] =
                    rnd == semoji.length - 1 ? semoji[0] : semoji[rnd + 1];
            }

            res +=
                ":black_large_square:" +
                s[0][0] +
                s[1][0] +
                s[2][0] +
                ":black_large_square:";
            res +=
                "\n:arrow_forward:" +
                s[0][1] +
                s[1][1] +
                s[2][1] +
                ":arrow_backward:";
            res +=
                "\n:black_large_square:" +
                s[0][2] +
                s[1][2] +
                s[2][2] +
                ":black_large_square:";

            if (s[0][1] == s[1][1] && s[1][1] == s[2][1]) {
                res += `\n\nYou won **${value * 2}FC**.`;
                ctx.db.models.econ.update(
                    { currency: acc.currency + value * 2 },
                    { where: { id: msg.author.id } }
                );
            } else {
                res += "\n\nSorry, you lost.";
            }

            if (rl) {
                rl.slots = new Date().getTime() + 15000;
                ctx.ratelimits.set(msg.author.id, rl);
            } else {
                ctx.ratelimits.set(msg.author.id, {
                    slots: new Date().getTime() + 15000,
                });
            }

            msg.channel.createMessage(res);
        }
    } else {
        msg.channel.createMessage("No account found.");
    }
}

async function daily(ctx, msg, args) {
    let acc = await ctx.db.models.econ.findOne({
        where: { id: msg.author.id },
    });
    if (acc) {
        let now = new Date().getTime();
        if (now >= acc.lastdaily) {
            let value = 10 + Math.floor(Math.random() * 91);

            ctx.db.models.econ.update(
                { currency: acc.currency + value, lastdaily: now + 86400000 },
                { where: { id: msg.author.id } }
            );
            msg.channel.createMessage(
                `**${msg.author.username}#${msg.author.discriminator}** claimed their daily reward and received **${value}FC**.`
            );
        } else {
            msg.channel.createMessage(
                `${
                    msg.author.mention
                }, your daily resets in ${ctx.utils.remainingTime(
                    acc.lastdaily - now
                )}`
            );
        }
    } else {
        msg.channel.createMessage(
            `You do not have an account, do \`${ctx.prefix}account\` to get an account.`
        );
    }
}

async function votereward(ctx, msg, args) {
    let acc = await ctx.db.models.econ.findOne({
        where: { id: msg.author.id },
    });
    if (acc) {
        let now = new Date().getTime();
        if (now >= acc.lastvote) {
            let voted = await superagent
                .get(
                    `https://discordbots.org/api/bots/${ctx.bot.user.id}/check?userId=${msg.author.id}`
                )
                .set("Authorization", ctx.apikeys.dbl)
                .then((x) => x.body.voted)
                .catch((e) => {
                    msg.channel.createMessage("An error occured.");
                    ctx.utils.logWarn(ctx, "[dbl:vote] " + e);
                });
            if (voted == 1) {
                let value = 25 + Math.floor(Math.random() * 26);

                ctx.db.models.econ.update(
                    {
                        currency: acc.currency + value,
                        lastvote: now + 43200000,
                    },
                    { where: { id: msg.author.id } }
                );
                msg.channel.createMessage(
                    `**${msg.author.username}#${msg.author.discriminator}** voted and recieved **${value}FC**.`
                );
            } else {
                msg.channel.createMessage(
                    "You have not yet voted. You can vote every 12 hours at <https://discordbots.org/bot/152172984373608449>.\n\nIf you did vote, wait a minute and try again."
                );
            }
        } else {
            msg.channel.createMessage(
                `${
                    msg.author.mention
                }, your vote resets in ${ctx.utils.remainingTime(
                    acc.lastvote - now
                )}`
            );
        }
    } else {
        msg.channel.createMessage(
            `You do not have an account, do \`${ctx.prefix}account\` to get an account.`
        );
    }
}

async function transfer(ctx, msg, args) {
    let owo = ctx.utils.formatArgs(args);

    if (!args || !owo[0]) {
        msg.channel.createMessage(
            `No arguments specified, usage: \`${ctx.prefix}transfer "user" amount\``
        );
        return;
    }

    let accounts = await ctx.db.models.econ.findAll();

    function filter(m) {
        for (let i = 0; i < accounts.length; i++) {
            let acc = accounts[i];
            if (m.id == acc.id) return m;
        }
    }

    let acc = await ctx.db.models.econ.findOne({
        where: { id: msg.author.id },
    });
    if (acc) {
        let u;

        try {
            u = await ctx.utils.lookupUser(
                ctx,
                msg,
                owo[0] || msg.author.mention,
                filter
            );
        } catch (e) {
            msg.channel.createMessage(e);
        }
        if (msg.author.id == u.id) {
            msg.channel.createMessage(`You can't send money to yourself.`);
            return;
        }

        let target = await ctx.db.models.econ.findOne({ where: { id: u.id } });

        if (target) {
            if (!owo[1]) {
                msg.channel.createMessage(
                    `No amount specified, usage: \`${ctx.prefix}transfer user,amount\``
                );
                return;
            }
            let value = Math.round(parseInt(owo[1]));
            let tax = Math.round(value * 0.0225);

            if (isNaN(value) || value < 1) {
                msg.channel.createMessage(
                    `Amount not a number or less than 1.`
                );
                return;
            }
            if (value > acc.currency) {
                msg.channel.createMessage("Value exceeds funds in wallet.");
                return;
            }

            let pin = `${Math.floor(Math.random() * 10)}${Math.floor(
                Math.random() * 10
            )}${Math.floor(Math.random() * 10)}${Math.floor(
                Math.random() * 10
            )}`;

            ctx.utils.awaitMessage(
                ctx,
                msg,
                `${
                    msg.author.mention
                }, you're about to send **${value}FC** to **${u.username}#${
                    u.discriminator
                }**.\n\`\`\`diff\n- ${value}FC | transfer\n- ${tax}FC | 2.25% tax\n%%%%\n% ${
                    value - tax
                }FC sent\`\`\`\n\nTo complete transaction, type \`${pin}\`, else type \`c\` or \`cancel\``,
                async (m) => {
                    if (m.content == pin) {
                        ctx.db.models.econ.update(
                            { currency: acc.currency - value },
                            { where: { id: msg.author.id } }
                        );
                        ctx.db.models.econ.update(
                            { currency: target.currency + (value - tax) },
                            { where: { id: u.id } }
                        );

                        if (msg.channel.guild) {
                            let taxbank = await ctx.db.models.taxbanks.findOrCreate(
                                { where: { id: msg.channel.guild.id } }
                            );
                            ctx.db.models.taxbanks.update(
                                {
                                    currency:
                                        taxbank[0].dataValues.currency + tax,
                                },
                                { where: { id: msg.channel.guild.id } }
                            );
                        }

                        let dm = await ctx.bot.getDMChannel(u.id);
                        dm.createMessage(
                            `**${msg.author.username}#${
                                msg.author.discriminator
                            }** sent you **${value - tax}FC**.`
                        );

                        msg.channel.createMessage("Transaction complete.");
                        ctx.bot.removeListener(
                            "messageCreate",
                            ctx.awaitMsgs.get(msg.channel.id)[msg.id].func
                        );
                    } else {
                        msg.channel.createMessage("Canceled.");
                        reject("Canceled");
                        ctx.bot.removeListener(
                            "messageCreate",
                            ctx.awaitMsgs.get(msg.channel.id)[msg.id].func
                        );
                    }
                }
            );
        } else {
            msg.channel.createMessage("No account found for target.");
        }
    } else {
        msg.channel.createMessage("No account found for sender.");
    }
}

/* Start Steal Code Stuffs */
async function jail(ctx, user) {
    let data = await ctx.db.models.econ.findOne({ where: { id: user.id } });

    await ctx.db.models.econ.update(
        { cd_jail: new Date().getTime() + 8 * 60 * 60 * 1000 },
        { where: { id: user.id } }
    );
    ctx.utils.logInfo(
        ctx,
        `[ECON] Jailed ${user.username}#${user.discriminator}.`
    );
}

async function grace(ctx, user) {
    let data = await ctx.db.models.econ.findOne({ where: { id: user.id } });

    await ctx.db.models.econ.update(
        { cd_grace: new Date().getTime() + 6 * 60 * 60 * 1000 },
        { where: { id: user.id } }
    );
    ctx.utils.logInfo(
        ctx,
        `[ECON] Set grace period for ${user.username}#${user.discriminator}.`
    );
}

async function regen(ctx, user) {
    let data = await ctx.db.models.econ.findOne({ where: { id: user.id } });

    await ctx.db.models.econ.update(
        { cd_regen: new Date().getTime() + 5 * 60 * 60 * 1000 },
        { where: { id: user.id } }
    );
    ctx.utils.logInfo(
        ctx,
        `[ECON] Starting regen for ${user.username}#${user.discriminator}.`
    );
}

async function takepoint(ctx, user) {
    let data = await ctx.db.models.econ.findOne({ where: { id: user.id } });

    await ctx.db.models.econ.update(
        { points: sequelize.literal(`points-1`) },
        { where: { id: user.id } }
    );
    ctx.utils.logInfo(
        ctx,
        `[ECON] Removing a stealing point for ${user.username}#${user.discriminator}.`
    );
    if (data.points - 1 <= 0) {
        regen(ctx, user);
    }
}

async function steal(ctx, msg, args) {
    msg.channel.sendTyping();

    args = ctx.utils.formatArgs(args);
    let user = args[0];
    let amt = parseInt(args[1] || 0);

    if (!msg.channel.guild) {
        msg.channel.createMessage("Command can only be used in guilds.");
        return;
    }

    if (!user || !amt) {
        msg.channel.createMessage("Please specify a user and an amount.");
        return;
    }

    let accounts = await ctx.db.models.econ.findAll();

    function filter(m) {
        for (let i = 0; i < accounts.length; i++) {
            let acc = accounts[i];
            if (m.id == acc.id) return m;
        }
    }

    ctx.utils
        .lookupUser(ctx, msg, user || "", filter)
        .then(async (u) => {
            let tdata = await ctx.db.models.econ.findOne({
                where: { id: u.id },
            });
            let udata = await ctx.db.models.econ.findOne({
                where: { id: msg.author.id },
            });

            let now = new Date().getTime();

            if (!udata) {
                msg.channel.createMessage("You don't have an account.");
                return;
            }

            if (!tdata) {
                msg.channel.createMessage("Target doesn't have an account.");
                return;
            }

            if (isNaN(amt) || amt < 1) {
                msg.channel.createMessage(
                    "Amount less than 1 or not a number."
                );
                return;
            }

            if (udata.currency < 10) {
                msg.channel.createMessage(
                    "You cannot steal with less than 10FC."
                );
                return;
            }

            if (udata.cd_jail > now) {
                msg.channel.createMessage("You are still in jail.");
                return;
            }

            if (tdata.cd_grace > now) {
                msg.channel.createMessage(
                    "Cannot steal from target, they're still in grace period."
                );
                return;
            }

            if (udata.points == 0) {
                msg.channel.createMessage(
                    "You do not have any stealing points."
                );
                if (udata.cd_regen < now) {
                    regen(ctx, msg.author);
                }
                return;
            }

            if (tdata.currency < amt) {
                msg.channel.createMessage(
                    "Target has less than specified amount."
                );
                return;
            }

            let chance = 1 + tdata.currency / amt + 0.69;
            chance = chance > 10 ? 10 : chance;
            chance = parseFloat(chance.toFixed(3));

            let res = Math.random() * 15;
            res = parseFloat(res.toFixed(3));

            ctx.utils.logInfo(
                ctx,
                `[ECON] attempting steal amt:${amt}, u:${msg.author.username}#${msg.author.discriminator}, t:${u.username}#${u.discriminator}, c:${chance}, r:${res}`
            );

            if (res < chance) {
                await ctx.db.models.econ.update(
                    { currency: sequelize.literal(`currency+${amt}`) },
                    { where: { id: msg.author.id } }
                );
                await ctx.db.models.econ.update(
                    { currency: sequelize.literal(`currency-${amt}`) },
                    { where: { id: u.id } }
                );

                let dm = await ctx.bot.getDMChannel(u.id);
                dm.createMessage(
                    `**${msg.author.username}#${msg.author.discriminator}** stole **${amt}FC** from you.`
                );

                await grace(ctx, u);
                await takepoint(ctx, msg.author);

                await ctx.db.models.econ.update(
                    {
                        steals: sequelize.literal(`steals+1`),
                        steal_succ: sequelize.literal(`steal_succ+1`),
                    },
                    { where: { id: msg.author.id } }
                );

                msg.channel.createMessage(
                    `${msg.author.mention} Steal successful. Stole **${amt}FC**.\n\`res: ${res}, chance: ${chance}\``
                );
            } else {
                let oof = Math.round(amt / 2) < 1 ? amt : Math.round(amt / 2);
                await ctx.db.models.econ.update(
                    { currency: sequelize.literal(`currency-${oof}`) },
                    { where: { id: msg.author.id } }
                );

                let taxbank = await ctx.db.models.taxbanks.findOrCreate({
                    where: { id: msg.channel.guild.id },
                });
                await ctx.db.models.taxbanks.update(
                    { currency: sequelize.literal(`currency+${oof}`) },
                    { where: { id: msg.channel.guild.id } }
                );

                await jail(ctx, msg.author);
                await takepoint(ctx, msg.author);

                await ctx.db.models.econ.update(
                    {
                        steals: sequelize.literal(`steals+1`),
                        steal_fail: sequelize.literal(`steal_fail+1`),
                    },
                    { where: { id: msg.author.id } }
                );

                msg.channel.createMessage(
                    `${msg.author.mention} Steal failed. You are now jailed for **8 hours**.\n**${oof}FC** has been sent to **${msg.channel.guild.name}**'s taxbank.\n\`res: ${res}, chance: ${chance}\``
                );
            }
        })
        .catch((m) => {
            if (m == "No results." || m == "Canceled") {
                msg.channel.createMessage(m);
            } else {
                ctx.utils.logWarn(ctx, m.message);
            }
        });
}

async function sstate(ctx, msg, args) {
    let accounts = await ctx.db.models.econ.findAll();

    let filter = function (m) {
        for (let i = 0; i < accounts.length; i++) {
            let acc = accounts[i];
            if (m.id == acc.id) return m;
        }
    };

    ctx.utils
        .lookupUser(ctx, msg, args || msg.author.id, filter)
        .then(async (u) => {
            let data = await ctx.db.models.econ.findOne({
                where: { id: u.id },
            });
            let now = new Date().getTime();

            if (!data) {
                msg.channel.createMessage("User doesn't have an account.");
                return;
            }

            let out = [
                `__Stealing state for **${u.username}#${u.discriminator}**__`,
                `**Points:** ${data.points}`,
                `\n**Cooldowns:**`,
            ];

            if (data.cd_jail > now) {
                out.push(
                    `<:ms_cross:503341994974773250> **In Jail:** ${ctx.utils.remainingTime(
                        data.cd_jail - now
                    )} remaining.`
                );
            } else {
                out.push(`<:ms_tick:503341995348066313> **Not in jail.**`);
            }

            if (data.cd_grace > now) {
                out.push(
                    `<:ms_cross:503341994974773250> **Grace Period:** ${ctx.utils.remainingTime(
                        data.cd_grace - now
                    )} remaining.`
                );
            } else {
                out.push(
                    `<:ms_tick:503341995348066313> **Not in grace period.**`
                );
            }

            if (data.cd_heist > now) {
                out.push(
                    `<:ms_cross:503341994974773250> **Heist Cooldown:** ${ctx.utils.remainingTime(
                        data.cd_heist - now
                    )} remaining.`
                );
            } else {
                out.push(`<:ms_tick:503341995348066313> **Can heist.**`);
            }

            if (data.cd_regen > now) {
                out.push(
                    `<:ms_cross:503341994974773250> **Point Regen:** ${ctx.utils.remainingTime(
                        data.cd_regen - now
                    )} remaining.`
                );
            }

            msg.channel.createMessage(out.join("\n"));
        })
        .catch((m) => {
            if (m == "No results." || m == "Canceled") {
                msg.channel.createMessage(m);
            } else {
                ctx.utils.logWarn(ctx, m.message);
            }
        });
}
/* End Steal Code Stuffs */

/* Start Heist Code Stuffs */
function startHeist(ctx, msg) {}

async function heist(ctx, msg, args) {
    args = ctx.utils.formatArgs(args);

    let guild = args[0];
    let amt = args[1];

    let dbdata = await ctx.db.models.taxbanks.findOrCreate({
        where: { id: msg.channel.guild.id },
    });
    let data = {};

    let udata = await ctx.db.models.econ.findOne({
        where: { id: msg.author.id },
    });

    //get guild via lookup
    //  do checks before continuing
    //    - cooldown/grace
    //    - if owner has money
    //    - if guild has a taxbank (handled by lookup filtering already)
    //    - amount wanted to be stolen is enough
    //  make heist open
    //    setup heist collection object with guild, target,
    //  wait for people to join and either wait x minutes (15?) or call start subcommand
    //    - check if people have min amount of FC

    //when started
    //  do maths
    //  rng jails
    //  divide out money
    //  destroy collection
    //  apply cooldown and grace
}
/* End Heist Code Stuffs */

async function fcstats(ctx, msg, args) {
    let data = await ctx.db.models.econ.findAll();
    let tdata = await ctx.db.models.taxbanks.findAll();

    let fc = 0;
    let fct = 0;
    let steals = 0;
    let succs = 0;
    let fails = 0;

    for (const d of data.values()) {
        fc += d.dataValues.currency;
        steals += d.dataValues.steals;
        succs += d.dataValues.steal_succ;
        fails += d.dataValues.steal_fail;
    }
    for (const d of tdata.values()) {
        fct = fct + d.dataValues.currency;
    }

    msg.channel.createMessage({
        embed: {
            color: ctx.utils.topColor(ctx, msg, ctx.bot.user.id),
            title: "HiddenPhox Economy Stats",
            fields: [
                { name: "Total Accounts", value: data.length, inline: true },
                {
                    name: "Total PhoxCoins in circulation",
                    value: `${fc}FC`,
                    inline: true,
                },
                { name: "Total Taxbanks", value: tdata.length, inline: true },
                {
                    name: "Total PhoxCoins in taxbanks",
                    value: `${fct}FC`,
                    inline: true,
                },
                {
                    name: "Steal Successes",
                    value: `${succs}/${steals} (${Math.round(
                        ((steals - fails) / steals) * 100
                    )}%)`,
                    inline: true,
                },
                {
                    name: "Steal Fails",
                    value: `${fails}/${steals} (${Math.round(
                        ((steals - succs) / steals) * 100
                    )}%)`,
                    inline: true,
                },
            ],
        },
    });
}

async function taxbank(ctx, msg, args) {
    if (!msg.channel.guild) {
        msg.channel.createMessage("Command can only be used in guilds.");
        return;
    }

    let data = await ctx.db.models.taxbanks.findOne({
        where: { id: msg.channel.guild.id },
    });

    if (!data) {
        msg.channel.createMessage("This guild does not have a taxbank.");
    } else {
        msg.channel.createMessage(
            `**${msg.channel.guild.name}**'s taxbank has **${data.currency}FC**.`
        );
    }
}

module.exports = [
    {
        name: "account",
        desc: "Create a PhoxBank:tm: Account",
        func: account,
        group: "economy",
    },
    {
        name: "wallet",
        desc: "Check your PhoxBank:tm: balance",
        func: wallet,
        group: "economy",
        usage: "[user]",
        aliases: ["bal", "balance", "coins"],
    },
    {
        name: "top",
        desc: "Get PhoxBank:tm: top balances",
        func: top,
        group: "economy",
        usage: "[global, g, local, l, taxbanks, t]",
    },
    {
        name: "hidecoins",
        desc: "Hide reacts when you get PhoxCoins",
        func: noreact,
        group: "economy",
    },
    {
        name: "donate",
        desc: "Donate PhoxCoins to the server's taxbank",
        func: donate,
        group: "economy",
        usage: "<amount>",
    },
    {
        name: "slots",
        desc: 'Gamble away your "hard earned" PhoxCoins',
        func: slots,
        group: "economy",
        usage: "<amount>",
    },
    {
        name: "daily",
        desc: "Get 10-100 daily PhoxCoins",
        func: daily,
        group: "economy",
    },
    /*{
        name: "votereward",
        desc:
            "Get 25-50 PhoxCoins every 12 hours for voting on discordbots.org",
        func: votereward,
        group: "economy",
        aliases: ["getreward", "claimreward", "claimvote"]
    },*/
    {
        name: "transfer",
        desc: "Send PhoxCoins to someone",
        func: transfer,
        group: "economy",
        usage: "<user> <amount>",
    },
    {
        name: "steal",
        desc: "Steal PhoxCoins from a user.",
        fulldesc: `
To have a better chance of success it is recommended
to decrease the amount you want to steal from your target.

Once a target is successfully stolen from, they enter
a grace period where they can't be stolen from for 6 hours.

When you lose a steal, half of the amount you tried to steal is
transferred from your wallet to the server's taxbank.
(keep in mind you can go into debt with this mechanic)
        `,
        func: steal,
        group: "economy",
        usage: "<user> <amount>",
    },
    {
        name: "stealstate",
        desc: "Get your stealing state.",
        fulldesc: `
By having X "stealing points", you can only use
the steal command X times before receiving a cooldown.

With the command you can also look on cooldowns
currently applied to you.
        `,
        func: sstate,
        group: "economy",
    },
    {
        name: "fcstats",
        desc: "HiddenPhox Economy Stats.",
        fulldesc: `
Show information such as:
 - Total amount of FC in user accounts
 - Total amount of FC in taxbanks
 - Total amount of success steals done with the steal command.
 - Total amount of *fail* steals done with the steal command.
        `,
        func: fcstats,
        group: "economy",
        aliases: ["estats", "econstats"],
    },
    {
        name: "taxbank",
        desc: "Check how much the guild's taxbank has.",
        fulldesc: `
Taxbanks are PhoxCoin accounts that are tied to a server/guild.

Users can not operate those accounts at will, only the bot can.

The only operation is to donate to a taxbank through the donate command.
        `,
        func: taxbank,
        group: "economy",
        aliases: ["tb", "bank"],
    },
];
