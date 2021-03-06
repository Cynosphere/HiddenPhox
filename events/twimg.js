const Entities = require("html-entities").AllHtmlEntities;
const entities = new Entities();
const superagent = require("superagent");

const twitterurl = /(?:\s|^)https?:\/\/(www\.|mobile\.)?twitter\.com\/(.+\/status\/|statuses\/)([0-9]{17,21})/g;

let twimg_embeds = {};

async function getBearer(ctx) {
    return new Promise(async (resolve, reject) => {
        const twiKey = Buffer.from(
            `${ctx.apikeys.twitter.key}:${ctx.apikeys.twitter.secret}`
        ).toString("base64");

        let token = await superagent
            .post(
                "https://api.twitter.com/oauth2/token?grant_type=client_credentials"
            )
            .set("Authorization", `Basic ${twiKey}`)
            .then((x) => x.body.access_token);

        resolve(token);
    });
}

let quoted = 0;
async function getTweetImages(ctx, snowflake, msg) {
    return new Promise(async (resolve, reject) => {
        let token = await getBearer(ctx);

        let imgs = [];

        let tweet = await superagent
            .get(
                `https://api.twitter.com/1.1/statuses/show.json?id=${snowflake}&trim_user=1&include_entities=1`
            )
            .set("Authorization", `Bearer ${token}`)
            .set(
                "User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0"
            )
            .then((x) => x.body)
            .catch((e) => reject(e));

        if (quoted > 0 && !tweet.is_quote_status) {
            quoted = 0;
        }

        if (tweet.is_quote_status && tweet.quoted_status_id) {
            if (quoted >= 5) return;

            msg.channel
                .createMessage(
                    `Quoted Tweet: https://twitter.com/i/status/${tweet.quoted_status_id_str}`
                )
                .then(async (x) => {
                    x.addReaction("\u274c");
                    twimg_embeds[x.id] = msg.id;

                    let imgs = await getTweetImages(
                        ctx,
                        tweet.quoted_status_id_str,
                        msg
                    );
                    if (imgs && imgs.length > 0) {
                        msg.channel.createMessage(imgs.join("\n")).then((m) => {
                            m.addReaction("\u274c");
                            twimg_embeds[m.id] = msg.id;
                        });
                    }
                });
            quoted++;
        }
        if (tweet.extended_entities) {
            if (
                tweet.extended_entities.media[0].type == "video" ||
                tweet.extended_entities.media[0].type == "animated_gif"
            ) {
                let vid = tweet.extended_entities.media[0];
                msg.channel
                    .createMessage({
                        embed: {
                            description: `[Twitter Video/GIF File](${
                                vid.video_info.variants.length > 1
                                    ? vid.video_info.variants
                                          .filter((x) => x.bitrate)
                                          .sort(
                                              (a, b) => b.bitrate - a.bitrate
                                          )[0].url
                                    : vid.video_info.variants[0].url
                            })`,
                        },
                    })
                    .then((m) => {
                        m.addReaction("\u274c");
                        twimg_embeds[m.id] = msg.id;
                    });
            }

            // now unused due to discord adding native support
            /*let media = tweet.extended_entities.media.splice(1);

			for (m in media) {
				imgs.push(media[m].media_url_https + ':orig');
			}*/
        }

        resolve(imgs);
    });
}

let twimg = async function (msg, ctx) {
    if (!msg) return;
    if (!msg.channel.guild) return;

    let data = await ctx.db.models.sdata.findOrCreate({
        where: { id: msg.channel.guild.id },
    });

    if (msg.author.id == ctx.bot.user.id) return;
    if (msg.author.bot && !data[0].dataValues.funallowed) return;

    const enabled = data[0].dataValues.twimg;

    if (enabled) {
        let url = msg.content.match(twitterurl);
        if (!url) return;
        url = url.map((x) => (x.startsWith(" ") ? x.substring(1) : x))[0];

        let id = url.match(/[0-9]{17,21}$/)[0];
        let imgs = await getTweetImages(ctx, id, msg);

        if (imgs.length > 0) {
            msg.channel.createMessage(imgs.join("\n")).then((m) => {
                m.addReaction("\u274c");
                twimg_embeds[m.id] = msg.id;
            });
        }
    }
};

//fediimg
const fediurl = /(?:\s|^)https?:\/\/([^:\/\s]+)\/(((@([a-zA-Z0-9-_/]*)\/([0-9]{17,21}))|(users\/([a-zA-Z0-9-_/]*)\/statuses\/([0-9]{17,21})))|(objects|notice|~\/notice)\/([a-zA-Z0-9-_/]*))/;

