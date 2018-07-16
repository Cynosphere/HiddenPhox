const ytdl = require("ytdl-core");
const scdl = require("youtube-dl");
const probe = require("node-ffprobe");

const ytregex = new RegExp(
    "(https?://)?(www\\.)?(youtube\\.com|youtu\\.?be)/.+$"
);
const plregex = new RegExp(
    "(https?://)?(www\\.)?(youtube\\.com|youtu\\.?be)/playlist\\?list=(.+)$"
);
const plregex2 = new RegExp("^PL[a-zA-Z0-9-_]{32}$");
const mp3regex = new RegExp("(https?://)?.*\\..*/.+\\.(mp3|ogg|flac|wav)$");
const scregex = new RegExp("(https?://)?(www\\.|m\\.)?soundcloud\\.com/.+/.+$");
const scregex2 = new RegExp("sc:.+/.+$");

let createEndFunction = function(id, url, type, msg, ctx) {
    if (ctx.vc.get(id).evntEnd) return;
    ctx.vc.get(id).queue = ctx.vc.get(id).queue ? ctx.vc.get(id).queue : [];

    ctx.vc.get(id).evntEnd = function() {
        if (!ctx.vc.get(id)) return;
        if (ctx.vc.get(id).queue.length > 0) {
            let item = ctx.vc.get(id).queue[0];
            doMusicThingsOk(id, item.url, item.type, msg, ctx, item.addedBy);
            ctx.vc.get(id).queue = ctx.vc
                .get(id)
                .queue.splice(1, ctx.vc.get(id).queue.length);
        } else {
            let conn = ctx.vc.get(id);
            if (!conn) return;
            conn.disconnect();
            if (ctx.vc.get(id).iwastoldtoleave === false) {
                msg.channel
                    .createMessage(
                        ":musical_note: Queue is empty, leaving voice channel."
                    )
                    .then(x => setTimeout(() => x.delete(), 10000));
            }
            conn.removeListener("error", e =>
                ctx.utils.logWarn(ctx, `[music] error catching: ${e}`)
            );
            conn.removeListener("warn", e =>
                ctx.utils.logWarn(ctx, `[music] warn catching: ${e}`)
            );
            ctx.vc.delete(id);
        }
    };

    ctx.vc.get(id).on("end", ctx.vc.get(id).evntEnd);
    ctx.vc
        .get(id)
        .on("error", e =>
            ctx.utils.logWarn(ctx, `[music] error catching: ${e}`)
        );
    ctx.vc
        .get(id)
        .on("warn", e => ctx.utils.logWarn(ctx, `[music] warn catching: ${e}`));
};

let doPlaylistThingsOk = async function(ctx, msg, url) {
    const plid =
        (url.match(plregex) && url.match(plregex)[5]) ||
        (url.match(plregex2) && url.match(plregex2)[0]);
    let req = await ctx.libs.superagent
        .get(
            `https://www.googleapis.com/youtube/v3/playlistItems?key=${
                ctx.apikeys.google
            }&part=snippet&playlistId=${plid}&maxResults=50`
        )
        .catch(e =>
            msg.channel
                .createMessage(
                    `:warning: Could not get playlist: \`${e.toString.replace(
                        "Error: ",
                        ""
                    )}\``
                )
                .then(x => setTimeout(() => x.delete(), 10000))
        );
    let data = req.body.items;

    for (const item in data) {
        setTimeout(
            async () =>
                await doMusicThingsOk(
                    msg.member.voiceState.channelID,
                    "https://youtu.be/" + data[item].snippet.resourceId.videoId,
                    "yt",
                    msg,
                    ctx,
                    msg.author.id
                ),
            1000 * item
        );
    }
};

