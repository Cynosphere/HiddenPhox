const DuckDuckScrape = require("duck-duck-scrape");
const ddg = new DuckDuckScrape();

let calc = function(ctx, msg, args) {
    let a = args.split("|");
    let exp = a[0];
    let _x = a[1];
    _x = _x ? _x : 1;
    let parser = new ctx.libs.math();
    let result = parser.parse(exp).evaluate({ x: _x });
    msg.channel.createMessage(
        `Result: ${result} ${result == 69 ? "(nice)" : ""}`
    );
};

let yt = async function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage("Arguments are required!");
    } else {
        let req = await ctx.libs.superagent
            .get(
                `https://www.googleapis.com/youtube/v3/search?key=${
                    ctx.apikeys.google
                }&maxResults=5&part=snippet&type=video&q=${encodeURIComponent(
                    args
                )}`
            )
            .catch(e => {
                msg.channel.createMessage(
                    "An error occured getting data from YouTube."
                );
            });
        let data = req.body.items;

        let others = [];
        for (let i = 1; i < data.length; i++) {
            others.push(
                `- **${data[i].snippet.title}** | By: \`${data[i].snippet.channelTitle}\` | <https://youtu.be/${data[i].id.videoId}>`
            );
        }

        msg.channel.createMessage(
            `**${data[0].snippet.title}** | \`${
                data[0].snippet.channelTitle
            }\`\nhttps://youtu.be/${
                data[0].id.videoId
            }\n\n**__See Also:__**\n${others.join("\n")}`
        );
    }
};

let fyt = async function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage("Arguments are required!");
    } else {
        let req = await ctx.libs.superagent
            .get(
                `https://www.googleapis.com/youtube/v3/search?key=${
                    ctx.apikeys.google
                }&maxResults=2&part=snippet&type=video&q=${encodeURIComponent(
                    args
                )}`
            )
            .catch(e => {
                msg.channel.createMessage(
                    "An error occured getting data from YouTube."
                );
            });
        let data = req.body.items;

        msg.channel.createMessage(
            `**${data[0].snippet.title}** | \`${data[0].snippet.channelTitle}\`\nhttps://youtu.be/${data[0].id.videoId}`
        );
    }
};

let search = async function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage("Arguments are required!");
    } else {
        const data = await ddg.search(
            args,
            msg.channel &&
                msg.channel.nsfw &&
                !msg.channel.topic.includes("[no_nsfw]")
        );

        if (data.length > 0) {
            let first = data[0];
            let extras = data.splice(1, 5);

            msg.channel.createMessage({
                embed: {
                    color: 0xe37151,
                    title: first.title,
                    url: first.url,
                    description: first.description,
                    thumbnail: {
                        url: first.icon
                    },
                    fields: [
                        {
                            name: "See Also",
                            value: extras
                                .map(x => `[${x.title}](${x.url})`)
                                .join("\n")
                        }
                    ],
                    footer: {
                        icon_url:
                            "https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png",
                        text: "Powered by DuckDuckGo"
                    }
                }
            });
        } else {
            //Assume a DDG bang was used.
            const redir = await ctx.libs.superagent
                .get(
                    `https://api.duckduckgo.com/?q=${encodeURIComponent(
                        args
                    )}&format=json`
                )
                .then(x => x.redirects);
            if (!redir) return;

            msg.channel.createMessage(redir[redir.length - 1]);
        }
    }
};

let gimg = function(ctx, msg, args) {
    let giapi = require("google-images");
    let gimages = new giapi(ctx.apikeys.gimg, ctx.apikeys.google);

    if (!args) {
        msg.channel.createMessage("Arguments are required!");
    } else {
        gimages
            .search(args, {
                safe:
                    msg.channel &&
                    msg.channel.nsfw &&
                    !msg.channel.topic.includes("[no_nsfw]")
                        ? "off"
                        : "high"
            })
            .then(data => {
                let rand = Math.floor(Math.random() * data.length);
                let img = data[rand];

                msg.channel.createMessage({
                    embed: {
                        title: img.description,
                        url: img.parentPage,
                        image: {
                            url: img.url
                        },
                        footer: {
                            text: `Image ${rand +
                                1}/10, rerun to get a different image.`
                        }
                    }
                });
            });
    }
};

