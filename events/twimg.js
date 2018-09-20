const Entities = require("html-entities").AllHtmlEntities;
const entities = new Entities();

const twitterurl = /(?:\s|^)https?:\/\/(www\.)?twitter\.com\/.+\/status\/([0-9]{17,21})/g;

// don't complain at me, do not PR for removal
// taken from https://gist.github.com/shobotch/5160017
// exact key: Twitter for Google TV
const twiKey = Buffer.from(
    "iAtYJ4HpUVfIUoNnif1DA:172fOpzuZoYzNYaU3mMYvE8m8MEyLbztOdbrUolU"
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

async function getTweetImages(ctx, snowflake, msg) {
    return new Promise(async (resolve, reject) => {
        let token = await getBearer(ctx);

        let imgs = [];

        let tweet = await ctx.libs.superagent
            .get(
                `https://api.twitter.com/1.1/statuses/show.json?id=${snowflake}&trim_user=1&include_entities=1`
            )
            .set("Authorization", `Bearer ${token}`)
            .then(x => x.body);
        if (tweet.extended_entities) {
            if (
                tweet.extended_entities.media[0].type == "video" ||
                tweet.extended_entities.media[0].type == "animated_gif"
            ) {
                let vid = tweet.extended_entities.media[0];
                msg.channel.createMessage({
                    embed: {
                        description: `[Twitter Video/GIF File](${
                            vid.video_info.variants
                                .filter(x => x.bitrate)
                                .sort((a, b) => b.bitrate - a.bitrate)[0].url
                        })`
                    }
                });
            }

            let media = tweet.extended_entities.media.splice(1);

            for (m in media) {
                imgs.push(media[m].media_url_https + ":orig");
            }
        }

        resolve(imgs);
    });
}

let twimg = async function(msg, ctx) {
    if (!msg) return;
    if (!msg.channel.guild) return;
    if (msg.author.bot) return;

    const enabled = await ctx.db.models.sdata
        .findOrCreate({
            where: { id: msg.channel.guild.id }
        })
        .then(x => x[0].dataValues.twimg);

    if (enabled) {
        let url = msg.content.match(twitterurl);
        if (!url) return;
        url = url.map(x => (x.startsWith(" ") ? x.substring(1) : x))[0];

        let id = url.match(/[0-9]{17,21}$/)[0];
        let imgs = await getTweetImages(ctx, id, msg);

        if (imgs.length > 0) {
            msg.channel.createMessage(imgs.join("\n"));
        }
    }
};

//fediimg
const fediurl = /(?:\s|^)https?:\/\/([^:\/\s]+)\/((@([a-zA-Z0-9-_/]*)\/([0-9]{17,21}))|(objects|notice)\/([a-zA-Z0-9-_/]*))/;

async function getMastoImages(ctx, url, msg) {
    return new Promise(async (resolve, reject) => {
        let imgs = [];

        let post = await ctx.libs.superagent
            .get(url)
            .set("Accept", "application/activity+json")
            .then(x => x.body);
        if (post.attachment.length > 0 && !post.sensitive) {
            let vids = [];

            for (v in post.attachment) {
                let vid = post.attachment[v];

                if (vid.mediaType == "video/mp4") {
                    vids.push(vid.url);
                }
            }

            if (vids.length > 0) {
                msg.channel.createMessage({
                    embed: {
                        title: "Video/GIF URLs",
                        description: vids.map(x => `- [bloop](${x})`).join("\n")
                    }
                });
            }

            let media = post.attachment.splice(1);

            for (m in media) {
                imgs.push(media[m].url);
            }
        }

        resolve(imgs);
    });
}

let fediimg = async function(msg, ctx) {
    if (!msg) return;
    if (!msg.channel.guild) return;
    if (msg.author.bot) return;

    const enabled = await ctx.db.models.sdata
        .findOrCreate({
            where: { id: msg.channel.guild.id }
        })
        .then(x => x[0].dataValues.twimg);

    if (enabled) {
        let url = msg.content.match(fediurl);
        if (!url) return;
        url = url[0];
        url = url.startsWith(" ") ? url.substring(1) : url;

        let imgs = await getMastoImages(ctx, url, msg);

        if (imgs.length > 0) {
            msg.channel.createMessage(imgs.join("\n"));
        }
    }
};

//pleroma embeds
const plurl = /(?:\s|^)https?:\/\/([^:\/\s]+)\/(objects|notice)\/([a-zA-Z0-9-_/]*)/;
const pluser = /^https?:\/\/([^:\/\s]+)\/users\/([a-zA-Z0-9-_/]*)$/;

let plembed = async function(msg, ctx) {
    if (!msg) return;
    if (!msg.channel.guild) return;
    if (msg.author.bot) return;

    const enabled = await ctx.db.models.sdata
        .findOrCreate({
            where: { id: msg.channel.guild.id }
        })
        .then(x => x[0].dataValues.twimg);

    if (!enabled) return;

    let url = msg.content.match(plurl);
    if (!url) return;
    url = url[0];
    url = url.startsWith(" ") ? url.substring(1) : url;

    let post = await ctx.libs.superagent
        .get(url)
        .set("Accept", "application/activity+json")
        .then(x => x.body);

    let authorData = await ctx.libs.superagent
        .get(post.attributedTo)
        .set("Accept", "application/activity+json")
        .then(x => x.body);

    if (post.object) {
        post = await ctx.libs.superagent
            .get(post.object.id)
            .set("Accept", "application/activity+json")
            .then(x => x.body);
    }

    let uninst = post.attributedTo.match(pluser);

    msg.channel.createMessage({
        embed: {
            author: {
                name: authorData.preferredUsername,
                url: post.attributedTo
            },
            title: `${authorData.preferredUsername} (@${uninst[2]}@${
                uninst[1]
            })`,
            url: url,
            description: `${
                post.attachment && post.attachment.length > 0
                    ? `Attachments: ${post.attachment.length}\n\n`
                    : ""
            }${
                post.sensitive
                    ? `Content Warning: ${entites.decode(
                          post.summary
                              .replace(/<br>/g, "\n")
                              .replace(/<(?:.|\n)*?>/gm, "")
                      )}`
                    : entites.decode(
                          post.content
                              .replace(/<br>/g, "\n")
                              .replace(/<(?:.|\n)*?>/gm, "")
                      )
            }`,
            thumbnail: {
                url: authorData.icon.url
            },
            image: {
                url: post.sensitive
                    ? ""
                    : post.attachment && post.attachment.length > 0
                      ? post.attachment[0].url
                      : ""
            },
            color: 0x282c37
        }
    });
};

module.exports = [
    {
        event: "messageCreate",
        name: "twimg",
        func: twimg
    },
    {
        event: "messageCreate",
        name: "fediimg",
        func: fediimg
    },
    {
        event: "messageCreate",
        name: "plembed",
        func: plembed
    }
];
