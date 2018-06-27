let utils = {};

utils.awaitMessage = function(ctx, msg, display, callback, timeout) {
    let dispMsg = msg.channel.createMessage(display);
    timeout = timeout ? timeout : 30000;
    if (!ctx.awaitMsgs.get(msg.channel.id)) {
        ctx.awaitMsgs.set(msg.channel.id, {});
    }
    if (ctx.awaitMsgs.get(msg.channel.id)[msg.id]) {
        clearTimeout(ctx.awaitMsgs.get(msg.channel.id)[msg.id].timer);
    }
    ctx.awaitMsgs.get(msg.channel.id)[msg.id] = {
        time: msg.timestamp,
        botmsg: dispMsg
    };

    let func;

    function regEvent() {
        return new Promise((resolve, reject) => {
            func = function(msg2) {
                if (msg2.author.id == msg.author.id) {
                    let response;
                    if (callback) {
                        response = callback(msg2);
                    } else response = true;
                    if (response) {
                        ctx.bot.removeListener("messageCreate", func);
                        clearTimeout(
                            ctx.awaitMsgs.get(msg.channel.id)[msg.id].timer
                        );
                        resolve(msg2);
                    }
                }
            };
            ctx.bot.on("messageCreate", func);
            ctx.awaitMsgs.get(msg.channel.id)[msg.id].func = func;
            ctx.awaitMsgs.get(msg.channel.id)[msg.id].timer = setTimeout(() => {
                ctx.bot.removeListener("messageCreate", func);
                reject("Request timed out.");
            }, timeout);
        });
    }

    return regEvent();
};

utils.lookupUser = function(ctx, msg, str, filter) {
    return new Promise((resolve, reject) => {
        if (/[0-9]{17,21}/.test(str)) {
            resolve(
                ctx.bot.requestHandler.request(
                    "GET",
                    "/users/" + str.match(/[0-9]{17,21}/)[0],
                    true
                )
            );
        }

        let userpool = [];
        if (filter) {
            let f = ctx.bot.users.filter(filter);
            f.forEach(m => {
                if (m.username.toLowerCase().indexOf(str.toLowerCase()) > -1) {
                    if (m.username.toLowerCase() == str.toLowerCase()) {
                        userpool = [m];
                    } else {
                        userpool.push(m);
                    }
                }
            });
        } else if (msg.channel.guild && !filter) {
            msg.channel.guild.members.forEach(m => {
                if (
                    m.username.toLowerCase().indexOf(str.toLowerCase()) > -1 ||
                    (m.nick &&
                        m.nick.toLowerCase().indexOf(str.toLowerCase()) > -1)
                ) {
                    if (
                        m.username.toLowerCase() == str.toLowerCase() ||
                        (m.nick && m.nick.toLowerCase() == str.toLowerCase())
                    ) {
                        userpool = [m];
                    } else {
                        userpool.push(m);
                    }
                }
            });
        } else {
            ctx.bot.users.forEach(m => {
                if (m.username.toLowerCase().indexOf(str.toLowerCase()) > -1) {
                    if (m.username.toLowerCase() == str.toLowerCase()) {
                        userpool = [m];
                    } else {
                        userpool.push(m);
                    }
                }
            });
        }

        if (userpool.length > 0) {
            if (userpool.length > 1) {
                let a = [];
                let u = 0;
                for (
                    let i = 0;
                    i < (userpool.length > 20 ? 20 : userpool.length);
                    i++
                ) {
                    a.push(
                        "[" +
                            (i + 1) +
                            "] " +
                            userpool[i].username +
                            "#" +
                            userpool[i].discriminator +
                            (msg.channel.guild
                                ? userpool[i].nick
                                  ? " (" + userpool[i].nick + ")"
                                  : ""
                                : "")
                    );
                }
                ctx.utils
                    .awaitMessage(
                        ctx,
                        msg,
                        "Multiple users found. Please pick from this list. \n```ini\n" +
                            a.join("\n") +
                            (userpool.length > 20
                                ? "\n; Displaying 20/" +
                                  userpool.length +
                                  " results, might want to refine your search."
                                : "") +
                            "\n\n[c] Cancel```",
                        async m => {
                            let value = parseInt(m.content);
                            if (m.content.toLowerCase() == "c") {
                                (await ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                    .botmsg).delete();
                                m.delete().catch(() => {
                                    return;
                                });
                                reject("Canceled");
                                ctx.bot.removeListener(
                                    "messageCreate",
                                    ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                        .func
                                );
                                clearTimeout(
                                    ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                        .timer
                                );
                            } else if (m.content == value) {
                                (await ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                    .botmsg).delete();
                                m.delete().catch(() => {
                                    return;
                                });
                                resolve(userpool[value - 1]);
                                ctx.bot.removeListener(
                                    "messageCreate",
                                    ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                        .func
                                );
                                clearTimeout(
                                    ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                        .timer
                                );
                            }
                        },
                        60000
                    )
                    .then(r => {
                        resolve(r);
                    });
            } else {
                resolve(userpool[0]);
            }
        } else {
            if (!/[0-9]{17,21}/.test(str)) {
                reject("No results.");
            }
        }
    });
};