async function getMastoImages(ctx, url, msg) {
    return new Promise(async (resolve, reject) => {
        let imgs = [];

        let post = await superagent
            .get(url)
            .set("Accept", "application/activity+json")
            .then((x) => x.body)
            .catch((e) => reject(e));
        if (post.attachment.length > 0 && !post.sensitive) {
            let vids = [];

            for (v in post.attachment) {
                let vid = post.attachment[v];

                if (vid.mediaType == "video/mp4") {
                    vids.push(vid.url);
                }
            }

            if (vids.length > 0) {
                msg.channel
                    .createMessage({
                        content: `**Post Content:** ${
                            post.sensitive
                                ? `Content Warning: ${entities.decode(
                                      post.summary
                                          .replace(/<br>/g, "\n")
                                          .replace(/<(?:.|\n)*?>/gm, "")
                                  )}`
                                : entities.decode(
                                      post.content
                                          .replace(/<br>/g, "\n")
                                          .replace(/<(?:.|\n)*?>/gm, "")
                                  )
                        }`,
                        embed: {
                            title: "Video/GIF URLs",
                            description: vids
                                .map((x) => `- [bloop](${x})`)
                                .join("\n"),
                        },
                    })
                    .then((m) => {
                        m.addReaction("\u274c");
                        twimg_embeds[m.id] = msg.id;
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

let fediimg = async function (msg, ctx) {
    if (!msg) return;
    if (!msg.channel.guild) return;

    let data = await ctx.db.models.sdata.findOrCreate({
        where: { id: msg.channel.guild.id },
    });

    if (msg.author.id == ctx.bot.user.id) return;
    if (msg.author.bot && !data[0].dataValues.funallowed) return;

    const enabled = data[0].dataValues.twimg;

    if (enabled) {
        if (!msg.embeds[0]) return;
        let url = msg.content.match(fediurl);
        if (!url) return;
        url = url[0];
        url = url.startsWith(" ") ? url.substring(1) : url;

        let imgs = await getMastoImages(ctx, url, msg);

        if (imgs.length > 0) {
            msg.channel.createMessage(imgs.join("\n")).then((m) => {
                m.addReaction("\u274c");
                twimg_embeds[m.id] = msg.id;
            });
        }
    }
};

//pleroma embeds
const plurl = /(?:\s|^)https?:\/\/([^:\/\s]+)\/(notes|objects|notice)\/([a-zA-Z0-9-_/]*)/;
const pluser = /^https?:\/\/([^:\/\s]+)\/users\/([a-zA-Z0-9-_/]*)$/;

let plembed = async function (msg, ctx) {
    if (!msg) return;
    if (!msg.channel.guild) return;

    let data = await ctx.db.models.sdata.findOrCreate({
        where: { id: msg.channel.guild.id },
    });

    if (msg.author.id == ctx.bot.user.id) return;
    if (msg.author.bot && !data[0].dataValues.funallowed) return;

    const enabled = data[0].dataValues.twimg;

    if (!enabled) return;

    let url = msg.content.match(plurl);
    if (!url) return;
    url = url[0];
    url = url.startsWith(" ") ? url.substring(1) : url;

    let post = await superagent
        .get(url)
        .set("Accept", "application/activity+json")
        .then((x) => x.body);

    let authorData = await superagent
        .get(post.attributedTo)
        .set("Accept", "application/activity+json")
        .then((x) => x.body);

    if (post.object && (post.object.id || post.object.url)) {
        post = await superagent
            .get(post.object.id ? post.object.id : post.object.url)
            .set("Accept", "application/activity+json")
            .then((x) => x.body);
    }

    let uninst = post.attributedTo.match(pluser);

    if (msg.channel.permissionsOf(ctx.bot.user.id).has("manageMessages")) {
        ctx.bot.requestHandler
            .request(
                "POST",
                `/channels/${msg.channel.id}/messages/${msg.id}/suppress-embeds`,
                true,
                { suppress: true }
            )
            .catch((_) => {}); //just in case
    }

    msg.channel.createMessage({
        embed: {
            author: {
                name: authorData.name,
                url: authorData.url,
            },
            title: `${authorData.name} (@${authorData.preferredUsername}@${uninst[1]})`,
            url: url,
            description: `${
                post.attachment && post.attachment.length > 0
                    ? `Attachments: ${post.attachment.length}\n\n`
                    : ""
            }${
                post.sensitive
                    ? `Content Warning: ${entities.decode(
                          post.summary
                              .replace(/<br>/g, "\n")
                              .replace(/<(?:.|\n)*?>/gm, "")
                      )}`
                    : post._misskey_content
                    ? post._misskey_content //favor misskey content cause it usues markdown
                    : entities.decode(
                          post.content
                              .replace(/<br>/g, "\n")
                              .replace(/<(?:.|\n)*?>/gm, "")
                      )
            }`,
            thumbnail: {
                url: authorData.icon.url,
            },
            image: {
                url: post.sensitive
                    ? ""
                    : post.attachment && post.attachment.length > 0
                    ? post.attachment[0].url
                    : "",
            },
            color: 0x282c37,
        },
    });
    if (post.attachment && post.attachment.length > 1) {
        msg.channel.createMessage(
            post.attachment
                .splice(1)
                .map((x) => x.url)
                .join("\n")
        );
    }
};

async function twimgDelete(msg, emote, user, ctx) {
    if (twimg_embeds[msg.id] !== undefined) {
        const m = await msg.channel.getMessage(twimg_embeds[msg.id]);

        if (
            (m.author.id == user.id ||
                (msg.channel.permissionsOf(user.id).has("manageMessages") &&
                    user.id != ctx.bot.user.id)) &&
            emote.name == "\u274c"
        ) {
            msg.delete();
            delete twimg_embeds[msg.id];
        }
    }
}

module.exports = [
    {
        event: "messageCreate",
        name: "twimg",
        func: twimg,
    },
    {
        event: "messageCreate",
        name: "fediimg",
        func: fediimg,
    },
    {
        event: "messageCreate",
        name: "plembed",
        func: plembed,
    },
    {
        event: "messageReactionAdd",
        name: "twimgDelete",
        func: twimgDelete,
    },
];