let fgimg = function(ctx, msg, args) {
    let giapi = require("google-images");
    let gimages = new giapi(ctx.apikeys.gimg, ctx.apikeys.google);

    if (!args) {
        msg.channel.createMessage("Arguments are required!");
    } else {
        gimages
            .search(args, {
                safe:
                    msg.channel &&
                    msg.channel.nsfw &&
                    !msg.channel.topic.includes("[no_nsfw]")
                        ? "off"
                        : "high"
            })
            .then(data => {
                let img = data[0];

                msg.channel.createMessage({
                    embed: {
                        title: img.description,
                        url: img.parentPage,
                        image: {
                            url: img.url
                        }
                    }
                });
            });
    }
};

let me_irl = async function(ctx, msg, args) {
    let req = await ctx.libs.superagent.get(
        "http://www.reddit.com/r/me_irl/top.json?sort=default&count=50"
    );

    let data = req.body.data.children;
    let post = data[Math.floor(Math.random() * data.length)].data;
    post.url = post.url.replace(
        /http(s)?:\/\/(m\.)?imgur\.com/g,
        "https://i.imgur.com"
    );
    post.url = post.url.replace(new RegExp("&amp;", "g"), "&");
    post.url = post.url.replace("/gallery", "");
    post.url = post.url.replace("?r", "");

    if (
        post.url.indexOf("imgur") > -1 &&
        post.url.substring(post.url.length - 4, post.url.length - 3) != "."
    ) {
        post.url += ".png";
    }

    msg.channel.createMessage({
        embed: {
            title: post.title,
            url: "https://reddit.com" + post.permalink,
            author: {
                name: "u/" + post.author
            },
            description: "[Image/Video](" + post.url + ")",
            image: {
                url: encodeURI(post.url)
            },
            footer: {
                text: "Powered by r/me_irl"
            }
        }
    });
};

let poll = function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage(
            `Usage: hf!poll "topic" "option 1" "option 2" ...`
        );
    } else {
        let opt = ctx.utils.formatArgs(args);
        let topic = opt[0];
        opt = opt.splice(1, 9);

        if (opt.length < 2) {
            msg.channel.createMessage("A minimum of two options are required.");
        } else {
            let opts = [];

            for (let i = 0; i < opt.length; i++) {
                opts.push(i + 1 + "\u20e3: " + opt[i]);
            }
            msg.channel
                .createMessage(
                    "**" +
                        msg.author.username +
                        "#" +
                        msg.author.discriminator +
                        "** has started a poll:\n**__" +
                        topic +
                        "__**\n" +
                        opts.join("\n")
                )
                .then(m => {
                    for (let i = 0; i < opt.length; i++) {
                        setTimeout(() => {
                            m.addReaction(i + 1 + "\u20e3");
                        }, 750 * i);
                    }
                });
        }
    }
};

let vote = function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage(`Usage: hf!vote topic`);
    } else {
        msg.channel
            .createMessage(
                `**${msg.author.username}#${msg.author.discriminator}** has started a vote:\n**__${args}__**\n<:ms_tick:503341995348066313>: Yes\n<:ms_cross:503341994974773250>: No`
            )
            .then(m => {
                m.addReaction(":ms_tick:503341995348066313");
                setTimeout(
                    () => m.addReaction(":ms_cross:503341994974773250"),
                    750
                );
            });
    }
};

let recipe = function(ctx, msg, args) {
    let randstr = "";
    for (i = 0; i < 60; i++) {
        randstr =
            randstr + String.fromCharCode(Math.floor(Math.random() * 93) + 34);
    }
    msg.channel.createMessage("", {
        file: new Buffer(
            "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*" +
                randstr
        ),
        name: "recipe.png"
    });
};

