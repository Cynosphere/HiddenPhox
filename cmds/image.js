const jimp = require("jimp");
const c2c = require("colorcolor");
const imgfuckr = require("../utils/imgfuckr.js");
const imgfkr = new imgfuckr();
const superagent = require("superagent");
const sharp = require("sharp");
const { GifUtil } = require("gifwrap");
const { spawn } = require("child_process");

const urlRegex = /((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+)/;

//helpers
async function imageCallback(ctx, msg, args, callback, ...cbargs) {
    msg.channel.sendTyping();

    if (args && urlRegex.test(args)) {
        let { filename, out } = await callback.apply(this, [
            msg,
            args,
            ...cbargs
        ]);
        if (filename && out)
            msg.channel.createMessage("", {
                name: filename,
                file: out
            });
    } else if (msg.attachments.length > 0) {
        let { filename, out } = await callback.apply(this, [
            msg,
            msg.attachments[0].url,
            ...cbargs
        ]);
        if (filename && out)
            msg.channel.createMessage("", {
                name: filename,
                file: out
            });
    } else if (/[0-9]{17,21}/.test(args)) {
        let u = await ctx.utils.lookupUser(ctx, msg, args);
        let url =
            u.avatar !== null
                ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
                      u.avatar.startsWith("a_") ? "gif" : "png"
                  }?size=1024`
                : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                      5}.png`;
        let { filename, out } = await callback.apply(this, [
            msg,
            url,
            ...cbargs
        ]);
        if (filename && out)
            msg.channel.createMessage("", {
                name: filename,
                file: out
            });
    } else {
        try {
            let img = await ctx.utils.findLastImage(ctx, msg);
            let { filename, out } = await callback.apply(this, [
                msg,
                img,
                ...cbargs
            ]);
            if (filename && out)
                msg.channel.createMessage("", {
                    name: filename,
                    file: out
                });
        } catch (e) {
            msg.channel.createMessage(
                "Image not found. Please give URL, attachment or user mention."
            );
        }
    }
}

async function jimpAsync(buf) {
    return new Promise((resolve, reject) => {
        new jimp(buf, (err, img) => {
            if (err) reject(err);
            resolve(img);
        });
    });
}

// src: https://stackoverflow.com/a/30494623
function getHeight(length, ratio) {
    var height = length / Math.sqrt(Math.pow(ratio, 2) + 1);
    return Math.round(height);
}

// image manipulation
const mirrorNames = ["hooh", "haah", "woow", "waaw"];
async function mirror(msg, url, type) {
    let im = await jimp.read(url);
    let a = im.clone();
    let b = im.clone();

    switch (type) {
        case 1:
            a.crop(
                0,
                im.bitmap.height / 2,
                im.bitmap.width,
                im.bitmap.height / 2
            );
            b.crop(
                0,
                im.bitmap.height / 2,
                im.bitmap.width,
                im.bitmap.height / 2
            );
            b.mirror(false, true);

            im.composite(a, 0, im.bitmap.height / 2);
            im.composite(b, 0, 0);
            break;
        case 2:
            a.crop(0, 0, im.bitmap.width / 2, im.bitmap.height);
            b.crop(0, 0, im.bitmap.width / 2, im.bitmap.height);
            b.mirror(true, false);

            im.composite(a, 0, 0);
            im.composite(b, im.bitmap.width / 2, 0);
            break;
        case 3:
            a.crop(0, 0, im.bitmap.width, im.bitmap.height / 2);
            b.crop(0, 0, im.bitmap.width, im.bitmap.height / 2);
            b.mirror(false, true);

            im.composite(a, 0, 0);
            im.composite(b, 0, im.bitmap.height / 2);
            break;
        case 4:
            a.crop(
                im.bitmap.width / 2,
                0,
                im.bitmap.width / 2,
                im.bitmap.height
            );
            b.crop(
                im.bitmap.width / 2,
                0,
                im.bitmap.width / 2,
                im.bitmap.height
            );
            a.mirror(true, false);

            im.composite(a, 0, 0);
            im.composite(b, im.bitmap.width / 2, 0);
            break;
        default:
            break;
    }

    let file = await im.getBufferAsync(jimp.MIME_PNG);
    return { filename: `${mirrorNames[type - 1]}.png`, out: file };
}

