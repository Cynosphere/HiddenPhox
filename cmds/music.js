const ytdl = require("ytdl-core");
//const scdl = require("youtube-dl");
const probe = require("node-ffprobe");

//As it's impossible to get a SC API key, stealing youtube-dl's :^)
const scCID = "FweeGBOOEOYJWLJN3oEyToGLKhmSz0I7";

const ytregex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
const plregex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/playlist\?list=(.+)$/;
const plregex2 = /^PL[a-zA-Z0-9-_]{1,32}$/;
const mp3regex = /^(https?:\/\/)?.*\..*\/.+\.(mp3|ogg|flac|wav|webm|mp4|mov|mkv)$/;
const scregex = /^((https?:\/\/)?(www\.|m\.)?soundcloud\.com\/|sc:).+\/.+$/;
const scplregex = /^((https?:\/\/)?(www\.|m\.)?soundcloud\.com\/|sc:).+\/(sets\/.+|likes|tracks)$/;

/*async function grabYTVideoURL(ctx, url) {
    let vid = await ctx.libs.superagent.get(url).then(x => x.text);
    let data = JSON.parse(
        vid
            .match(
                /<script >var ytplayer = ytplayer \|\| \{\};ytplayer\.config = (.+)ytplayer\.load = function\(\) {yt\.player\.Application\.create\("player-api", ytplayer\.config\);ytplayer\.config\.loaded = true;};\(function\(\) {if \(!!window\.yt && yt\.player && yt\.player\.Application\) {ytplayer\.load\(\);}}\(\)\);<\/script>/
            )[1]
            .replace(/\\\\/g, "＼")
            .replace(/\\/g, "")
            .replace(/＼/g, "\\")
            .replace(/\\u0026/g, "&")
            .match(/"streamingData":(.+),"playbackTracking"/)[1]
    );

    return data.adaptiveFormats
        .filter(x => x.mimeType.startsWith("audio/"))
        .sort((a, b) => {
            return a.bitrate < b.bitrate ? 1 : a.bitrate > b.bitrate ? -1 : 0;
        })[0].url;
}*/

// https://stackoverflow.com/a/12646864 § "Updating to ES6 / ECMAScript 2015"
// wow im using comments wtf is wrong with me
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createEndFunction(id, url, type, msg, ctx) {
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
            setTimeout(_ => {
                conn.disconnect();
                if (ctx.vc.get(id).iwastoldtoleave === false) {
                    msg.channel
                        .createMessage(
                            ":musical_note: Queue is empty, leaving voice channel."
                        )
                        .then(x => setTimeout(() => x.delete(), 10000));
                }
                /*conn.removeListener("error", e =>
                    ctx.utils.logWarn(ctx, `[music] error catching: ${e}`)
                );
                conn.removeListener("warn", e =>
                    ctx.utils.logWarn(ctx, `[music] warn catching: ${e}`)
                );*/
                ctx.vc.delete(id);
            }, 1000);
        }
    };

    ctx.vc.get(id).on("end", ctx.vc.get(id).evntEnd);
    /*ctx.vc
        .get(id)
        .on("error", e =>
            ctx.utils.logWarn(ctx, `[music] error catching: ${e}`)
        );
    ctx.vc
        .get(id)
        .on("warn", e => ctx.utils.logWarn(ctx, `[music] warn catching: ${e}`));*/
}