let currency = async function(ctx, msg, args) {
    const url =
        "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=$IN&to_currency=$OUT&apikey=$API";

    if (args) {
        args = args.split(" ");
        let amt = parseFloat(args[0]);
        let inp = args[1];
        let out = args[2];
        if (!amt || !inp || !out) {
            msg.channel.createMessage(
                `Missing arguments. Usage: \`${ctx.prefix}currency <amount> <from> <to>\``
            );
            return;
        }

        if (amt == NaN) amt = 1;

        let data = await ctx.libs.superagent
            .get(
                url
                    .replace("$IN", inp.toUpperCase())
                    .replace("$OUT", out.toUpperCase())
                    .replace("$API", ctx.apikeys.alphavantage)
            )
            .then(x => x.body);
        if (!data["Error Message"]) {
            data = data["Realtime Currency Exchange Rate"];
            let val = amt * parseFloat(data["5. Exchange Rate"]);
            let from = data["1. From_Currency Code"];
            let to = data["3. To_Currency Code"];

            msg.channel.createMessage(`${amt} ${from} = ${val} ${to}`);
        } else {
            msg.channel.createMessage(
                "One of the currency values were invalid."
            );
        }
    } else {
    }
};

const ytregex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/(.+)$/;
let rave = async function(ctx, msg, args) {
    args = ctx.utils.formatArgs(args);
    let vid1 = args[0];
    let vid2 = args[1];

    if (!ytregex.test(vid1)) {
        msg.channel.createMessage("Video 1 did not match YouTube format.");
        return;
    }
    if (!ytregex.test(vid2)) {
        msg.channel.createMessage("Video 2 did not match YouTube format.");
        return;
    }

    let id1 = vid1.match(ytregex)[4].replace("watch?v=", "");
    let id2 = vid2.match(ytregex)[4].replace("watch?v=", "");

    let token = await ctx.libs.superagent
        .post(
            "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyCB24TzTgYXl4sXwLyeY8y-XXgm0RX_eRQ"
        )
        .set({
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.92 Safari/537.36",
            Referer: "https://rave.dj/",
            Origin: "https://rave.dj/"
        })
        .send({ returnSecureToken: true })
        .then(x => x.body.idToken);

    let rdjid = await await ctx.libs.superagent
        .post("https://api.red.wemesh.ca/ravedj")
        .set({
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.92 Safari/537.36",
            Referer: "https://rave.dj/mix",
            Origin: "https://rave.dj/",
            "Content-Type": "application/json;charset=UTF-8",
            "wemesh-api-version": "5.0",
            "wemesh-platform": "Android",
            "client-version": "5.0",
            Authorization: `Bearer ${token}`
        })
        .send({
            style: "MASHUP",
            title: null,
            media: [
                { providerId: id1, provider: "YOUTUBE" },
                { providerId: id2, provider: "YOUTUBE" }
            ]
        })
        .then(x => x.body.data.id);

    msg.channel.createMessage(`https://rave.dj/${rdjid}`);
};

let wolfram = async function(ctx, msg, args) {
    let verbose = false;

    if (args.includes("-v")) {
        args = args.replace("-v ", "");
        verbose = true;
    }
    //not my key, not telling where i got it from tho
    let data = await ctx.libs.superagent
        .get(
            `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(
                args
            )}&appid=LH2K8H-T3QKETAGT3&output=json`
        )
        .then(x => JSON.parse(x.text));
    data = data.queryresult.pods;

    if (!data) {
        msg.channel.createMessage("<:ms_cross:503341994974773250> No answer.");
        return;
    }

    if (data[0].subpods[0].plaintext.includes("geoIP")) {
        //fake no answer
        msg.channel.createMessage("<:ms_cross:503341994974773250> No answer.");
        return;
    }

    if (verbose === true) {
        let embed = {
            title: `Result for: \`${args}\``,
            fields: [],
            footer: {
                icon_url: "http://www.wolframalpha.com/share.png",
                text: "Powered by Wolfram Alpha"
            },
            image: {
                url: data[1].subpods[0].img.src
            }
        };

        const extra = data.slice(1, 6);
        for (const x in extra) {
            embed.fields.push({
                name: extra[x].title,
                value: `[${
                    extra[x].subpods[0].plaintext.length > 0
                        ? extra[x].subpods[0].plaintext
                        : "<click for image>"
                }](${extra[x].subpods[0].img.src})`,
                inline: true
            });
        }

        msg.channel.createMessage({ embed: embed });
    } else {
        msg.channel.createMessage(
            `\`${ctx.utils.safeString(args)}\` -> ${
                data[1].subpods[0].plaintext.length > 0
                    ? ctx.utils.safeString(data[1].subpods[0].plaintext)
                    : data[1].subpods[0].img.src
            }`
        );
    }
};

