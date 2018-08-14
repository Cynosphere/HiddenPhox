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

let search = function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage("Arguments are required!");
    } else {
        ctx.utils.google
            .search(args, msg.channel && msg.channel.nsfw)
            .then(({ card, results }) => {
                if (card) {
                    msg.channel.createMessage(card);
                } else if (results.length) {
                    const links = results.map(r => r.link);
                    msg.channel.createMessage(
                        `${links[0]}\n\n**See Also:**\n${links
                            .slice(1, 5)
                            .map(l => `<${l}>`)
                            .join("\n")}`.trim()
                    );
                } else {
                    msg.channel.createMessage("No results found.");
                }
            });
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
                    msg.channel.nsfw &&
                    !msg.channel.topic.includes("[hf:no-nsfw]")
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
                    msg.channel.nsfw &&
                    !msg.channel.topic.includes("[hf:no-nsfw]")
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
    for (i = 0; i > 60; i++) {
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

module.exports = [
    {
        name: "calc",
        desc: "Do maths",
        func: calc,
        group: "misc"
    },
    {
        name: "yt",
        desc: "Search YouTube.",
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
        func: search,
        group: "misc",
        aliases: ["g", "search"]
    },
    {
        name: "gimg",
        desc: "Search Google Images.",
        func: gimg,
        group: "misc",
        aliases: ["img"]
    },
    {
        name: "fgimg",
        desc: "Search Google Images and grab first result only.",
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
    {
        name: "recipe",
        desc:
            "Hm, it looks like that file might've been a virus. Instead of cooking up trouble, try cooking up...",
        func: recipe,
        group: "fun"
    },
    {
        name: "currency",
        desc: "Convert currency.",
        func: currency,
        group: "fun",
        aliases: ["money"]
    }
];