async function doPlaylistThingsOk(ctx, msg, url, shuffle) {
    const plid =
        (url.match(plregex) && url.match(plregex)[4]) ||
        (url.match(plregex2) && url.match(plregex2)[0]);

    const baseURL = `https://www.googleapis.com/youtube/v3/playlistItems?key=${ctx.apikeys.google}&part=snippet&playlistId=${plid}&maxResults=50`;
    let req = await ctx.libs.superagent
        .get(baseURL)
        .catch(e =>
            msg.channel
                .createMessage(
                    `:warning: Could not get playlist: \`${e
                        .toString()
                        .replace("Error: ", "")}\``
                )
                .then(x => setTimeout(() => x.delete(), 10000))
        );
    let data = req.body.items;

    let pageToken = req.body.nextPageToken;
    let pages = Math.round(req.body.pageInfo.totalResults / 50);
    if (pageToken) {
        for (let i = 0; i < pages; i++) {
            let page = await ctx.libs.superagent
                .get(`${baseURL}&pageToken=${pageToken}`)
                .catch(e =>
                    msg.channel
                        .createMessage(
                            `:warning: Could not get playlist: \`${e
                                .toString()
                                .replace("Error: ", "")}\``
                        )
                        .then(x => setTimeout(() => x.delete(), 10000))
                );
            if (page.body.nextPageToken) pageToken = page.body.nextPageToken;
            let items = page.body.items;
            for (const item in items) {
                data.push(items[item]);
            }
        }
    }

    let out = await msg.channel.createMessage({
        embed: {
            title: "<a:typing:493087964742549515> Processing playlist...",
            description: `Processing ${data.length} items.`,
            color: 0xff80c0
        }
    });
    for (const item in data) {
        await doMusicThingsOk(
            msg.member.voiceState.channelID,
            "https://youtu.be/" + data[item].snippet.resourceId.videoId,
            "yt",
            msg,
            ctx,
            msg.author.id,
            true
        );

        if (item >= data.length - 1) {
            out.edit({
                embed: {
                    title: "<:ms_tick:503341995348066313> Processed playlist",
                    description: `Done processing!`,
                    color: 0xff80c0
                }
            }).then(x => setTimeout(() => x.delete(), 10000));
        }
    }
}

async function doSCPlaylistThingsOk(ctx, msg, url) {
    let playlistURL = await ctx.libs.superagent
        .get(
            `https://api.soundcloud.com/resolve.json?url=${url}&client_id=${scCID}`
        )
        .then(x => x.redirects[0]);

    const tracks = await ctx.libs.superagent
        .get(`${playlistURL}&limit=5000`)
        .then(x => x.body.tracks);

    let out = await msg.channel.createMessage({
        embed: {
            title: "<a:typing:493087964742549515> Processing playlist...",
            description: `Processing ${tracks.length} items.`,
            color: 0xff80c0
        }
    });
    for (const item in tracks) {
        await doMusicThingsOk(
            msg.member.voiceState.channelID,
            tracks[item].permalink_url,
            "sc",
            msg,
            ctx,
            msg.author.id,
            true
        );

        if (item >= tracks.length - 1) {
            out.edit({
                embed: {
                    title: "<:ms_tick:503341995348066313> Processed playlist",
                    description: `Done processing!`,
                    color: 0xff80c0
                }
            }).then(x => setTimeout(() => x.delete(), 10000));
        }
    }
}