let no = function(ctx, msg, args) {
    msg.channel.createMessage("No\n\nSent from my iPhone.");
};

let br = function(ctx, msg, args) {
    msg.channel.createMessage("br?");
};

const UPLOAD_LIMIT = 8388119;

const twitterurl = /(?:\s|^)https?:\/\/(www\.)?twitter\.com\/(.+\/status\/|statuses\/)([0-9]{17,21})/g;

// don't complain at me, do not PR for removal
// taken from https://gist.github.com/shobotch/5160017
// exact key: Twitter for Android
const twiKey = Buffer.from(
    "3nVuSoBZnx6U4vzUxf5w:Bcs59EFbbsdF6Sl9Ng71smgStWEGwXXKSjYvPVt7qys"
).toString("base64");

async function getBearer(ctx) {
    return new Promise(async (resolve, reject) => {
        let token = await ctx.libs.superagent
            .post(
                "https://api.twitter.com/oauth2/token?grant_type=client_credentials"
            )
            .set("Authorization", `Basic ${twiKey}`)
            .then(x => x.body.access_token);

        resolve(token);
    });
}

async function getTweetVideo(ctx, snowflake) {
    return new Promise(async (resolve, reject) => {
        let token = await getBearer(ctx);

        let vid = false;

        let tweet = await ctx.libs.superagent
            .get(
                `https://api.twitter.com/1.1/statuses/show.json?id=${snowflake}&include_entities=true`
            )
            .set("Authorization", `Bearer ${token}`)
            .set(
                "User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0"
            )
            .then(x => x.body)
            .catch(e => reject(e));
        if (tweet.extended_entities) {
            if (
                tweet.extended_entities.media[0].type == "video" ||
                tweet.extended_entities.media[0].type == "animated_gif"
            ) {
                let _vid = tweet.extended_entities.media[0];
                vid =
                    _vid.video_info.variants.length > 1
                        ? _vid.video_info.variants
                              .filter(x => x.bitrate)
                              .sort((a, b) => b.bitrate - a.bitrate)[0].url
                        : _vid.video_info.variants[0].url;
            }
        }

        if (vid) {
            resolve({ video: vid, user: tweet.user.screen_name });
        } else {
            reject("no vid");
        }
    });
}

let twdl = async function(ctx, msg, args) {
    msg.channel.sendTyping();
    if (!args) {
        msg.channel.createMessage("Arguments required.");
        return;
    }

    let giveURL = false;

    if (args.startsWith("--url ")) {
        giveURL = true;
        args = args.replace("--url ", "");
    }

    if (msg.channel.guild) {
        let twimg = await ctx.db.models.sdata
            .findOrCreate({
                where: { id: msg.channel.guild.id }
            })
            .then(x => x[0].dataValues.twimg);
        if (twimg && msg.content.match(twitterurl)) return;
    }

    let id;

    let url = msg.content.match(twitterurl);
    if (url) {
        url = url.map(x => (x.startsWith(" ") ? x.substring(1) : x))[0];

        id = url.match(/[0-9]{17,21}$/)[0];
    } else {
        id = args.match(/[0-9]{17,21}$/)[0];
    }
    if (!id) return;
    let data = await getTweetVideo(ctx, id).catch(e => {
        if (e == "no vid") {
            msg.channel.createMessage("Tweet has no video.");
        } else {
            msg.channel.createMessage(
                `:warning: An error occured:\n\`\`\`\n${e}\n\`\`\``
            );
        }
    });
    if (data) {
        if (giveURL) {
            msg.channel.createMessage(data.video);
        } else {
            let vid = await ctx.libs.superagent.get(data.video);
            if (vid) {
                if (vid.body.byteLength > UPLOAD_LIMIT) {
                    msg.channel.createMessage(data.video);
                    return;
                }
                msg.channel
                    .createMessage("", {
                        file: vid.body,
                        name: `${data.user}-${id}.mp4`
                    })
                    .catch(e => {
                        if (e.message.includes("Request entity too large")) {
                            msg.channel.createMessage(data.video);
                        }
                    });
            } else {
                msg.channel.createMessage("An error occured uploading.");
            }
        }
    }
};