utils.lookupGuild = function(ctx, msg, str, filter) {
    return new Promise((resolve, reject) => {
        if (/[0-9]{17,21}/.test(str)) {
            resolve(ctx.bot.guilds.get(str));
        }

        let userpool = [];
        if (filter) {
            let f = ctx.bot.guilds.filter(filter);
            f.forEach(m => {
                if (m.name.toLowerCase().indexOf(str.toLowerCase()) > -1) {
                    if (m.name.toLowerCase() == str.toLowerCase()) {
                        userpool = [m];
                    } else {
                        userpool.push(m);
                    }
                }
            });
        } else {
            ctx.bot.users.forEach(m => {
                if (m.name.toLowerCase().indexOf(str.toLowerCase()) > -1) {
                    if (m.name.toLowerCase() == str.toLowerCase()) {
                        userpool = [m];
                    } else {
                        userpool.push(m);
                    }
                }
            });
        }

        if (userpool.length > 0) {
            if (userpool.length > 1) {
                let a = [];
                let u = 0;
                for (
                    let i = 0;
                    i < (userpool.length > 20 ? 20 : userpool.length);
                    i++
                ) {
                    a.push("[" + (i + 1) + "] " + userpool[i].name);
                }
                ctx.utils
                    .awaitMessage(
                        ctx,
                        msg,
                        "Multiple guilds found. Please pick from this list. \n```ini\n" +
                            a.join("\n") +
                            (userpool.length > 20
                                ? "\n; Displaying 20/" +
                                  userpool.length +
                                  " results, might want to refine your search."
                                : "") +
                            "\n\n[c] Cancel```",
                        async m => {
                            let value = parseInt(m.content);
                            if (m.content.toLowerCase() == "c") {
                                (await ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                    .botmsg).delete();
                                m.delete().catch(() => {
                                    return;
                                });
                                reject("Canceled");
                                ctx.bot.removeListener(
                                    "messageCreate",
                                    ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                        .func
                                );
                            } else if (m.content == value) {
                                (await ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                    .botmsg).delete();
                                m.delete().catch(() => {
                                    return;
                                });
                                resolve(userpool[value - 1]);
                                ctx.bot.removeListener(
                                    "messageCreate",
                                    ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                        .func
                                );
                            }
                            clearTimeout(
                                ctx.awaitMsgs.get(msg.channel.id)[msg.id].timer
                            );
                        },
                        60000
                    )
                    .then(r => {
                        resolve(r);
                    });
            } else {
                resolve(userpool[0]);
            }
        } else {
            if (!/[0-9]{17,21}/.test(str)) {
                reject("No results.");
            }
        }
    });
};