async function _invert(msg, url) {
    let im = await jimp.read(url);
    im.invert();
    let file = await im.getBufferAsync(jimp.MIME_PNG);
    return { filename: "invert.png", out: file };
}

async function _flip(msg, url) {
    let im = await jimp.read(url);
    im.mirror(true, false);
    let file = await im.getBufferAsync(jimp.MIME_PNG);
    return { filename: "flip.png", out: file };
}

async function _flop(msg, url) {
    let im = await jimp.read(url);
    im.mirror(false, true);
    let file = await im.getBufferAsync(jimp.MIME_PNG);
    return { filename: "flop.png", out: file };
}

async function imgfuck(msg, url) {
    let failed = false;
    let i = await jimp.read(url).catch(e => {
        msg.channel.createMessage(
            `:warning: An error occurred reading image: \`${e}\``
        );
        failed = true;
    });
    if (failed) return;
    let img = await i.getBufferAsync(jimp.MIME_JPEG);

    msg.channel.createMessage("", {
        name: "glitch.jpg",
        file: Buffer.from(imgfkr.processBuffer(img), "base64")
    });
}

async function giffuck(msg, url) {
    let limited = false;
    let failed = false;

    async function glitchFrames(m, inp) {
        m.edit(
            "<a:typing:493087964742549515> Please wait, glitching in progress. `(Step: Extracting frames)`"
        );
        var outframes = [];

        if (inp.frames.length > 100) limited = true;

        for (let f = 0; f < Math.min(100, inp.frames.length); f++) {
            let frame = inp.frames[f];
            let img = frame.bitmap;

            let i = await jimpAsync(img).catch(e => {
                m.edit(`:warning: An error occurred reading image: \`${e}\``);
                failed = true;
            });
            if (failed) return;
            let out = await i.getBufferAsync(jimp.MIME_JPEG);
            let glitch = Buffer.from(imgfkr.processBuffer(out), "base64");

            outframes.push({ data: glitch, delay: frame.delayCentisecs });
        }

        return outframes;
    }

    async function makeTheGif(m, frames) {
        m.edit(
            "<a:typing:493087964742549515> Please wait, glitching in progress. `(Step: Creating gif)`"
        );
        return new Promise((resolve, reject) => {
            let opt = {
                stdio: [0, "pipe", "ignore"]
            };
            //now where could my pipe be?
            for (let f = 0; f < frames.length; f++) opt.stdio.push("pipe");

            let args = ["-loop", "0"];
            for (let f in frames) {
                args.push("-delay");
                args.push(Math.max(frames[f].delay, 15));
                args.push(`fd:${parseInt(f) + 3}`);
            }
            args.push("gif:-");

            let im = spawn("convert", args, opt);
            for (let f = 0; f < frames.length; f++)
                im.stdio[f + 3].write(frames[f].data);
            for (let f = 0; f < frames.length; f++) im.stdio[f + 3].end();

            let out = [];

            im.stdout.on("data", c => {
                out.push(c);
            });

            im.stdout.on("end", _ => {
                resolve(Buffer.concat(out));
            });
        });
    }

    superagent.get(url).then(img => {
        GifUtil.read(img.body).then(async inp => {
            let m = await msg.channel.createMessage(
                "<a:typing:493087964742549515> Please wait, glitching in progress."
            );

            var outframes = await glitchFrames(m, inp).catch(e => {
                m.edit(
                    `:warning: An error occurred extracting frames: \`${e}\``
                );
                failed = true;
            });
            if (failed) return;
            var gif = await makeTheGif(m, outframes).catch(e => {
                m.edit(`:warning: An error occurred creating gif: \`${e}\``);
                failed = true;
            });
            if (failed) return;
            m.edit(
                "<a:typing:493087964742549515> Please wait, glitching in progress. `(Step: Uploading)`"
            );
            msg.channel
                .createMessage(
                    limited
                        ? ":warning: **Frames were limited to only 100 glitched to reduce execution time.**"
                        : "",
                    { name: "glitch.gif", file: gif }
                )
                .then(_ => m.delete());
        });
    });

    return { filename: null, out: null };
}