const reddit1 = /(?:\s|^)https?:\/\/((old|m|www)\.)?reddit\.com\/(r\/.+\/)?comments\/([a-z0-9]{1,6})(\/.+\/?)?/;
const reddit2 = /(?:\s|^)https?:\/\/redd\.it\/([a-z0-9]{1,6})/;
const vreddit = /(?:\s|^)https?:\/\/v\.redd\.it\/([a-z0-9]{1,13})/;

const getRedditVideo = async function(ctx, link) {
    return new Promise(async (resolve, reject) => {
        let url;
        if (reddit1.test(link)) {
            let match = link.match(reddit1);
            url = `https://reddit.com/comments/${match[4]}.json`;
        } else if (reddit2.test(link)) {
            let match = link.match(reddit2);
            url = `https://reddit.com/comments/${match[1]}.json`;
        } else if (vreddit.test(link)) {
            let redirs = await ctx.libs.superagent
                .get(link)
                .then(x => x.redirects);
            if (redirs.length > 0 && redirs[1]) {
                let match = redirs[1].match(reddit1);
                url = `https://reddit.com/comments/${match[4]}.json`;
            }
        } else {
            reject(
                "Link did not pass any checks. Make sure it's either a full reddit link to the comments, redd.it or v.redd.it."
            );
            return;
        }

        if (url) {
            resolve(url);
        } else {
            reject("no vid");
        }
    });
};

let redditdl = async function(ctx, msg, args) {
    msg.channel.sendTyping();
    if (!args) {
        msg.channel.createMessage("Arguments required.");
        return;
    }

    let giveURL = false;

    if (args.startsWith("--url ")) {
        giveURL = true;
        args = args.replace("--url ", "");
    }

    let url = await getRedditVideo(ctx, args).catch(e => {
        if (e == "no vid") {
            msg.channel.createMessage("Post has no video.");
        } else {
            msg.channel.createMessage(
                `:warning: An error occured:\n\`\`\`\n${e}\n\`\`\``
            );
        }
    });
    if (!url) return;
    let data = await ctx.libs.superagent
        .get(url)
        .then(
            x =>
                x.body &&
                x.body[0] &&
                x.body[0].data &&
                x.body[0].data.children &&
                x.body[0].data.children[0] &&
                x.body[0].data.children[0].data
        );
    if (data.is_video) {
        if (data.over_18) {
            if (
                !msg.channel.nsfw ||
                (msg.channel.nsfw &&
                    msg.channel.topic &&
                    msg.channel.topic.includes("[no_nsfw]"))
            ) {
                msg.channel.createMessage(
                    "Post marked as NSFW whilst trying to use command in non-NSFW or NSFW blacklisted channel."
                );
                return;
            }
        }
        let code = await ctx.libs.superagent
            .post("https://lew.la/reddit/download")
            .type("form")
            .send({
                url: `https://www.reddit.com/${data.subreddit_name_prefixed}/comments/${data.id}/`
            })
            .then(x => x.text);

        if (code == "<<ERROR>>") {
            msg.channel.createMessage("An error occurred getting the video.");
            return;
        } else {
            let vidurl = `https://lew.la/reddit/clips/${code}.mp4`;
            if (giveURL) {
                msg.channel.createMessage(vidurl);
            } else {
                let vid = await ctx.libs.superagent.get(vidurl);
                if (vid.body.byteLength > UPLOAD_LIMIT) {
                    msg.channel.createMessage(vidurl);
                    return;
                }
                msg.channel
                    .createMessage("", {
                        file: vid.body,
                        name: `${data.title}-${data.id}.mp4`
                    })
                    .catch(e => {
                        if (e.message.includes("Request entity too large")) {
                            msg.channel.createMessage(vidurl);
                        }
                    });
            }
        }
    } else {
        msg.channel.createMessage("Reddit post is not a video.");
        return;
    }
};

