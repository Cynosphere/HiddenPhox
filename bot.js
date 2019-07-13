const Eris = require("eris");
const config = require("./config.json");
const client = new Eris(config.token, {
    defaultImageFormat: "png",
    defaultImageSize: 1024
});

const ctx = {};
ctx.client = client;
ctx.bot = client;
const libs = {
    eris: Eris,
    jimp: require("jimp"),
    fs: require("fs"),
    reload: require("require-reload")(require),
    math: require("expr-eval").Parser,
    sequelize: require("sequelize"),
    superagent: require("superagent")
};

ctx.utils = require("./utils.js");

ctx.db = new libs.sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,

    // SQLite only
    storage: "database.sqlite",
    define: {
        freezeTableName: true
    }
});

let initDB = require("./utils/databases.js");
ctx.databases = initDB(ctx);

ctx.vc = new Eris.Collection();
ctx.cmds = new Eris.Collection();
ctx.emotes = new Eris.Collection();
ctx.events = new Eris.Collection();
ctx.awaitMsgs = new Eris.Collection();
ctx.ratelimits = new Eris.Collection();

ctx.prefix = config.prefix;

ctx.logid = config.logid;
ctx.ownerid = config.ownerid;
ctx.elevated = config.elevated;

ctx.apikeys = require("./apikeys.json");

client.on("ready", () => {
    console.log("HiddenPhox Instance Loaded.");
    console.log("Logged in as: " + client.user.username);

    client.getDMChannel(ctx.ownerid).then(c => {
        c.createMessage(":white_check_mark: Loaded HiddenPhox.");
    });

    /*if (ctx.apikeys.dbots)
        libs.superagent
            .post(`https://bots.discord.pw/api/bots/${ctx.bot.user.id}/stats`)
            .set("Authorization", ctx.apikeys.dbots)
            .send({ server_count: ctx.bot.guilds.size })
            .then(() => {
                ctx.utils.logInfo(ctx, `[dbots] Posted stats.`);
            })
            .catch(e => {
                ctx.utils.logWarn(ctx, `[dbots] Failed to post stats: "${e}"`);
            });

    if (ctx.apikeys.dbl)
        libs.superagent
            .post(`https://discordbots.org/api/bots/stats`)
            .set("Authorization", ctx.apikeys.dbl)
            .send({ server_count: ctx.bot.guilds.size })
            .then(() => {
                ctx.utils.logInfo(ctx, `[dbl] Posted stats.`);
            })
            .catch(e => {
                ctx.utils.logWarn(ctx, `[dbl] Failed to post stats: "${e}"`);
            });*/

    ctx.bot.guilds.forEach(g => {
        g.emojis.forEach(e => {
            e.guild_id = g.id;
            ctx.emotes.set(e.id, e);
        });
    });
});

client.on("guildCreate", function(guild) {
    let bots = 0;
    guild.members.forEach(m => {
        if (m.bot) ++bots;
    });

    /*if (ctx.apikeys.dbots)
        libs.superagent
            .post(`https://bots.discord.pw/api/bots/${ctx.bot.user.id}/stats`)
            .set("Authorization", ctx.apikeys.dbots)
            .send({ server_count: ctx.bot.guilds.size })
            .then(() => {
                ctx.utils.logInfo(ctx, `[dbots] Posted stats.`);
            })
            .catch(e => {
                ctx.utils.logWarn(ctx, `[dbots] Failed to post stats: "${e}"`);
            });

    if (ctx.apikeys.dbl)
        libs.superagent
            .post(`https://discordbots.org/api/bots/stats`)
            .set("Authorization", ctx.apikeys.dbl)
            .send({ server_count: ctx.bot.guilds.size })
            .then(() => {
                ctx.utils.logInfo(ctx, `[dbl] Posted stats.`);
            })
            .catch(e => {
                ctx.utils.logWarn(ctx, `[dbl] Failed to post stats: "${e}"`);
            });*/

    ctx.utils.logInfo(
        ctx,
        `Joined Guild: '${guild.name}' (${guild.id}) | Percentage: ${Math.floor(
            (bots / guild.memberCount) * 100
        )}%, Bots: ${bots}, Humans: ${guild.memberCount - bots}, Total: ${
            guild.memberCount
        } | Now in ${ctx.bot.guilds.size} guilds.`
    );

    if (bots >= 50 && Math.floor((bots / guild.memberCount) * 100) >= 70) {
        ctx.utils.logInfo(
            ctx,
            `'${guild.name}' (${
                guild.id
            }) detected as a bot collection, leaving!`
        );
        guild.leave();
    }
});