utils.lookupRole = function(ctx, msg, str, filter) {
    return new Promise((resolve, reject) => {
        if (/[0-9]{17,21}/.test(str)) {
            resolve(msg.channel.guild.roles.get(str.match(/[0-9]{17,21}/)[0]));
        }

        let userpool = [];
        if (filter) {
            let f = msg.channel.guild.roles.filter(filter);
            f.forEach(r => {
                if (r.name.toLowerCase().indexOf(str.toLowerCase()) > -1) {
                    userpool.push(r);
                }
            });
        } else {
            msg.channel.guild.roles.forEach(r => {
                if (r.name.toLowerCase().indexOf(str.toLowerCase()) > -1) {
                    userpool.push(r);
                }
            });
        }

        if (userpool.length > 0) {
            if (userpool.length > 1) {
                let a = [];
                let u = 0;
                for (
                    let i = 0;
                    i < (userpool.length > 20 ? 20 : userpool.length);
                    i++
                ) {
                    a.push("[" + (i + 1) + "] " + userpool[i].name);
                }
                ctx.utils
                    .awaitMessage(
                        ctx,
                        msg,
                        "Multiple roles found. Please pick from this list. \n```ini\n" +
                            a.join("\n") +
                            (userpool.length > 20
                                ? "\n; Displaying 20/" +
                                  userpool.length +
                                  " results, might want to refine your search."
                                : "") +
                            "\n\n[c] Cancel```",
                        async m => {
                            let value = parseInt(m.content);
                            if (m.content.toLowerCase() == "c") {
                                (await ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                    .botmsg).delete();
                                m.delete().catch(() => {
                                    return;
                                });
                                reject("Canceled");
                                ctx.bot.removeListener(
                                    "messageCreate",
                                    ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                        .func
                                );
                            } else if (m.content == value) {
                                (await ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                    .botmsg).delete();
                                m.delete().catch(() => {
                                    return;
                                });
                                resolve(userpool[value - 1]);
                                ctx.bot.removeListener(
                                    "messageCreate",
                                    ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                                        .func
                                );
                            }
                            clearTimeout(
                                ctx.awaitMsgs.get(msg.channel.id)[msg.id].timer
                            );
                        },
                        30000
                    )
                    .then(r => {
                        resolve(r);
                    });
            } else {
                resolve(userpool[0]);
            }
        } else {
            if (!/[0-9]{17,21}/.test(str)) {
                reject("No results.");
            }
        }
    });
};

function timeString() {
    let d = new Date();
    let h = d.getHours();
    let m = d.getMinutes();
    let s = d.getSeconds();
    return (
        (h < 10 ? "0" + h : h) +
        ":" +
        (m < 10 ? "0" + m : m) +
        ":" +
        (s < 10 ? "0" + s : s)
    );
}

utils.safeString = function(str) {
    let s = str ? str.toString() : "";
    s = s.replace(/`/g, "'");
    s = s.replace(/<@/g, "<@\u200b");
    s = s.replace(/<#/g, "<#\u200b");
    s = s.replace(/<&/g, "<&\u200b");
    s = s.replace(/\n/g, " ");
    return s;
};

utils.logInfo = function(ctx, string) {
    let time = timeString();
    string = utils.safeString(string);
    ctx.bot.createMessage(
        ctx.logid,
        `:page_facing_up: **[INFO] [${time}]** \`${string}\``
    );
};

utils.logWarn = function(ctx, string) {
    let time = timeString();
    string = utils.safeString(string);
    ctx.bot.createMessage(
        ctx.logid,
        `:warning: **[WARN] [${time}]** \`${string}\``
    );
};

utils.logError = function(ctx, string) {
    let time = timeString();
    string = utils.safeString(string);
    ctx.bot.createMessage(
        ctx.logid,
        `<:RedTick:349381062054510604> **[ERROR] [${time}]** \`${string}\`\nCC: <@${
            ctx.ownerid
        }>`
    );
};

utils.remainingTime = function(owo) {
    let s = parseInt(owo) / 1000;
    let d = parseInt(s / 86400);
    s = s % 86400;
    let h = parseInt(s / 3600);
    s = s % 3600;
    let m = parseInt(s / 60);
    s = s % 60;
    s = parseInt(s);
    return (
        (d !== 0 ? (d < 10 ? "0" + d : d) + ":" : "") +
        (h !== 0 ? (h < 10 ? "0" + h : h) + ":" : "") +
        (m < 10 ? "0" + m : m) +
        ":" +
        (s < 10 ? "0" + s : s)
    );
};

utils.createEvent = function(client, type, func, ctx) {
    client.on(type, (...args) => func(...args, ctx));
};

utils.formatArgs = function(str) {
    return str.match(/\\?.|^$/g).reduce(
        (p, c) => {
            if (c === '"') {
                p.quote ^= 1;
            } else if (!p.quote && c === " ") {
                p.a.push("");
            } else {
                p.a[p.a.length - 1] += c.replace(/\\(.)/, "$1");
            }

            return p;
        },
        { a: [""] }
    ).a;
};

utils.topColor = function(ctx, msg, id) {
    let roles = msg.channel.guild.members
        .get(id)
        .roles.map(r => msg.channel.guild.roles.get(r))
        .filter(r => r.color);
    roles.sort((a, b) => {
        if (a.position < b.position) {
            return 1;
        }
        if (a.position > b.position) {
            return -1;
        }
        return 0;
    });

    return (roles[0] && roles[0].color) || 0x7289da;
};

utils.google = require("./utils/google.js");

utils.table = require("./utils/table.js");

module.exports = utils;