async function doMusicThingsOk(id, url, type, msg, ctx, addedBy, playlist) {
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
                    if (playlist) return;
                    msg.channel
                        .createMessage({
                            embed: {
                                title: `<:ms_tick:503341995348066313> Added to queue`,
                                fields: [
                                    {
                                        name: "Title",
                                        value: info.title
                                            ? `[${info.title}](${url})`
                                            : url,
                                        inline: true
                                    },
                                    {
                                        name: "Length",
                                        value: info.length_seconds
                                            ? ctx.utils.remainingTime(
                                                  info.length_seconds * 1000
                                              )
                                            : "Unknown",
                                        inline: true
                                    },
                                    {
                                        name: "Added By",
                                        value: `<@${addedBy}>`,
                                        inline: true
                                    }
                                ],
                                color: 0x80ffc0,
                                thumbnail: {
                                    url: info.thumbnail_url
                                }
                            }
                        })
                        .then(x => setTimeout(() => x.delete(), 10000));
                });
            } else {
                conn.play(
                    ytdl(url, {
                        quality: "highestaudio",
                        filter: "audioonly",
                        highWaterMark: 1 << 25
                    }),
                    {
                        inlineVolume: true,
                        voiceDataTimeout: -1
                    }
                );
                ytdl.getInfo(url, {}, function(err, info) {
                    if (err) {
                        msg.channel
                            .createMessage(
                                `:warning: Could not play video: \`${err
                                    .toString()
                                    .replace("Error: ", "")}\``
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                        return;
                    }
                    msg.channel.createMessage({
                        embed: {
                            title: `:musical_note: Now Playing`,
                            fields: [
                                {
                                    name: "Title",
                                    value: info.title
                                        ? `[${info.title}](${url})`
                                        : url,
                                    inline: true
                                },
                                {
                                    name: "Length",
                                    value: info.length_seconds
                                        ? ctx.utils.remainingTime(
                                              info.length_seconds * 1000
                                          )
                                        : "Unknown",
                                    inline: true
                                },
                                {
                                    name: "Added By",
                                    value: `<@${addedBy}>`,
                                    inline: true
                                }
                            ],
                            color: 0x80c0ff,
                            thumbnail: {
                                url: info.thumbnail_url
                            }
                        }
                    });
                    conn.np = {
                        title: info.title,
                        addedBy: addedBy,
                        thumb: info.thumbnail_url
                    };
                    conn.len = info.length_seconds
                        ? info.length_seconds * 1000
                        : 0;
                    conn.start = Date.now();
                    conn.end = Date.now() + conn.len;
                });
            }
        } else {
            ctx.bot
                .joinVoiceChannel(id)
                .then(async conn => {
                    ctx.vc.set(id, conn);
                    ctx.vc.get(id).iwastoldtoleave = false;
                    conn.play(
                        ytdl(url, {
                            quality: "highestaudio",
                            filter: "audioonly",
                            highWaterMark: 1 << 25
                        }),
                        {
                            inlineVolume: true,
                            voiceDataTimeout: -1
                        }
                    );
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
                            msg.channel.createMessage({
                                embed: {
                                    title: `:musical_note: Now Playing`,
                                    fields: [
                                        {
                                            name: "Title",
                                            value: url,
                                            inline: true
                                        },
                                        {
                                            name: "Length",
                                            value: ctx.utils.remainingTime(
                                                info.length_seconds * 1000
                                            ),
                                            inline: true
                                        },
                                        {
                                            name: "Added By",
                                            value: `<@${addedBy}>`,
                                            inline: true
                                        }
                                    ],
                                    color: 0x80c0ff,
                                    thumbnail: {
                                        url: info.thumbnail_url
                                    }
                                }
                            });
                            if (conn) conn.np = url;
                        } else {
                            msg.channel.createMessage({
                                embed: {
                                    title: `:musical_note: Now Playing`,
                                    fields: [
                                        {
                                            name: "Title",
                                            value: `[${info.title}](${url})`,
                                            inline: true
                                        },
                                        {
                                            name: "Length",
                                            value: ctx.utils.remainingTime(
                                                info.length_seconds * 1000
                                            ),
                                            inline: true
                                        },
                                        {
                                            name: "Added By",
                                            value: `<@${addedBy}>`,
                                            inline: true
                                        }
                                    ],
                                    color: 0x80c0ff,
                                    thumbnail: {
                                        url: info.thumbnail_url
                                    }
                                }
                            });
                            conn.np = {
                                title: info.title,
                                addedBy: addedBy,
                                thumb: info.thumbnail_url
                            };
                            conn.len = info.length_seconds * 1000;
                            conn.start = Date.now();
                            conn.end = Date.now() + conn.len;
                        }
                    });
                    createEndFunction(id, url, type, msg, ctx);
                })
                .catch(e =>
                    msg.channel.createMessage(
                        `An error occured when joining: \`\`\`\n${e}\n\`\`\``
                    )
                );
        }
    } else if (type == "sc") {
        if (url.startsWith("sc:")) {
            url = "https://soundcloud.com/" + url.split("sc:").splice(1);
        }
        if (ctx.vc.get(id)) {
            let conn = ctx.vc.get(id);
            if (conn.playing) {
                let info = await ctx.libs.superagent
                    .get(
                        `https://api.soundcloud.com/resolve.json?url=${url}&client_id=${scCID}`
                    )
                    .then(x => x.body)
                    .catch(e =>
                        msg.channel
                            .createMessage(
                                `Error getting track:\n\`\`\`\n${e}\n\`\`\``
                            )
                            .then(x => setTimeout(() => x.delete(), 10000))
                    );
                ctx.vc.get(msg.member.voiceState.channelID).queue.push({
                    url: url,
                    type: "sc",
                    title: info.title,
                    len: info.duration,
                    addedBy: addedBy
                });
                if (playlist) return;
                msg.channel
                    .createMessage({
                        embed: {
                            title: `<:ms_tick:503341995348066313> Added to queue`,
                            fields: [
                                {
                                    name: "Title",
                                    value: `[${info.title}](${url})`,
                                    inline: true
                                },
                                {
                                    name: "Length",
                                    value: ctx.utils.remainingTime(
                                        info.duration
                                    ),
                                    inline: true
                                },
                                {
                                    name: "Added By",
                                    value: `<@${addedBy}>`,
                                    inline: true
                                }
                            ],
                            color: 0x80ffc0,
                            thumbnail: {
                                url: info.artwork_url
                            }
                        }
                    })
                    .then(x => setTimeout(() => x.delete(), 10000));
            } else {
                let info = await ctx.libs.superagent
                    .get(
                        `https://api.soundcloud.com/resolve.json?url=${url}&client_id=${scCID}`
                    )
                    .then(x => x.body)
                    .catch(e =>
                        msg.channel
                            .createMessage(
                                `Error getting track:\n\`\`\`\n${e}\n\`\`\``
                            )
                            .then(x => setTimeout(() => x.delete(), 10000))
                    );
                msg.channel.createMessage({
                    embed: {
                        title: `:musical_note: Now Playing`,
                        fields: [
                            {
                                name: "Title",
                                value: `[${info.title}](${url})`,
                                inline: true
                            },
                            {
                                name: "Length",
                                value: ctx.utils.remainingTime(info.duration),
                                inline: true
                            },
                            {
                                name: "Added By",
                                value: `<@${addedBy}>`,
                                inline: true
                            }
                        ],
                        color: 0x80c0ff,
                        thumbnail: {
                            url: info.artwork_url
                        }
                    }
                });
                conn.np = {
                    title: info.title,
                    addedBy: addedBy
                };
                conn.len = info.duration;
                conn.start = Date.now();
                conn.end = Date.now() + conn.len;

                conn.play(info.stream_url + "?client_id=" + scCID, {
                    inlineVolume: true,
                    voiceDataTimeout: -1
                });
            }
        } else {
            ctx.bot
                .joinVoiceChannel(id)
                .then(async conn => {
                    ctx.vc.set(id, conn);
                    ctx.vc.get(id).iwastoldtoleave = false;
                    let info = await ctx.libs.superagent
                        .get(
                            `https://api.soundcloud.com/resolve.json?url=${url}&client_id=${scCID}`
                        )
                        .then(x => x.body)
                        .catch(e =>
                            msg.channel
                                .createMessage(
                                    `Error getting track:\n\`\`\`\n${e}\n\`\`\``
                                )
                                .then(x => setTimeout(() => x.delete(), 10000))
                        );
                    msg.channel.createMessage({
                        embed: {
                            title: `:musical_note: Now Playing`,
                            fields: [
                                {
                                    name: "Title",
                                    value: `[${info.title}](${url})`,
                                    inline: true
                                },
                                {
                                    name: "Length",
                                    value: ctx.utils.remainingTime(
                                        info.duration
                                    ),
                                    inline: true
                                },
                                {
                                    name: "Added By",
                                    value: `<@${addedBy}>`,
                                    inline: true
                                }
                            ],
                            color: 0x80c0ff,
                            thumbnail: {
                                url: info.artwork_url
                            }
                        }
                    });
                    conn.np = {
                        title: info.title,
                        addedBy: addedBy
                    };
                    conn.len = info.duration;
                    conn.start = Date.now();
                    conn.end = Date.now() + conn.len;

                    conn.play(info.stream_url + "?client_id=" + scCID, {
                        inlineVolume: true,
                        voiceDataTimeout: -1
                    });
                    createEndFunction(id, url, type, msg, ctx);
                })
                .catch(e =>
                    msg.channel.createMessage(
                        `An error occured when joining: \`\`\`\n${e}\n\`\`\``
                    )
                );
        }
    } else if (type == "mp3") {
        if (ctx.vc.get(id)) {
            let conn = ctx.vc.get(id);
            if (conn.playing) {
                try {
                    probe(url, function(e, data) {
                        let title = url;
                        let stream = false;

                        if (
                            data &&
                            data.metadata &&
                            data.metadata.artist &&
                            data.metadata.title
                        ) {
                            title = `${data.metadata.artist} - ${data.metadata.title}`;
                        }
                        if (
                            data &&
                            data.metadata &&
                            data.metadata.ARTIST &&
                            data.metadata.TITLE
                        ) {
                            title = `${data.metadata.ARTIST} - ${data.metadata.TITLE}`;
                        }
                        if (
                            data &&
                            data.metadata &&
                            (data.metadata["icy-name"] ||
                                data.metadata["Icy-Name"]) &&
                            data.metadata.StreamTitle
                        ) {
                            title = `${data.metadata.StreamTitle} [${
                                data.metadata["icy-name"]
                                    ? data.metadata["icy-name"]
                                    : data.metadata["Icy-Name"]
                            }]`;
                            stream = true;
                        }

                        ctx.vc.get(id).queue.push({
                            url: url,
                            type: "mp3",
                            title: title,
                            len: stream
                                ? 0
                                : data && data.format
                                ? Math.floor(data.format.duration) * 1000
                                : 0,
                            addedBy: addedBy,
                            stream: stream
                        });
                        msg.channel
                            .createMessage({
                                embed: {
                                    title: `<:ms_tick:503341995348066313> Added to queue`,
                                    fields: [
                                        {
                                            name: "Title",
                                            value: title,
                                            inline: true
                                        },
                                        {
                                            name: "Length",
                                            value: ctx.utils.remainingTime(
                                                stream
                                                    ? 0
                                                    : data && data.format
                                                    ? Math.floor(
                                                          data.format.duration
                                                      ) * 1000
                                                    : 0
                                            ),
                                            inline: true
                                        },
                                        {
                                            name: "Added By",
                                            value: `<@${addedBy}>`,
                                            inline: true
                                        }
                                    ],
                                    color: 0x80ffc0
                                }
                            })
                            .then(x => setTimeout(() => x.delete(), 10000));
                    });
                } catch (e) {
                    msg.channel
                        .createMessage(`An error occured: \`\`\`\n${e}\n\`\`\``)
                        .then(x => setTimeout(() => x.delete(), 10000));
                    ctx.utils.logWarn(
                        ctx,
                        "[ffprobe] ffprobe machine :b:roke: " + e
                    );
                }
            } else {
                try {
                    conn.play(url, {
                        inlineVolume: true,
                        voiceDataTimeout: -1
                    });
                    probe(url, function(e, data) {
                        let title = url;
                        let stream = false;

                        if (
                            data &&
                            data.metadata &&
                            data.metadata.artist &&
                            data.metadata.title
                        ) {
                            title = `${data.metadata.artist} - ${data.metadata.title}`;
                        }
                        if (
                            data &&
                            data.metadata &&
                            data.metadata.ARTIST &&
                            data.metadata.TITLE
                        ) {
                            title = `${data.metadata.ARTIST} - ${data.metadata.TITLE}`;
                        }
                        if (
                            data &&
                            data.metadata &&
                            data.metadata["icy-name"] &&
                            data.metadata.StreamTitle
                        ) {
                            title = `${data.metadata.StreamTitle} [${
                                data.metadata["icy-name"]
                            }]`;
                            stream = true;
                        }

                        msg.channel.createMessage({
                            embed: {
                                title: `:musical_note: Now Playing`,
                                fields: [
                                    {
                                        name: "Title",
                                        value: `[${title}](${url})`,
                                        inline: true
                                    },
                                    {
                                        name: "Length",
                                        value: ctx.utils.remainingTime(
                                            stream
                                                ? 0
                                                : data && data.format
                                                ? Math.floor(
                                                      data.format.duration
                                                  ) * 1000
                                                : 0
                                        ),
                                        inline: true
                                    },
                                    {
                                        name: "Added By",
                                        value: `<@${addedBy}>`,
                                        inline: true
                                    }
                                ],
                                color: 0x80c0ff
                            }
                        });
                        conn.np = {
                            url: url,
                            title: title,
                            addedBy: addedBy,
                            stream: stream
                        };
                        conn.len = stream
                            ? 0
                            : data && data.format
                            ? Math.floor(data.format.duration) * 1000
                            : 0;
                        conn.start = Date.now();
                        conn.end = Date.now() + conn.len;
                    });
                } catch (e) {
                    msg.channel
                        .createMessage(`An error occured: \`\`\`\n${e}\n\`\`\``)
                        .then(x => setTimeout(() => x.delete(), 10000));
                    ctx.utils.logWarn(
                        ctx,
                        "[ffprobe] ffprobe machine :b:roke: " + e
                    );
                }
            }
        } else {
            ctx.bot
                .joinVoiceChannel(id)
                .then(conn => {
                    ctx.vc.set(id, conn);
                    ctx.vc.get(id).iwastoldtoleave = false;
                    try {
                        conn.play(url, {
                            inlineVolume: true,
                            voiceDataTimeout: -1
                        });
                        probe(url, function(e, data) {
                            let title = url;
                            let stream = false;

                            if (
                                data &&
                                data.metadata &&
                                data.metadata.artist &&
                                data.metadata.title
                            ) {
                                title = `${data.metadata.artist} - ${data.metadata.title}`;
                            }
                            if (
                                data &&
                                data.metadata &&
                                data.metadata.ARTIST &&
                                data.metadata.TITLE
                            ) {
                                title = `${data.metadata.ARTIST} - ${data.metadata.TITLE}`;
                            }
                            if (
                                data &&
                                data.metadata &&
                                data.metadata["icy-name"] &&
                                data.metadata.StreamTitle
                            ) {
                                title = `${data.metadata.StreamTitle} [${
                                    data.metadata["icy-name"]
                                }]`;
                                stream = true;
                            }

                            msg.channel.createMessage({
                                embed: {
                                    title: `:musical_note: Now Playing`,
                                    fields: [
                                        {
                                            name: "Title",
                                            value: `[${title}](${url})`,
                                            inline: true
                                        },
                                        {
                                            name: "Length",
                                            value: ctx.utils.remainingTime(
                                                stream
                                                    ? 0
                                                    : data && data.format
                                                    ? Math.floor(
                                                          data.format.duration
                                                      ) * 1000
                                                    : 0
                                            ),
                                            inline: true
                                        },
                                        {
                                            name: "Added By",
                                            value: `<@${addedBy}>`,
                                            inline: true
                                        }
                                    ],
                                    color: 0x80c0ff
                                }
                            });
                            conn.np = {
                                url: url,
                                title: title,
                                addedBy: addedBy,
                                stream: stream
                            };
                            conn.len = stream
                                ? 0
                                : data && data.format
                                ? Math.floor(data.format.duration) * 1000
                                : 0;
                            conn.start = Date.now();
                            conn.end = Date.now() + conn.len;
                        });
                        createEndFunction(id, url, type, msg, ctx);
                    } catch (e) {
                        msg.channel
                            .createMessage(
                                `An error occured: \`\`\`\n${e}\n\`\`\``
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                        ctx.utils.logWarn(
                            ctx,
                            "[ffprobe] ffprobe machine :b:roke: " + e
                        );
                    }
                })
                .catch(e =>
                    msg.channel.createMessage(
                        `An error occured when joining: \`\`\`\n${e}\n\`\`\``
                    )
                );
        }
    } else {
        msg.channel.createMessage(
            `Unknown type \`${type}\` passed. Report this, thanks.`
        );
    }
}

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
            if (_msg.content == value) {
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
                    ctx,
                    msg.author.id
                );
            } else {
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
            if (_msg.content == value) {
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
                    .createMessage(
                        `<:ms_cross:503341994974773250> Removed \`${torem.title}\` from queue.`
                    )
                    .then(x => setTimeout(() => x.delete(), 10000));
                ctx.vc.get(msg.member.voiceState.channelID).queue = ctx.vc
                    .get(msg.member.voiceState.channelID)
                    .queue.filter(x => x.url !== torem.url);
            } else {
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
            } else if (scplregex.test(cargs)) {
                doSCPlaylistThingsOk(ctx, msg, cargs);
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
            } else if (scregex.test(cargs)) {
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
                    ctx,
                    msg.author.id
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
    } else if (cmd == "leave" || cmd == "l" || cmd == "stop") {
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
            msg.channel.guild.members.get(ctx.bot.user.id).voiceState &&
            msg.channel.guild.members.get(ctx.bot.user.id).voiceState
                .channelID &&
            ctx.vc.get(
                msg.channel.guild.members.get(ctx.bot.user.id).voiceState
                    .channelID
            )
        ) {
            let conn = ctx.vc.get(
                msg.channel.guild.members.get(ctx.bot.user.id).voiceState
                    .channelID
            );
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
            msg.channel
                .createMessage(
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
                )
                .then(x => setTimeout(() => x.delete(), 10000));
        } else {
            msg.channel
                .createMessage("The bot isn't in a voice channel.")
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

                if (conn.np.stream) {
                    try {
                        probe(conn.np.url, function(e, data) {
                            msg.channel
                                .createMessage({
                                    embed: {
                                        title: `:musical_note: Now Playing`,
                                        fields: [
                                            {
                                                name: "Title",
                                                value: `${
                                                    data.metadata.StreamTitle
                                                } [${
                                                    data.metadata["icy-name"]
                                                        ? data.metadata[
                                                              "icy-name"
                                                          ]
                                                        : data.metadata[
                                                              "Icy-Name"
                                                          ]
                                                }]`,
                                                inline: true
                                            },
                                            {
                                                name: "Remaining Time",
                                                value: `${ctx.utils.remainingTime(
                                                    Date.now() - conn.start
                                                )}/${ctx.utils.remainingTime(
                                                    0
                                                )}`,
                                                inline: true
                                            },
                                            {
                                                name: "Added By",
                                                value: `<@${conn.np.addedBy}>`,
                                                inline: true
                                            }
                                        ],
                                        color: 0x80c0ff,
                                        thumbnail: {
                                            url: conn.np.thumb
                                        }
                                    }
                                })
                                .then(x => setTimeout(() => x.delete(), 10000));
                        });
                    } catch (e) {
                        msg.channel
                            .createMessage(
                                `An error occured: \`\`\`\n${e}\n\`\`\``
                            )
                            .then(x => setTimeout(() => x.delete(), 10000));
                        ctx.utils.logWarn(
                            ctx,
                            "[ffprobe] ffprobe machine :b:roke: " + e
                        );
                    }
                } else {
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
                                        )}/${ctx.utils.remainingTime(
                                            conn.len
                                        )}`,
                                        inline: true
                                    },
                                    {
                                        name: "Added By",
                                        value: `<@${conn.np.addedBy}>`,
                                        inline: true
                                    }
                                ],
                                color: 0x80c0ff,
                                thumbnail: {
                                    url: conn.np.thumb
                                }
                            }
                        })
                        .then(x => setTimeout(() => x.delete(), 10000));
                }
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
    } else if (cmd == "pause") {
        if (
            msg.member.voiceState &&
            msg.member.voiceState.channelID &&
            ctx.vc.get(msg.member.voiceState.channelID)
        ) {
            let conn = ctx.vc.get(msg.member.voiceState.channelID);
            if (conn.np.stream) {
                msg.channel
                    .createMessage("Cannot pause streams.")
                    .then(x => setTimeout(() => x.delete(), 10000));
                return;
            }
            if (conn.paused) {
                conn.resume();
                conn.start = conn.__oldStart - conn.__paused + Date.now();
                msg.channel
                    .createMessage(":arrow_forward: Resumed.")
                    .then(x => setTimeout(() => x.delete(), 10000));
            } else {
                conn.pause();
                conn.__paused = Date.now();
                conn.__oldStart = conn.start;
                msg.channel
                    .createMessage(":pause_button: Paused.")
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
                        ":lock: Skips and queue are now locked to users with manage messages or the person who queued the song.\n<:blankboi:393555375389016065> Run `hf!music unlock` to return to open it back up."
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
        if (ctx.elevated.includes(msg.author.id)) {
            if (msg.member.voiceState && msg.member.voiceState.channelID) {
                doMusicThingsOk(
                    msg.member.voiceState.channelID,
                    cargs,
                    "mp3",
                    msg,
                    ctx,
                    msg.author.id
                );
            } else {
                msg.channel
                    .createMessage("You or the bot isn't in a voice channel.")
                    .then(x => setTimeout(() => x.delete(), 10000));
            }
        } else {
            msg.channel
                .createMessage("No\n\nSent from my iPhone.")
                .then(x => setTimeout(() => x.delete(), 10000));
        }
    } else {
        msg.channel.createMessage(
            `Invalid/missing subcommand. See \`${ctx.prefix}help music\` for all subcommands.`
        );
    }
};

module.exports = {
    name: "music",
    desc: 'Do "hf!music help" for full list of subcommands.',
    fulldesc: `
**__Music Subcommands__**
\u2022 **play/p [url|search string]** - Play a song or add to queue (YouTube/YT Playlist/SoundCloud/MP3/OGG/FLAC/WAV).
\u2022 **queue/q (page)** - List queue.
\u2022 **playlist/pl [url|playlist id]** - Playlist alias.
\u2022 **leave/l/stop** - Leaves voice channel.
\u2022 **np** - Gets now playing song.
\u2022 **skip/s** - Skip current song.
\u2022 **pause** - Pause and resume.
\u2022 **volume/v** - Change volume. (1-150)
\u2022 **queuerem/qr** - Remove a song from queue.
\u2022 **lock/:lock:** - Lock skipping and queue.
\u2022 **unlock/:unlock:** - Unlock skipping and queue.
    `,
    func: func,
    group: "music",
    aliases: ["m"]
};