// rextester
// mappings for hljs -> rextester
let languages = {
    csharp: 1,
    vbnet: 2,
    fsharp: 3,
    java: 4,
    //python: 5 // 2.7, --2.7
    c: 6, // gcc
    cpp: 7, // gcc
    php: 8,
    pascal: 9,
    objc: 10,
    haskell: 11,
    ruby: 12,
    perl: 13,
    lua: 14,
    //js: 17, // using node only
    lisp: 18,
    prolog: 19,
    go: 20,
    scala: 21,
    js: 23, // node
    py: 24, // py 3
    //c: 26, // clang, --clang
    //cpp: 27, // clang, --clang
    //c: 28, // vc, --vc
    //cpp: 29, // vc, --vc
    d: 30,
    r: 31,
    swift: 37,
    bash: 38,
    erlang: 40,
    elixir: 41,
    kotlin: 43,
    brainfuck: 44
};

let shortcuts = {
    cs: "csharp",
    rb: "ruby",
    javascript: "js",
    python: "py",
    kt: "kotlin",
    bf: "brainfuck",
    python: "py"
};

let rextester = async function(ctx, msg, args) {
    msg.channel.sendTyping();
    if (!args) {
        msg.channel.createMessage("Arguments required.");
        return;
    }

    let use27 = false;
    let useClang = false;
    let useVC = false;

    let cArgs = "";
    let stdin = "";

    if (args.startsWith("--2.7 ")) {
        use27 = true;
        args = args.replace("--2.7 ", "");
    }

    if (args.startsWith("--clang ")) {
        useClang = true;
        args = args.replace("--clang ", "");
    }

    if (args.startsWith("--vc ")) {
        useVC = true;
        args = args.replace("--vc ", "");
    }

    if (args.startsWith("--args=")) {
        let reg = /--args=(.+?) /;
        let a = args.match(reg);
        cArgs = a[1];
        args = args.replace(reg, "");
    }

    if (args.startsWith("--stdin=")) {
        let reg = /--stdin=(.+?) /;
        let a = args.match(reg);
        stdin = a[1];
        args = args.replace(reg, "");
    }

    let codeblock = /^```(.+?)\n(.+?)```$/s;

    if (!codeblock.test(args)) {
        msg.channel.createMessage("Codeblock not found.");
        return;
    }

    let matches = args.match(codeblock);

    let lang = matches[1];
    let code = matches[2];

    if (shortcuts[lang]) lang = shortcuts[lang];

    if (!languages[lang]) {
        msg.channel.createMessage("Language not supported.");
        return;
    }

    let langcode = languages[lang];

    if (lang == "c") {
        if (useClang) {
            langcode = 26;
        } else if (useVC) {
            langcode = 28;
        }
    } else if (lang == "cpp") {
        if (useClang) {
            langcode = 27;
        } else if (useVC) {
            langcode = 29;
        }
    } else if (lang == "py") {
        if (use27) langcode = 5;
    }

    let data = await ctx.libs.superagent
        .post("https://rextester.com/rundotnet/api")
        .query({ LanguageChoice: langcode })
        .query({ Program: code })
        .query({ Input: stdin })
        .query({ CompilerArgs: cArgs })
        .catch(err => {
            msg.channel.createMessage(
                `:warning: An error occurred:\n\`\`\`\n${err.message}\`\`\``
            );
        });
    if (!data) return;

    let out = ctx.utils.safeString(data.body.Result);
    msg.channel.createMessage(`\`\`\`${lang}\n${out}\`\`\``);
    msg.channel.createMessage(
        `DEBUG:\n\`\`\`json\n${JSON.stringify(data.body)}\`\`\``
    );
};