client.on("guildDelete", function(guild) {
    /*if (ctx.apikeys.dbots)
        libs.superagent
            .post(`https://bots.discord.pw/api/bots/${ctx.bot.user.id}/stats`)
            .set("Authorization", ctx.apikeys.dbots)
            .send({ server_count: ctx.bot.guilds.size })
            .then(() => {
                ctx.utils.logInfo(ctx, `[dbots] Posted stats.`);
            })
            .catch(e => {
                ctx.utils.logWarn(ctx, `[dbots] Failed to post stats: "${e}"`);
            });

    if (ctx.apikeys.dbl)
        libs.superagent
            .post(`https://discordbots.org/api/bots/stats`)
            .set("Authorization", ctx.apikeys.dbl)
            .send({ server_count: ctx.bot.guilds.size })
            .then(() => {
                ctx.utils.logInfo(ctx, `[dbl] Posted stats.`);
            })
            .catch(e => {
                ctx.utils.logWarn(ctx, `[dbl] Failed to post stats: "${e}"`);
            });*/

    ctx.utils.logInfo(
        ctx,
        `Left Guild: '${guild.name}' (${guild.id}) | Now in ${
            ctx.bot.guilds.size
        } guilds.`
    );
});

var files = libs.fs.readdirSync(__dirname + "/cmds");
for (let f of files) {
    let c = require(__dirname + "/cmds/" + f);

    if (c.name && c.func) {
        ctx.cmds.set(c.name, c);
        console.log(`Loaded Command: ${c.name}`);
    } else if (c.length) {
        for (let i = 0; i < c.length; i++) {
            let a = c[i];
            if (a.func && a.name) {
                ctx.cmds.set(a.name, a);
                console.log(`Loaded Command: ${a.name} (${f})`);
            }
        }
    }
}

let createEvent = function(client, e, ctx) {
    if (e.event == "timer") {
        if (!e.interval) {
            console.log(
                `No interval for event: ${e.event +
                    "|" +
                    e.name}, not setting up interval.`
            );
            return;
        }
        ctx.events.get(e.event + "|" + e.name).timer = setInterval(
            e.func,
            e.interval,
            ctx
        );
    } else {
        client.on(e.event, (...args) => e.func(...args, ctx));
    }
};

var files = libs.fs.readdirSync(__dirname + "/events");
for (let f of files) {
    ctx.libs = libs;
    let e = require(__dirname + "/events/" + f);
    if (e.event && e.func && e.name) {
        ctx.events.set(e.event + "|" + e.name, e);
        createEvent(client, e, ctx);
        console.log(`Loaded event: ${e.event}|${e.name} (${f})`);
    } else if (e.length) {
        for (let i = 0; i < e.length; i++) {
            let a = e[i];
            if (a.event && a.func && a.name) {
                ctx.events.set(a.event + "|" + a.name, a);
                createEvent(client, a, ctx);
                console.log(`Loaded event: ${a.event}|${a.name} (${f})`);
            }
        }
    }
}