async function i2gg(msg, url, avatar = false) {
    let failed = false;

    async function glitchImageXTimes(m, inp) {
        return new Promise(async (resolve, reject) => {
            m.edit(
                "<a:typing:493087964742549515> Please wait, glitching in progress. `(Step: Making glitch frames)`"
            );
            var outframes = [];

            var img = await jimp.read(inp).catch(e => {
                m.edit(`:warning: An error occurred reading image: \`${e}\``);
                failed = true;
            });
            if (failed) return;
            var orig = await img.getBufferAsync(jimp.MIME_PNG);
            if (avatar) outframes.push(orig);

            for (let i = 0; i < 10; i++) {
                var jpg = await img.getBufferAsync(jimp.MIME_JPEG);
                outframes.push(
                    Buffer.from(imgfkr.processBuffer(jpg), "base64")
                );
            }

            resolve(outframes);
        });
    }

    async function makeTheGif(m, frames) {
        m.edit(
            "<a:typing:493087964742549515> Please wait, glitching in progress. `(Step: Creating gif)`"
        );
        return new Promise((resolve, reject) => {
            let opt = {
                stdio: [0, "pipe", "ignore"]
            };
            //now where could my pipe be?
            for (let f = 0; f < frames.length; f++) opt.stdio.push("pipe");

            let args = ["-loop", "0", "-delay", "15"];
            for (let f in frames) {
                args.push(`fd:${parseInt(f) + 3}`);
            }
            args.push("gif:-");

            let im = spawn("convert", args, opt);
            for (let f = 0; f < frames.length; f++)
                im.stdio[f + 3].write(frames[f]);
            for (let f = 0; f < frames.length; f++) im.stdio[f + 3].end();

            let out = [];

            im.stdout.on("data", c => {
                out.push(c);
            });

            im.stdout.on("end", _ => {
                resolve(Buffer.concat(out));
            });
        });
    }

    let m = await msg.channel.createMessage(
        "<a:typing:493087964742549515> Please wait, glitching in progress."
    );

    var frames = await glitchImageXTimes(m, url).catch(e => {
        m.edit(`:warning: An error occurred making frames: \`${e}\``);
        failed = true;
    });
    if (failed) return;
    var out = await makeTheGif(m, frames).catch(e => {
        m.edit(`:warning: An error occurred creating gif: \`${e}\``);
        failed = true;
    });
    if (failed) return;

    m.edit(
        "<a:typing:493087964742549515> Please wait, glitching in progress. `(Step: Uploading)`"
    );
    msg.channel
        .createMessage("", { name: "img2glitch.gif", file: out })
        .then(_ => m.delete());

    return { filename: null, out: null };
}

async function _jpeg(msg, url) {
    let img = await superagent
        .get(url)
        .buffer()
        .then(x => x.body);
    let out = await sharp(img)
        .jpeg({ quality: 1 })
        .toBuffer();

    msg.channel.createMessage("", { file: out, name: "jpeg.jpg" });
}

const hooh = (ctx, msg, args) => imageCallback(ctx, msg, args, mirror, 1);
const haah = (ctx, msg, args) => imageCallback(ctx, msg, args, mirror, 2);
const woow = (ctx, msg, args) => imageCallback(ctx, msg, args, mirror, 3);
const waaw = (ctx, msg, args) => imageCallback(ctx, msg, args, mirror, 4);
const invert = (ctx, msg, args) => imageCallback(ctx, msg, args, _invert);
const flip = (ctx, msg, args) => imageCallback(ctx, msg, args, _flip);
const flop = (ctx, msg, args) => imageCallback(ctx, msg, args, _flop);
const jpeg = (ctx, msg, args) => imageCallback(ctx, msg, args, _jpeg);
const glitch = (ctx, msg, args) => imageCallback(ctx, msg, args, imgfuck);
const gglitch = (ctx, msg, args) => imageCallback(ctx, msg, args, giffuck);
function img2glitch(ctx, msg, args) {
    let avatar = false;

    if (args.startsWith("--avatar")) {
        avatar = true;
        args = args.replace("--avatar ", "");
    }

    imageCallback(ctx, msg, args, i2gg, avatar);
}