module.exports = [
    {
        name: "calc",
        desc: "Do maths",
        fulldesc: `
Syntax on how to use the calculator is [here](https://github.com/silentmatt/expr-eval#expression-syntax).
        `,
        func: calc,
        group: "misc"
    },
    {
        name: "yt",
        desc: "Search YouTube.",
        fulldesc: `
Gives at most 5 results for a given search query.
        `,
        func: yt,
        group: "misc"
    },
    {
        name: "fyt",
        desc: "Search YouTube and grab first result only.",
        func: fyt,
        group: "misc"
    },
    {
        name: "google",
        desc: "Search Google.",
        fulldesc: `
Gives at most 5 results for a given search query.

NSFW channels will bring up NSFW results, to prevent this,
add "[no_nsfw]" (without quotemarks) to the channel topic.
        `,
        func: search,
        group: "misc",
        aliases: ["g", "search", "ddg"]
    },
    {
        name: "gimg",
        desc: "Search Google Images.",
        fulldesc: `
NSFW channels will bring up NSFW results, to prevent this,
add "[no_nsfw]" (without quotemarks) to the channel topic.
        `,
        func: gimg,
        group: "misc",
        aliases: ["img"]
    },
    {
        name: "fgimg",
        desc: "Search Google Images and grab first result only.",
        fulldesc: `
NSFW channels will bring up NSFW results, to prevent this,
add "[no_nsfw]" (without quotemarks) to the channel topic.
        `,
        func: fgimg,
        group: "misc",
        aliases: ["fimg"]
    },
    {
        name: "me_irl",
        desc: "selfies of the soul. Pulls a post from r/me_irl",
        func: me_irl,
        group: "misc"
    },
    {
        name: "poll",
        desc: "Start a poll with multiple options.",
        func: poll,
        group: "misc"
    },
    {
        name: "vote",
        desc: "Start a yes/no vote",
        func: vote,
        group: "misc"
    },
    /*{
        name: "recipe",
        desc:
            "Hm, it looks like that file might've been a virus. Instead of cooking up trouble, try cooking up...",
        func: recipe,
        group: "misc"
    },*/
    {
        name: "currency",
        desc: "Convert between world currencies.",
        fulldesc: `
This command uses [AlphaVantage](https://www.alphavantage.co/), which supports
both physical and cryptocurrency.

For a list of available currencies (as CSV files):
 - [Physical Currencies](https://www.alphavantage.co/physical_currency_list/)
 - [Cryptocurrencies](https://www.alphavantage.co/digital_currency_list/)
        `,
        func: currency,
        usage: "[amount] [from] [to]",
        group: "misc",
        aliases: ["money"]
    },
    {
        name: "rave",
        desc: "Create a rave.dj from two YouTube videos.",
        func: rave,
        usage: "[youtube video] [youtube video]",
        group: "misc",
        aliases: ["ravedj", "rdj"]
    },
    {
        name: "wolfram",
        desc: "Wolfram Alpha Query.",
        func: wolfram,
        usage: "[query]",
        group: "misc",
        aliases: ["wa"]
    },
    {
        name: "no",
        desc: "No",
        func: no,
        group: "misc"
    },
    {
        name: "br",
        desc: "br?",
        func: br,
        group: "misc"
    },
    {
        name: "twdl",
        desc: "Twitter video downloader",
        fulldesc: `
**WILL NOT WORK WITH URLS IF TWIMG IS ENABLED** Use snowflake if you want file.

Can be called with --url to get URL.`,
        func: twdl,
        group: "misc",
        aliases: ["twitterdl"]
    },
    {
        name: "redditdl",
        desc: "Reddit video downloader",
        fulldesc: `
**Obey's \`[no_nsfw]\` in NSFW marked channels**

Can be called with --url to get URL.`,
        func: redditdl,
        group: "misc"
    },
    {
        name: "rextester",
        desc: "Run code in a sandbox",
        func: rextester,
        group: "misc",
        aliases: ["rex"]
    }
];