let doMusicThingsOk = async function(id, url, type, msg, ctx, addedBy) {
    if (type == "yt") {
        if (ctx.vc.get(id)) {
            let conn = ctx.vc.get(id);
            if (!conn) return;
            if (conn.playing) {
                ytdl.getInfo(url, {}, function(err, info) {
                    if (err) {
                        msg.channel
                            .createMessage(
                                `:warning: Could not add video: \`${err
                                    .toString()
                                    .replace("Error: ", "")}\``
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                        return;
                    }
                    ctx.vc.get(msg.member.voiceState.channelID).queue.push({
                        url: url,
                        type: "yt",
                        title: info.title,
                        len: info.length_seconds * 1000,
                        addedBy: addedBy
                    });
                    if (info == null || info.title == null) {
                        msg.channel
                            .createMessage(
                                `:musical_note: Added \`${url}\` to queue.`
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                    } else {
                        msg.channel
                            .createMessage(
                                `:musical_note: Added \`${
                                    info.title
                                }\` to queue.`
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                    }
                });
            } else {
                conn.play(ytdl(url, { quality: "highestaudio" }), {
                    inlineVolume: true
                });
                ytdl.getInfo(url, {}, function(err, info) {
                    if (err) {
                        msg.channel
                            .createMessage(
                                `:warning: Could not add video: \`${err
                                    .toString()
                                    .replace("Error: ", "")}\``
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                        return;
                    }
                    if (info == null || info.title == null) {
                        msg.channel
                            .createMessage(
                                `:musical_note: Now playing: \`${url}\``
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                        conn.np = url;
                        conn.len = 0;
                        conn.start = Date.now();
                        conn.end = Date.now();
                    } else {
                        msg.channel
                            .createMessage(
                                `:musical_note: Now playing: \`${info.title}\``
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                        conn.np = {
                            title: info.title,
                            addedBy: addedBy
                        };
                        conn.len = info.length_seconds * 1000;
                        conn.start = Date.now();
                        conn.end = Date.now() + conn.len;
                    }
                });
            }
        } else {
            ctx.bot.joinVoiceChannel(id).then(conn => {
                ctx.vc.set(id, conn);
                ctx.vc.get(id).iwastoldtoleave = false;
                conn.play(ytdl(url, { quality: "highestaudio" }), {
                    inlineVolume: true
                });
                ytdl.getInfo(url, {}, function(err, info) {
                    if (err) {
                        msg.channel
                            .createMessage(
                                `:warning: Could not add video: \`${err
                                    .toString()
                                    .replace("Error: ", "")}\``
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                        return;
                    }
                    if (info == null || info.title == null) {
                        msg.channel
                            .createMessage(
                                `:musical_note: Now playing: \`${url}\``
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                        if (conn) conn.np = url;
                    } else {
                        msg.channel
                            .createMessage(
                                `:musical_note: Now playing: \`${info.title}\``
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                        conn.np = {
                            title: info.title,
                            addedBy: addedBy
                        };
                        conn.len = info.length_seconds * 1000;
                        conn.start = Date.now();
                        conn.end = Date.now() + conn.len;
                    }
                });
                createEndFunction(id, url, type, msg, ctx);
            });
        }
    } else if (type == "sc") {
        if (url.startsWith("sc:")) {
            url = "https://soundcloud.com/" + url.split("sc:").splice(1);
        }
        if (ctx.vc.get(id)) {
            let conn = ctx.vc.get(id);
            if (conn.playing) {
                try {
                    let scstream = scdl(url);
                    await scstream.on("info", info => {
                        ctx.vc.get(msg.member.voiceState.channelID).queue.push({
                            url: url,
                            type: "sc",
                            title: info.title,
                            len: info._duration_raw * 1000,
                            addedBy: addedBy
                        });
                        msg.channel
                            .createMessage(
                                `:musical_note: Added \`${
                                    info.title
                                }\` to queue.`
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                    });
                } catch (e) {
                    msg.channel
                        .createMessage(
                            `:warning: Error getting track: \`${e}\``
                        )
                        .then(x => setTimeout(() => x.delete(), 10000));
                }
            } else {
                let scstream = scdl(url);
                await scstream.on("info", info => {
                    msg.channel
                        .createMessage(
                            `:musical_note: Now playing: \`${info.title}\``
                        )
                        .then(x => setTimeout(() => x.delete(), 10000));
                    conn.np = {
                        title: info.title,
                        addedBy: addedBy
                    };
                    conn.len = info._duration_raw * 1000;
                    conn.start = Date.now();
                    conn.end = Date.now() + conn.len;

                    conn.play(info.url, { inlineVolume: true });
                });
            }
        } else {
            ctx.bot.joinVoiceChannel(id).then(async conn => {
                ctx.vc.set(id, conn);
                ctx.vc.get(id).iwastoldtoleave = false;
                let scstream = scdl(url);
                await scstream.on("info", info => {
                    msg.channel
                        .createMessage(
                            `:musical_note: Now playing: \`${info.title}\``
                        )
                        .then(x => setTimeout(() => x.delete(), 10000));
                    conn.np = {
                        title: info.title,
                        addedBy: addedBy
                    };
                    conn.len = info._duration_raw * 1000;
                    conn.start = Date.now();
                    conn.end = Date.now() + conn.len;

                    conn.play(info.url, { inlineVolume: true });
                });
                createEndFunction(id, url, type, msg, ctx);
            });
        }
    } else if (type == "mp3") {
        if (ctx.vc.get(id)) {
            let conn = ctx.vc.get(id);
            if (conn.playing) {
                probe(url, function(e, data) {
                    let title = data
                        ? `${
                              data.metadata
                                  ? data.metadata.artist
                                    ? data.metadata.artist
                                    : "<no artist>"
                                  : "<no metadata>"
                          } - ${
                              data.metadata
                                  ? data.metadata.title
                                    ? data.metadata.title
                                    : "<no title>"
                                  : "<no metadata>"
                          }`
                        : url;
                    ctx.vc.get(id).queue.push({
                        url: url,
                        type: "mp3",
                        title: title,
                        len: data ? Math.floor(data.format.duration) * 1000 : 0,
                        addedBy: addedBy
                    });
                    msg.channel
                        .createMessage(
                            `:musical_note: Added \`${title}\` to queue.`
                        )
                        .then(x => setTimeout(() => x.delete(), 10000));
                });
            } else {
                probe(url, function(e, data) {
                    let title = data
                        ? `${
                              data.metadata
                                  ? data.metadata.artist
                                    ? data.metadata.artist
                                    : "<no artist>"
                                  : "<no metadata>"
                          } - ${
                              data.metadata
                                  ? data.metadata.title
                                    ? data.metadata.title
                                    : "<no title>"
                                  : "<no metadata>"
                          }`
                        : url;
                    msg.channel
                        .createMessage(
                            `:musical_note: Now playing: \`${title}\``
                        )
                        .then(x => setTimeout(() => x.delete(), 10000));
                    conn.np = {
                        title: title,
                        addedBy: addedBy
                    };
                    conn.len = data
                        ? Math.floor(data.format.duration) * 1000
                        : 0;
                    conn.start = Date.now();
                    conn.end = Date.now() + conn.len;

                    conn.play(url, { inlineVolume: true });
                });
            }
        } else {
            ctx.bot.joinVoiceChannel(id).then(conn => {
                ctx.vc.set(id, conn);
                ctx.vc.get(id).iwastoldtoleave = false;
                probe(url, function(e, data) {
                    let title = data
                        ? `${
                              data.metadata
                                  ? data.metadata.artist
                                    ? data.metadata.artist
                                    : "<no artist>"
                                  : "<no metadata>"
                          } - ${
                              data.metadata
                                  ? data.metadata.title
                                    ? data.metadata.title
                                    : "<no title>"
                                  : "<no metadata>"
                          }`
                        : url;
                    msg.channel
                        .createMessage(
                            `:musical_note: Now playing: \`${title}\``
                        )
                        .then(x => setTimeout(() => x.delete(), 10000));
                    conn.np = {
                        title: title,
                        addedBy: addedBy
                    };
                    conn.len = data
                        ? Math.floor(data.format.duration) * 1000
                        : 0;
                    conn.start = Date.now();
                    conn.end = Date.now() + conn.len;

                    conn.play(url, { inlineVolume: true });
                });
                createEndFunction(id, url, type, msg, ctx);
            });
        }
    } else {
        msg.channel.createMessage(
            "Unknown type passed, what. Report this kthx."
        );
    }
};

let doSearchThingsOk = async function(id, str, msg, ctx) {
    let req = await ctx.libs.superagent.get(
        `https://www.googleapis.com/youtube/v3/search?key=${
            ctx.apikeys.google
        }&maxResults=5&part=snippet&type=video&q=${encodeURIComponent(str)}`
    );
    let data = req.body.items;

    let m = "Please type a number to choose your selection\n```ini\n";

    for (let i = 0; i < data.length; i++) {
        m =
            m +
            `[${i + 1}] ${data[i].snippet.title} from ${
                data[i].snippet.channelTitle
            }\n`;
    }

    m = m + "\n[c] Cancel\n```";

    ctx.utils.awaitMessage(
        ctx,
        msg,
        m,
        async _msg => {
            let value = parseInt(_msg.content);
            if (_msg.content == "c") {
                (await ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                    .botmsg).delete();
                _msg.delete().catch(() => {
                    return;
                });
                msg.channel.createMessage("Canceled.");
                ctx.bot.removeListener(
                    "messageCreate",
                    ctx.awaitMsgs.get(msg.channel.id)[msg.id].func
                );
            } else if (_msg.content == value) {
                (await ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                    .botmsg).delete();
                _msg.delete().catch(() => {
                    return;
                });
                let vid = data[value - 1];
                ctx.bot.removeListener(
                    "messageCreate",
                    ctx.awaitMsgs.get(msg.channel.id)[msg.id].func
                );

                doMusicThingsOk(
                    id,
                    "https://youtu.be/" + vid.id.videoId,
                    "yt",
                    msg,
                    ctx
                );
            }
            clearTimeout(ctx.awaitMsgs.get(msg.channel.id)[msg.id].timer);
        },
        30000
    );
};

let doQueueRemovalThingsOk = async function(ctx, msg, data) {
    let m = "Please type a number to choose your selection\n```ini\n";

    for (let i = 0; i < data.length; i++) {
        m = m + `[${i + 1}] ${data[i].title}\n`;
    }

    m = m + "\n[c] Cancel\n```";

    ctx.utils.awaitMessage(
        ctx,
        msg,
        m,
        async _msg => {
            let value = parseInt(_msg.content);
            if (_msg.content == "c") {
                (await ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                    .botmsg).delete();
                _msg.delete().catch(() => {
                    return;
                });
                msg.channel.createMessage("Canceled.");
                ctx.bot.removeListener(
                    "messageCreate",
                    ctx.awaitMsgs.get(msg.channel.id)[msg.id].func
                );
            } else if (_msg.content == value) {
                (await ctx.awaitMsgs.get(msg.channel.id)[msg.id]
                    .botmsg).delete();
                _msg.delete().catch(() => {
                    return;
                });
                let torem = data[value - 1];
                ctx.bot.removeListener(
                    "messageCreate",
                    ctx.awaitMsgs.get(msg.channel.id)[msg.id].func
                );

                msg.channel
                    .createMessage(`:x: Removed \`${torem.title}\` from queue.`)
                    .then(x => setTimeout(() => x.delete(), 10000));
                ctx.vc.get(msg.member.voiceState.channelID).queue = ctx.vc
                    .get(msg.member.voiceState.channelID)
                    .queue.filter(x => x.url !== torem.url);
            }
            clearTimeout(ctx.awaitMsgs.get(msg.channel.id)[msg.id].timer);
        },
        30000
    );
};

let func = function(ctx, msg, args) {
    if (!msg.channel.guild) {
        msg.channel.createMessage("This command can only be used in servers.");
        return;
    }

    let a = args.split(" ");
    let cmd = a[0];
    let cargs = a.splice(1, a.length).join(" ");

    if (cmd == "play" || cmd == "p") {
        if (msg.member.voiceState && msg.member.voiceState.channelID) {
            let processed = false;

            if (plregex.test(cargs) || plregex2.test(cargs)) {
                doPlaylistThingsOk(ctx, msg, cargs);
                processed = true;
            } else if (ytregex.test(cargs) && processed == false) {
                doMusicThingsOk(
                    msg.member.voiceState.channelID,
                    cargs,
                    "yt",
                    msg,
                    ctx,
                    msg.author.id
                );
                processed = true;
            } else if (scregex.test(cargs) || scregex2.test(cargs)) {
                doMusicThingsOk(
                    msg.member.voiceState.channelID,
                    cargs,
                    "sc",
                    msg,
                    ctx,
                    msg.author.id
                );
            } else if (mp3regex.test(cargs)) {
                doMusicThingsOk(
                    msg.member.voiceState.channelID,
                    cargs,
                    "mp3",
                    msg,
                    ctx
                );
            } else {
                doSearchThingsOk(
                    msg.member.voiceState.channelID,
                    cargs,
                    msg,
                    ctx
                );
            }
        } else {
            msg.channel.createMessage("You are not in a voice channel.");
        }
    } else if (cmd == "playlist" || cmd == "pl") {
        if (msg.member.voiceState && msg.member.voiceState.channelID) {
            if (plregex.test(cargs) || plregex2.test(cargs)) {
                doPlaylistThingsOk(ctx, msg, cargs);
            } else {
                msg.channel
                    .createMessage("Not a playlist")
                    .then(x => setTimeout(() => x.delete(), 10000));
            }
        } else {
            msg.channel
                .createMessage("You are not in a voice channel.")
                .then(x => setTimeout(() => x.delete(), 10000));
        }
    } else if (cmd == "leave" || cmd == "l") {
        if (msg.member.voiceState && msg.member.voiceState.channelID) {
            let conn = ctx.vc.get(msg.member.voiceState.channelID);
            if (conn) {
                if (conn.skiplocked == true) {
                    if (msg.member.permission.has("manageMessages")) {
                        msg.channel
                            .createMessage("ok bye :wave:")
                            .then(x => setTimeout(() => x.delete(), 10000));
                        conn.queue = {};
                        conn.iwastoldtoleave = true;
                        conn.stopPlaying();
                        ctx.bot.leaveVoiceChannel(
                            msg.member.voiceState.channelID
                        );
                    } else if (
                        conn.np.addedBy == msg.member &&
                        conn.queue.length == 0
                    ) {
                        msg.channel
                            .createMessage("ok bye :wave:")
                            .then(x => setTimeout(() => x.delete(), 10000));
                        conn.queue = {};
                        conn.iwastoldtoleave = true;
                        conn.stopPlaying();
                        ctx.bot.leaveVoiceChannel(
                            msg.member.voiceState.channelID
                        );
                    } else {
                        msg.channel
                            .createMessage(
                                `Skips locked, cannot leave, you do not have Manage Messages nor is the queue empty.`
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                    }
                } else {
                    msg.channel
                        .createMessage("ok bye :wave:")
                        .then(x => setTimeout(() => x.delete(), 10000));
                    conn.queue = {};
                    conn.iwastoldtoleave = true;
                    conn.stopPlaying();
                    ctx.bot.leaveVoiceChannel(msg.member.voiceState.channelID);
                }
            } else {
                msg.channel
                    .createMessage(
                        "No voice connection found, brute forcing disconnect."
                    )
                    .then(x => setTimeout(() => x.delete(), 10000));
                ctx.bot.leaveVoiceChannel(msg.member.voiceState.channelID);
            }
        } else {
            msg.channel
                .createMessage("You or the bot isn't in a voice channel.")
                .then(x => setTimeout(() => x.delete(), 10000));
        }
    } else if (cmd == "queue" || cmd == "q") {
        if (
            msg.member.voiceState &&
            msg.member.voiceState.channelID &&
            ctx.vc.get(msg.member.voiceState.channelID)
        ) {
            let conn = ctx.vc.get(msg.member.voiceState.channelID);
            conn.queue = conn.queue || [];

            let lqueue = [];
            for (let i in conn.queue) {
                let item = conn.queue[i];
                lqueue.push(
                    `${parseInt(i) + 1}. ${
                        item.title
                            ? item.title
                            : "<no title given> - " + item.url
                    } [${ctx.utils.remainingTime(item.len)}]`
                );
            }
            msg.channel.createMessage(
                `Current Queue:\n\`\`\`md\n0. ${
                    conn.np.title
                } [${ctx.utils.remainingTime(
                    Date.now() - conn.start
                )}/${ctx.utils.remainingTime(conn.len)}]\n${lqueue
                    .splice(0, 20)
                    .join("\n")}\n${
                    conn.queue.length > 20
                        ? `\n# Showing 20/${conn.queue.length}.`
                        : ""
                }\`\`\``
            );
        } else {
            msg.channel
                .createMessage("You or the bot isn't in a voice channel.")
                .then(x => setTimeout(() => x.delete(), 10000));
        }
    } else if (cmd == "skip" || cmd == "s") {
        if (
            msg.member.voiceState &&
            msg.member.voiceState.channelID &&
            ctx.vc.get(msg.member.voiceState.channelID)
        ) {
            let conn = ctx.vc.get(msg.member.voiceState.channelID);
            if (conn.skiplocked == true) {
                if (msg.member.permission.has("manageMessages")) {
                    conn.stopPlaying();
                    msg.channel.createMessage(`:musical_note: Skipped.`);
                } else if (conn.np.addedBy == msg.member) {
                    conn.stopPlaying();
                    msg.channel.createMessage(`:musical_note: Skipped.`);
                } else {
                    msg.channel.createMessage(
                        `Skips locked, cannot skip, you do not have Manage Messages nor added the song.\n(vote skips soon:tm:)`
                    );
                }
            } else {
                conn.stopPlaying();
                msg.channel.createMessage(`:musical_note: Skipped.`);
            }
        } else {
            msg.channel
                .createMessage("You or the bot isn't in a voice channel.")
                .then(x => setTimeout(() => x.delete(), 10000));
        }
    } else if (cmd == "np") {
        if (cargs) {
        } else {
            if (
                msg.member.voiceState &&
                msg.member.voiceState.channelID &&
                ctx.vc.get(msg.member.voiceState.channelID)
            ) {
                let conn = ctx.vc.get(msg.member.voiceState.channelID);
                msg.channel
                    .createMessage({
                        embed: {
                            title: `:musical_note: Now Playing`,
                            fields: [
                                {
                                    name: "Title",
                                    value: conn.np.title,
                                    inline: true
                                },
                                {
                                    name: "Remaining Time",
                                    value: `${ctx.utils.remainingTime(
                                        Date.now() - conn.start
                                    )}/${ctx.utils.remainingTime(conn.len)}`,
                                    inline: true
                                },
                                {
                                    name: "Added By",
                                    value: `<@${conn.np.addedBy}>`,
                                    inline: true
                                }
                            ],
                            color: 0xff8800
                        }
                    })
                    .then(x => setTimeout(() => x.delete(), 10000));
            } else {
                msg.channel
                    .createMessage("You or the bot isn't in a voice channel.")
                    .then(x => setTimeout(() => x.delete(), 10000));
            }
        }
    } else if (cmd == "volume" || cmd == "v") {
        if (
            msg.member.voiceState &&
            msg.member.voiceState.channelID &&
            ctx.vc.get(msg.member.voiceState.channelID)
        ) {
            let conn = ctx.vc.get(msg.member.voiceState.channelID);
            if (cargs) {
                let vol = parseInt(cargs);
                if (vol > 0 && vol < 151) {
                    conn.setVolume(vol / 100);
                    msg.channel
                        .createMessage(`:musical_note: Set volume to ${vol}.`)
                        .then(x => setTimeout(() => x.delete(), 10000));
                } else {
                    msg.channel
                        .createMessage(
                            `Volume not a number or not in the range of 1-150.`
                        )
                        .then(x => setTimeout(() => x.delete(), 10000));
                }
            } else {
                msg.channel
                    .createMessage(
                        `:musical_note: Current Volume: **${conn.volume *
                            100}**`
                    )
                    .then(x => setTimeout(() => x.delete(), 10000));
            }
        } else {
            msg.channel
                .createMessage("You are not in a voice channel.")
                .then(x => setTimeout(() => x.delete(), 10000));
        }
    } else if (cmd == "queuerem" || cmd == "qr") {
        if (
            msg.member.voiceState &&
            msg.member.voiceState.channelID &&
            ctx.vc.get(msg.member.voiceState.channelID)
        ) {
            let conn = ctx.vc.get(msg.member.voiceState.channelID);
            if (msg.member.permission.has("manageMessages")) {
                doQueueRemovalThingsOk(ctx, msg, conn.queue);
            } else if (
                conn.queue.filter(x => x.addedBy == msg.member.id).length > 0
            ) {
                doQueueRemovalThingsOk(
                    ctx,
                    msg,
                    conn.queue.filter(x => x.addedBy == msg.member.id)
                );
            } else {
                msg.channel
                    .createMessage(
                        "You do not have `Manage Messages` permission, nor have added anything to queue recently."
                    )
                    .then(x => setTimeout(() => x.delete(), 10000));
            }
        } else {
            msg.channel
                .createMessage("You are not in a voice channel.")
                .then(x => setTimeout(() => x.delete(), 10000));
        }
    } else if (cmd == "lock" || cmd == "\uD83D\uDD12") {
        if (
            msg.member.voiceState &&
            msg.member.voiceState.channelID &&
            ctx.vc.get(msg.member.voiceState.channelID)
        ) {
            let conn = ctx.vc.get(msg.member.voiceState.channelID);
            if (msg.member.permission.has("manageMessages")) {
                if (conn.skiplocked == true) {
                    msg.channel
                        .createMessage("Already locked.")
                        .then(x => setTimeout(() => x.delete(), 10000));
                    return;
                }
                msg.channel
                    .createMessage(
                        ":lock: Skips and queue are now locked to users with manage messages or the person who queued the song.\n<:blankboi:393555375389016065> Run `hf!music skipunlock` to return to open it back up."
                    )
                    .then(x => setTimeout(() => x.delete(), 10000));
                conn.skiplocked = true;
            } else {
                msg.channel
                    .createMessage(
                        "You do not have `Manage Messages` permission."
                    )
                    .then(x => setTimeout(() => x.delete(), 10000));
            }
        } else {
            msg.channel
                .createMessage("You or the bot isn't in a voice channel.")
                .then(x => setTimeout(() => x.delete(), 10000));
        }
    } else if (cmd == "unlock" || cmd == "\uD83D\uDD13") {
        if (
            msg.member.voiceState &&
            msg.member.voiceState.channelID &&
            ctx.vc.get(msg.member.voiceState.channelID)
        ) {
            let conn = ctx.vc.get(msg.member.voiceState.channelID);
            if (msg.member.permission.has("manageMessages")) {
                if (conn.skiplocked == false) {
                    msg.channel
                        .createMessage("Already unlocked.")
                        .then(x => setTimeout(() => x.delete(), 10000));
                    return;
                }
                msg.channel
                    .createMessage(
                        ":unlock: Skips and queue are now open to all!"
                    )
                    .then(x => setTimeout(() => x.delete(), 10000));
                conn.skiplocked = false;
            } else {
                msg.channel
                    .createMessage(
                        "You do not have `Manage Messages` permission."
                    )
                    .then(x => setTimeout(() => x.delete(), 10000));
            }
        } else {
            msg.channel
                .createMessage("You or the bot isn't in a voice channel.")
                .then(x => setTimeout(() => x.delete(), 10000));
        }
    } else if (cmd == "forceurl") {
        if (msg.member.id == "150745989836308480") {
            if (msg.member.voiceState && msg.member.voiceState.channelID) {
                doMusicThingsOk(
                    msg.member.voiceState.channelID,
                    cargs,
                    "mp3",
                    msg,
                    ctx
                );
            } else {
                msg.channel
                    .createMessage("You or the bot isn't in a voice channel.")
                    .then(x => setTimeout(() => x.delete(), 10000));
            }
        } else {
            msg.channel
                .createMessage("Haha no. I'm not that trusting.")
                .then(x => setTimeout(() => x.delete(), 10000));
        }
    } else {
        msg.channel.createMessage(`**__Music Subcommands__**
\u2022 **play/p [url|search string]** - Play a song or add to queue (YouTube/YT Playlist/SoundCloud/MP3/OGG/FLAC/WAV).
\u2022 **queue/q (page)** - List queue.
\u2022 **playlist/pl [url|playlist id]** - Playlist alias.
\u2022 **leave/l** - Leaves voice channel.
\u2022 **np** - Gets now playing song.
\u2022 **skip/s** - Skip current song.
\u2022 **volume/v** - Change volume. (1-150)
\u2022 **queuerem/qr** - Remove a song from queue.
\u2022 **lock/:lock:** - Lock skipping and queue.
\u2022 **unlock/:unlock:** - Unlock skipping and queue.`);
    }
};

module.exports = {
    name: "music",
    desc: 'Do "hf!music help" for full list of subcommands.',
    func: func,
    group: "fun"
};