// templates
async function _rover(msg, url) {
    const template = await jimp.read(`${__dirname}/../img/rover.png`);
    const img = await jimp.read(url);
    const out = new jimp(template.bitmap.width, template.bitmap.height, 0);
    img.resize(192, 102);
    img.rotate(-2.4, false);
    out.composite(img, 60, 125);
    out.composite(template, 0, 0);

    const toSend = await out.getBufferAsync(jimp.MIME_PNG);
    return { filename: "rover.png", out: toSend };
}

async function _carson(msg, url) {
    const template = await jimp.read(`${__dirname}/../img/carson_reacts.png`);
    const img = await jimp.read(url);
    const out = new jimp(template.bitmap.width, template.bitmap.height, 0);
    img.resize(301, 157);
    out.composite(img, 315, 20);
    out.composite(template, 0, 0);

    const toSend = await out.getBufferAsync(jimp.MIME_PNG);
    return { filename: "carson.png", out: toSend };
}

async function _watermark(msg, url) {
    const template = await jimp.read(`${__dirname}/../img/watermark.png`);
    const via9gag = await jimp.read(`${__dirname}/../img/via9gag.png`);
    const img = await jimp.read(url);

    const ratio = img.bitmap.width / img.bitmap.height;
    const newH = getHeight(640, ratio);

    //9gag watermark percentages
    const nineX = 0.074;
    const nineY = 0.076;

    const out = new jimp(
        template.bitmap.width,
        newH + template.bitmap.height,
        0
    );
    img.resize(640, newH);
    out.composite(img, 0, 0);
    out.composite(
        via9gag,
        640 - Math.floor(640 * nineX),
        via9gag.bitmap.height + Math.floor(newH * nineY)
    );
    out.composite(template, 0, newH);

    const toSend = await out.getBufferAsync(jimp.MIME_PNG);
    return { filename: "watermarked.png", out: toSend };
}

async function _toolbars(msg, url) {
    const template = await jimp.read(`${__dirname}/../img/toolbars.png`);
    const img = await jimp.read(url);

    const ratio = img.bitmap.width / img.bitmap.height;
    const newH = getHeight(1008, ratio);

    const out = new jimp(template.bitmap.width, template.bitmap.height, 0);
    img.resize(1008, newH);
    out.composite(img, 0, 592);
    out.composite(template, 0, 0);

    const toSend = await out.getBufferAsync(jimp.MIME_PNG);
    return { filename: "toolbars.png", out: toSend };
}

const rover = (ctx, msg, args) => imageCallback(ctx, msg, args, _rover);
const carson = (ctx, msg, args) => imageCallback(ctx, msg, args, _carson);
const watermark = (ctx, msg, args) => imageCallback(ctx, msg, args, _watermark);
const toolbars = (ctx, msg, args) => imageCallback(ctx, msg, args, _toolbars);

// one off commands
function orly(ctx, msg, args) {
    msg.channel.sendTyping();

    if (!args) {
        msg.channel.createMessage(
            "Usage: `" +
                ctx.prefix +
                'orly "title" "bottom text" "top text" (optional) "author" (optional)`'
        );
        return;
    }

    let [title, text, top, author] = ctx.utils.formatArgs(args);
    let img = Math.floor(Math.random() * 40) + 1;
    let theme = Math.floor(Math.random() * 16) + 1;

    title = title
        .split("")
        .splice(0, 41)
        .join("");
    top = top
        ? top
              .split("")
              .splice(0, 61)
              .join("")
        : "";
    text = text
        .split("")
        .splice(0, 26)
        .join("");

    author = author
        ? author
              .split("")
              .splice(0, 26)
              .join("")
        : msg.author.username
              .split("")
              .splice(0, 26)
              .join("");

    if (!title || !text) {
        msg.channel.createMessage(
            "Usage: `" +
                ctx.prefix +
                'orly "title" "bottom text" "top text" (optional) "author" (optional)`'
        );
    } else {
        jimp.read(
            `https://orly-appstore.herokuapp.com/generate?title=${encodeURIComponent(
                title
            )}&top_text=${encodeURIComponent(top)}&author=${encodeURIComponent(
                author
            )}&image_code=${img}&theme=${theme}&guide_text=${encodeURIComponent(
                text
            )}&guide_text_placement=bottom_right`
        ).then(im => {
            im.getBuffer(jimp.MIME_PNG, (e, f) => {
                msg.channel.createMessage("", {
                    name: "orly.png",
                    file: f
                });
            });
        });
    }
}