async function commandHandler(msg) {
    ctx.libs = libs;
    if (msg.author) {
        if (msg.author.id == ctx.bot.user.id) return;
        if (msg.author.bot )
        let sdata = {};
        if (msg.channel.guild){
            sdata = await ctx.db.models.sdata.findOrCreate({
                where: { id: msg.channel.guild.id }
            });
        }

        if (msg.channel.guild && msg.author.bot && !sdata[0].dataValues.funallowed) return;

        let prefix = ctx.prefix;
        let prefix2 = ctx.bot.user.mention + " ";
        let prefix3 = msg.channel.guild ? sdata[0].dataValues.prefix : ""; //guild
        let prefix4 = await ctx.db.models.udata
            .findOrCreate({ where: { id: msg.author.id } })
            .then(x => x[0].dataValues.prefix); //personal
        let hasRan = false;
        let content = msg.content;

        if (content.startsWith(prefix2)) {
            content = content.replace(prefix2, prefix);
        }

        if (
            msg.channel.guild &&
            prefix3 !== "" &&
            content.startsWith(prefix3)
        ) {
            content = content.replace(prefix3, prefix);
        }

        if (prefix4 !== "" && content.startsWith(prefix4)) {
            content = content.replace(prefix4, prefix);
        }

        let [cmd, ...args] = content.split(" ");

        let [cmd2, ...args2] = msg.cleanContent.split(" ");

        cmd = cmd.toLowerCase();
        cmd2 = cmd2.toLowerCase();

        ctx.cmds.forEach(async c => {
            if (cmd == prefix + c.name) {
                if (
                    c.guild &&
                    msg.channel.guild &&
                    !c.guild.includes(msg.channel.guild.id)
                )
                    return;
                try {
                    c.func(ctx, msg, args.join(" "));
                    ctx.utils.logInfo(
                        ctx,
                        `'${msg.author.username}' (${
                            msg.author.id
                        }) ran command '${cmd2} ${
                            cmd2 == prefix + "eval"
                                ? "<eval redacted>"
                                : args2
                                      .join(" ")
                                      .split("")
                                      .splice(0, 50)
                                      .join("")
                        }${args2.join(" ").length > 50 ? "..." : ""}' in '#${
                            msg.channel.name ? msg.channel.name : msg.channel.id
                        }' on '${
                            msg.channel.guild ? msg.channel.guild.name : "DMs"
                        }'${
                            msg.channel.guild
                                ? " (" + msg.channel.guild.id + ")"
                                : ""
                        }`
                    );
                } catch (e) {
                    msg.channel.createMessage(
                        ":warning: An error occured.\n```\n" +
                            e.message +
                            "\n```"
                    );
                    ctx.utils.logWarn(
                        ctx,
                        `'${cmd2} ${
                            cmd2 == prefix + "eval"
                                ? "<eval redacted>"
                                : args2
                                      .join(" ")
                                      .split("")
                                      .splice(0, 50)
                                      .join("")
                        }${
                            args2.join(" ").length > 50 ? "..." : ""
                        }' errored with '${e.message}'`
                    );
                }

                hasRan = true;
                msg.hasRan = true;
            }

            if (
                c.aliases &&
                (cmd == prefix + c.name ||
                    cmd ==
                        prefix +
                            c.aliases.find(
                                a => a == cmd.replace(prefix, "")
                            )) &&
                !hasRan
            ) {
                if (
                    c.guild &&
                    msg.channel.guild &&
                    !c.guild.includes(msg.channel.guild.id)
                )
                    return;
                try {
                    c.func(ctx, msg, args.join(" "));
                    ctx.utils.logInfo(
                        ctx,
                        `'${msg.author.username}' (${
                            msg.author.id
                        }) ran guild command '${cmd2} ${
                            cmd2 == prefix + "eval"
                                ? "<eval redacted>"
                                : args2
                                      .join(" ")
                                      .split("")
                                      .splice(0, 50)
                                      .join("")
                        }${args2.join(" ").length > 50 ? "..." : ""}' in '#${
                            msg.channel.name ? msg.channel.name : msg.channel.id
                        }' on '${
                            msg.channel.guild ? msg.channel.guild.name : "DMs"
                        }'${
                            msg.channel.guild
                                ? " (" + msg.channel.guild.id + ")"
                                : ""
                        }`
                    );
                } catch (e) {
                    msg.channel.createMessage(
                        ":warning: An error occured.\n```\n" +
                            e.message +
                            "\n```"
                    );
                    ctx.utils.logWarn(
                        ctx,
                        `'${cmd2} ${
                            cmd2 == prefix + "eval"
                                ? "<eval redacted>"
                                : args2
                                      .join(" ")
                                      .split("")
                                      .splice(0, 50)
                                      .join("")
                        }${
                            args2.join(" ").length > 50 ? "..." : ""
                        }' errored with '${e.message}'`
                    );
                }

                hasRan = true;
                msg.hasRan = true;
            }
        });
    }
}

client.on("messageCreate", commandHandler);

client.on("messageUpdate", msg => {
    let oneday = Date.now() - 86400000;
    if (msg.timestamp > oneday && !msg.hasRan) {
        commandHandler(msg);
    }
});

process.on("unhandledRejection", (e, p) => {
    //console.log("Uncaught rejection: "+e.message);
    if (e.length > 1900) {
        ctx.utils.makeHaste(
            ctx,
            msg,
            `${e} (${p})`,
            "Uncaught rejection: Output too long to send in a message: "
        );
    } else {
        ctx.utils.logWarn(ctx, `Uncaught rejection: '${e}'`);
    }
});

client.on("error", e => {
    //console.log("Bot error: "+e.message);
    if (e.message.length > 1900) {
        ctx.utils.makeHaste(
            ctx,
            msg,
            e.message,
            "Error: Output too long to send in a message: "
        );
    } else {
        ctx.utils.logWarn(ctx, `Error: '${e.message}'`);
    }
});

client.connect();
