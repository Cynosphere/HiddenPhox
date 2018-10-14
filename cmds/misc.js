const DuckDuckScrape = require("duck-duck-scrape");
const ddg = new DuckDuckScrape();

let calc = function(ctx, msg, args) {
    let a = args.split("|");
    let exp = a[0];
    let _x = a[1];
    _x = _x ? _x : 1;
    let parser = new ctx.libs.math();
    msg.channel.createMessage(
        "Result: " + parser.parse(exp).evaluate({ x: _x })
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
                `- **${data[i].snippet.title}** | By: \`${
                    data[i].snippet.channelTitle
                }\` | <https://youtu.be/${data[i].id.videoId}>`
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
            `**${data[0].snippet.title}** | \`${
                data[0].snippet.channelTitle
            }\`\nhttps://youtu.be/${data[0].id.videoId}`
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
                `**${msg.author.username}#${
                    msg.author.discriminator
                }** has started a vote:\n**__${args}__**\n<:GreenTick:349381062176145408>: Yes\n<:RedTick:349381062054510604>: No`
            )
            .then(m => {
                m.addReaction(":GreenTick:349381062176145408");
                setTimeout(
                    () => m.addReaction(":RedTick:349381062054510604"),
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
                `Missing arguments. Usage: \`${
                    ctx.prefix
                }currency <amount> <from> <to>\``
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
    //not my key, not telling where i got it from tho
    let data = await ctx.libs.superagent
        .get(
            `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(
                args
            )}&appid=LH2K8H-T3QKETAGT3&output=json`
        )
        .then(x => JSON.parse(x.text));
    data = data.queryresult.pods;

    const embed = {
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

    data.splice(1, 6).forEach(x => {
        embed.fields.push({
            name: x.title,
            value: `[${
                x.subpods[0].plaintext.length > 0
                    ? x.subpods[0].plaintext
                    : "<click for image>"
            }](${x.subpods[0].img.src})`,
            inline: true
        });
    });

    msg.channel.createMessage({ embed: embed });
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
        group: "fun"
    },
    {
        name: "poll",
        desc: "Start a poll with multiple options.",
        func: poll,
        group: "fun"
    },
    {
        name: "vote",
        desc: "Start a yes/no vote",
        func: vote,
        group: "fun"
    },
    /*{
        name: "recipe",
        desc:
            "Hm, it looks like that file might've been a virus. Instead of cooking up trouble, try cooking up...",
        func: recipe,
        group: "fun"
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
        group: "fun",
        aliases: ["money"]
    },
    {
        name: "rave",
        desc: "Create a rave.dj from two YouTube videos.",
        func: rave,
        usage: "[youtube video] [youtube video]",
        group: "fun",
        aliases: ["ravedj", "rdj"]
    },
    {
        name: "wolfram",
        desc: "Wolfram Alpha Query.",
        func: wolfram,
        usage: "[query]",
        group: "fun",
        aliases: ["wa"]
    }
];