function colsquare(ctx, msg, args) {
    let im = new jimp(256, 256, 0);

    let colors = [];

    for (let i = 0; i < 64; i++) {
        let col = Math.floor(Math.random() * 0xffffff).toString("16");
        colors.push(col);
        let colimg = new jimp(32, 32, parseInt(`0x${col}FF`));
        im.composite(colimg, 32 * (i % 8), 32 * Math.floor(i / 8));
    }

    im.getBuffer(jimp.MIME_PNG, (e, f) => {
        let out = "";
        for (let i in colors) {
            out += `#${colors[i]}${
                (i !== 0 && i % 8 === 0) || i == colors.length - 1 ? "\n" : ", "
            }`;
        }

        msg.channel.createMessage(`\`\`\`${out}\`\`\``, {
            name: "colors.png",
            file: f
        });
    });
}

async function color(ctx, msg, args) {
    async function createColMsg(ctx, msg, col, random = false) {
        let im = new jimp(128, 128, parseInt(`0x${col}FF`));
        let img = await im.getBufferAsync(jimp.MIME_PNG);
        msg.channel.createMessage(
            {
                embed: {
                    title: random ? "Random Color" : "",
                    color: parseInt("0x" + col),
                    fields: [
                        {
                            name: "Hex",
                            value: c2c(`#${col}`, "hex"),
                            inline: true
                        },
                        {
                            name: "RGB",
                            value: c2c(`#${col}`, "rgb"),
                            inline: true
                        },
                        {
                            name: "HSL",
                            value: c2c(`#${col}`, "hsl"),
                            inline: true
                        },
                        {
                            name: "HSV",
                            value: c2c(`#${col}`, "hsv"),
                            inline: true
                        },
                        {
                            name: "Integer",
                            value: parseInt(`0x${col}`),
                            inline: true
                        }
                    ],
                    thumbnail: {
                        url: `attachment://${col}.png`
                    }
                }
            },
            { name: `${col}.png`, file: img }
        );
    }

    if (args) {
        if (/#?[0-9a-fA-F]{3,6}/.test(args)) {
            let hex = args.match(/#[0-9a-fA-F]{3,6}/)[0].replace("#", "");
            let col = c2c(`#${hex}`, "hex").replace("#", "");

            createColMsg(ctx, msg, col);
        } else if (/^\d{1,8}$/.test(args)) {
            let int = parseInt(args.match(/\d{1,8}/)[0]);
            if (int > 0xffffff) int = 0xffffff;

            let hex = int.toString("16");
            hex = "0".repeat(6 - hex.length) + hex;
            let col = c2c(`#${hex}`, "hex").replace("#", "");

            createColMsg(ctx, msg, col);
        } else if (
            /(rgb|hsv|hsl)\((\d{1,3}),(\d{1,3}%?),(\d{1,3}%?)\)/.test(args)
        ) {
            let exp = args.match(
                /(rgb|hsv|hsl)\((\d{1,3}),(\d{1,3}%?),(\d{1,3}%?)\)/
            );
            let col = c2c(exp[0], "hex").replace("#", "");

            createColMsg(ctx, msg, col);
        } else if (/(\d{1,3}),(\d{1,3}),(\d{1,3})/.test(args)) {
            let rgb = args.match(/(\d{1,3}),(\d{1,3}),(\d{1,3})/);
            let col = c2c(`rgb(${rgb[0]})`, "hex").replace("#", "");

            createColMsg(ctx, msg, col);
        } else {
            let col = Math.floor(Math.random() * 0xffffff).toString("16");
            if (col.length < 6) {
                let len = 6 - col.length;
                for (let i = 0; i < len; i++) {
                    col += Math.floor(Math.random() * 16).toString("16");
                }
            }

            createColMsg(ctx, msg, col, true);
        }
    } else {
        let col = Math.floor(Math.random() * 0xffffff).toString("16");
        if (col.length < 6) {
            let len = 6 - col.length;
            for (let i = 0; i < len; i++) {
                col += Math.floor(Math.random() * 16).toString("16");
            }
        }

        createColMsg(ctx, msg, col, true);
    }
}

function rolegrid(ctx, msg, args) {
    let roles = msg.channel.guild.roles.filter(x => x.color != 0);
    roles.sort((a, b) => b.position - a.position);
    let offset = Math.floor(Math.sqrt(roles.length));

    let im = new jimp(
        offset * 32,
        32 *
            Math.floor(
                roles.length / offset +
                    (Math.sqrt(roles.length) > offset ? 1 : 0)
            ),
        0
    );

    for (let i = 0; i < roles.length; i++) {
        let col = roles[i].color.toString("16");
        let colimg = new jimp(32, 32, parseInt(`0x${col}FF`));
        im.composite(colimg, 32 * (i % offset), 32 * Math.floor(i / offset));
    }

    im.getBuffer(jimp.MIME_PNG, (e, f) => {
        msg.channel.createMessage(
            `Displaying ${roles.length}/${msg.channel.guild.roles.size} roles.`,
            {
                name: "rolegrid.png",
                file: f
            }
        );
    });
}

//command registry
module.exports = [
    //manipulation
    {
        name: "hooh",
        desc: "Mirror bottom to top",
        func: hooh,
        group: "image"
    },
    {
        name: "haah",
        desc: "Mirror right half of an image to the left",
        func: haah,
        group: "image"
    },
    {
        name: "woow",
        desc: "Mirror top to bottom",
        func: woow,
        group: "image"
    },
    {
        name: "waaw",
        desc: "Mirror left half of an image to the right",
        func: waaw,
        group: "image"
    },

    {
        name: "flip",
        desc: "Flip an image horizontally",
        func: flip,
        group: "image"
    },
    {
        name: "flop",
        desc: "Flip an image vertically",
        func: flop,
        group: "image"
    },
    {
        name: "invert",
        desc: "Invert an image's colors",
        func: invert,
        group: "image"
    },
    {
        name: "glitch",
        desc: "Glitch out an image",
        fulldesc: `
Credit to [zoe](https://twitter.com/yourcompanionAI) for the idea and code.
Based off of [imgfkr](https://github.com/mikedotalmond/imgfkr-twitterbot)
([twitter](https://twitter.com/imgfkr) | [fediverse](https://botsin.space/@img))
        `,
        func: glitch,
        group: "image",
        usage: "[url or attachment]",
        aliases: ["imgfkr", "imgfuck"]
    },
    {
        name: "gglitch",
        desc: "Glitch out a GIF",
        func: gglitch,
        group: "image",
        usage: "[url or attachment]",
        aliases: ["giffkr", "giffuck"]
    },
    {
        name: "img2gglitch",
        desc:
            "Glitch an image multiple times and make it a GIF. Add `--avatar` before URL to add original as first frame.",
        func: img2glitch,
        group: "image",
        usage: "[url or attachment]",
        aliases: ["i2gg"]
    },
    {
        name: "jpeg",
        desc: "Typical JPEG command.",
        func: jpeg,
        group: "image",
        usage: "[url or attachment]",
        aliases: ["nmj", "needsmorejpeg"]
    },

    //templates
    {
        name: "rover",
        desc: "HE",
        func: rover,
        group: "image"
    },
    {
        name: "carson",
        desc: "CallMeCarson Reacts",
        func: carson,
        group: "image"
    },
    {
        name: "watermark",
        desc: "Add a bunch of watermarks to an image",
        func: watermark,
        group: "image"
    },
    {
        name: "toolbars",
        desc: "Add a bunch of toolbars to an image",
        func: toolbars,
        group: "image"
    },

    //one off
    {
        name: "orly",
        desc: "Creates an O'Riley parody book cover.",
        func: orly,
        group: "image",
        usage: '"title" "bottom text" "top text" (optional) "author" (optional)'
    },

    {
        name: "colsquare",
        desc: "Creates a square of 64 random colors.",
        func: colsquare,
        group: "image"
    },
    {
        name: "color",
        desc: "Display a color",
        func: color,
        group: "image",
        usage: "[rgb or hex]",
        aliases: ["col"]
    },
    {
        name: "rolegrid",
        desc:
            "Creates a grid of all the role colors. Highest position to lowest.",
        func: rolegrid,
        group: "image"
    }
];
