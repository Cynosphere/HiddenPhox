let jimp = require("jimp");
let c2c = require("colorcolor");
let imgfuckr = require("../utils/imgfuckr.js");
let imgfkr = new imgfuckr();
const { BitmapImage, GifFrame, GifUtil, GifCodec } = require("gifwrap");
//let i2b = require("image-to-braille");

let mirror = function(msg, url, type) {
    switch (type) {
        case 1: //hooh
            jimp.read(url).then(im => {
                let a = im.clone();
                let b = im.clone();

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

                let out = new jimp(
                    im.bitmap.width,
                    im.bitmap.height,
                    (e, i) => {
                        i.composite(a, 0, im.bitmap.height / 2);
                        i.composite(b, 0, 0);
                    }
                );

                out.getBuffer(jimp.MIME_PNG, (e, f) => {
                    msg.channel.createMessage("", {
                        name: "hooh.png",
                        file: f
                    });
                });
            });
            break;
        case 2: //haah
            jimp.read(url).then(im => {
                let a = im.clone();
                let b = im.clone();

                a.crop(0, 0, im.bitmap.width / 2, im.bitmap.height);
                b.crop(0, 0, im.bitmap.width / 2, im.bitmap.height);
                b.mirror(true, false);

                let out = new jimp(
                    im.bitmap.width,
                    im.bitmap.height,
                    (e, i) => {
                        i.composite(a, 0, 0);
                        i.composite(b, im.bitmap.width / 2, 0);
                    }
                );

                out.getBuffer(jimp.MIME_PNG, (e, f) => {
                    msg.channel.createMessage("", {
                        name: "haah.png",
                        file: f
                    });
                });
            });
            break;
        case 3: //woow
            jimp.read(url).then(im => {
                let a = im.clone();
                let b = im.clone();

                a.crop(0, 0, im.bitmap.width, im.bitmap.height / 2);
                b.crop(0, 0, im.bitmap.width, im.bitmap.height / 2);
                b.mirror(false, true);

                let out = new jimp(
                    im.bitmap.width,
                    im.bitmap.height,
                    (e, i) => {
                        i.composite(a, 0, 0);
                        i.composite(b, 0, im.bitmap.height / 2);
                    }
                );

                out.getBuffer(jimp.MIME_PNG, (e, f) => {
                    msg.channel.createMessage("", {
                        name: "woow.png",
                        file: f
                    });
                });
            });
            break;
        case 4:
            jimp.read(url).then(im => {
                let a = im.clone();
                let b = im.clone();

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

                let out = new jimp(
                    im.bitmap.width,
                    im.bitmap.height,
                    (e, i) => {
                        i.composite(a, 0, 0);
                        i.composite(b, im.bitmap.width / 2, 0);
                    }
                );

                out.getBuffer(jimp.MIME_PNG, (e, f) => {
                    msg.channel.createMessage("", {
                        name: "waaw.png",
                        file: f
                    });
                });
            });
            break;
    }
};

let hooh = function(ctx, msg, args) {
    msg.channel.sendTyping();

    let jimp = ctx.libs.jimp;
    if (args && args.startsWith("http")) {
        mirror(msg, args, 1);
    } else if (msg.attachments.length > 0) {
        mirror(msg, msg.attachments[0].url, 1);
    } else if (/[0-9]{17,21}/.test(args)) {
        ctx.utils.lookupUser(ctx, msg, args).then(u => {
            let url =
                u.avatar !== null
                    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
                          u.avatar.startsWith("a_") ? "gif" : "png"
                      }?size=1024`
                    : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                          5}.png`;
            mirror(msg, url, 1);
        });
    } else {
        msg.channel.createMessage(
            "Image not found. Please give URL, attachment or user mention."
        );
    }
};

let haah = function(ctx, msg, args) {
    msg.channel.sendTyping();

    let jimp = ctx.libs.jimp;
    if (args && args.startsWith("http")) {
        mirror(msg, args, 2);
    } else if (msg.attachments.length > 0) {
        mirror(msg, msg.attachments[0].url, 2);
    } else if (/[0-9]{17,21}/.test(args)) {
        ctx.utils.lookupUser(ctx, msg, args).then(u => {
            let url =
                u.avatar !== null
                    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
                          u.avatar.startsWith("a_") ? "gif" : "png"
                      }?size=1024`
                    : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                          5}.png`;
            mirror(msg, url, 2);
        });
    } else {
        msg.channel.createMessage(
            "Image not found. Please give URL, attachment or user mention."
        );
    }
};

let woow = function(ctx, msg, args) {
    msg.channel.sendTyping();

    let jimp = ctx.libs.jimp;
    if (args && args.startsWith("http")) {
        mirror(msg, args, 3);
    } else if (msg.attachments.length > 0) {
        mirror(msg, msg.attachments[0].url, 3);
    } else if (/[0-9]{17,21}/.test(args)) {
        ctx.utils.lookupUser(ctx, msg, args).then(u => {
            let url =
                u.avatar !== null
                    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
                          u.avatar.startsWith("a_") ? "gif" : "png"
                      }?size=1024`
                    : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                          5}.png`;
            mirror(msg, url, 3);
        });
    } else {
        msg.channel.createMessage(
            "Image not found. Please give URL, attachment or user mention."
        );
    }
};

let waaw = function(ctx, msg, args) {
    msg.channel.sendTyping();

    let jimp = ctx.libs.jimp;
    if (args && args.startsWith("http")) {
        mirror(msg, args, 4);
    } else if (msg.attachments.length > 0) {
        mirror(msg, msg.attachments[0].url, 4);
    } else if (/[0-9]{17,21}/.test(args)) {
        ctx.utils.lookupUser(ctx, msg, args).then(u => {
            let url =
                u.avatar !== null
                    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
                          u.avatar.startsWith("a_") ? "gif" : "png"
                      }?size=1024`
                    : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                          5}.png`;
            mirror(msg, url, 4);
        });
    } else {
        msg.channel.createMessage(
            "Image not found. Please give URL, attachment or user mention."
        );
    }
};

let _invert = function(msg, url) {
    jimp.read(url).then(im => {
        let inv = im.clone();
        inv.invert();

        inv.getBuffer(jimp.MIME_PNG, (e, f) => {
            msg.channel.createMessage("", { name: "invert.png", file: f });
        });
    });
};

let invert = function(ctx, msg, args) {
    msg.channel.sendTyping();

    let jimp = ctx.libs.jimp;
    if (args && args.startsWith("http")) {
        _invert(msg, args);
    } else if (msg.attachments.length > 0) {
        _invert(msg, msg.attachments[0].url);
    } else if (/[0-9]{17,21}/.test(args)) {
        ctx.utils.lookupUser(ctx, msg, args).then(u => {
            let url =
                u.avatar !== null
                    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
                          u.avatar.startsWith("a_") ? "gif" : "png"
                      }?size=1024`
                    : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                          5}.png`;
            _invert(msg, url);
        });
    } else {
        msg.channel.createMessage(
            "Image not found. Please give URL, attachment or user mention."
        );
    }
};

//flippity floop
let flip = function(ctx, msg, args) {
    msg.channel.sendTyping();

    let jimp = ctx.libs.jimp;
    if (args && args.startsWith("http")) {
        jimp.read(args).then(im => {
            im.mirror(true, false);
            im.getBuffer(jimp.MIME_PNG, (e, f) => {
                msg.channel.createMessage("", { name: "flip.png", file: f });
            });
        });
    } else if (msg.attachments.length > 0) {
        jimp.read(msg.attachments[0].url).then(im => {
            im.mirror(true, false);
            im.getBuffer(jimp.MIME_PNG, (e, f) => {
                msg.channel.createMessage("", { name: "flip.png", file: f });
            });
        });
    } else if (/[0-9]{17,21}/.test(args)) {
        ctx.utils.lookupUser(ctx, msg, args).then(u => {
            let url =
                u.avatar !== null
                    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
                          u.avatar.startsWith("a_") ? "gif" : "png"
                      }?size=1024`
                    : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                          5}.png`;
            jimp.read(url).then(im => {
                im.mirror(true, false);
                im.getBuffer(jimp.MIME_PNG, (e, f) => {
                    msg.channel.createMessage("", {
                        name: "flip.png",
                        file: f
                    });
                });
            });
        });
    } else {
        msg.channel.createMessage(
            "Image not found. Please give URL, attachment or user mention."
        );
    }
};

let flop = function(ctx, msg, args) {
    msg.channel.sendTyping();

    let jimp = ctx.libs.jimp;
    if (args && args.startsWith("http")) {
        jimp.read(args).then(im => {
            im.mirror(false, true);
            im.getBuffer(jimp.MIME_PNG, (e, f) => {
                msg.channel.createMessage("", { name: "flop.png", file: f });
            });
        });
    } else if (msg.attachments.length > 0) {
        jimp.read(msg.attachments[0].url).then(im => {
            im.mirror(false, true);
            im.getBuffer(jimp.MIME_PNG, (e, f) => {
                msg.channel.createMessage("", { name: "flop.png", file: f });
            });
        });
    } else if (/[0-9]{17,21}/.test(args)) {
        ctx.utils.lookupUser(ctx, msg, args).then(u => {
            let url =
                u.avatar !== null
                    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
                          u.avatar.startsWith("a_") ? "gif" : "png"
                      }?size=1024`
                    : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                          5}.png`;
            jimp.read(url).then(im => {
                im.mirror(false, true);
                im.getBuffer(jimp.MIME_PNG, (e, f) => {
                    msg.channel.createMessage("", {
                        name: "flop.png",
                        file: f
                    });
                });
            });
        });
    } else {
        msg.channel.createMessage(
            "Image not found. Please give URL, attachment or user mention."
        );
    }
};

let orly = function(ctx, msg, args) {
    msg.channel.sendTyping();

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

    if (!args || !title || !text) {
        msg.channel.createMessage(
            "Usage: `" +
                ctx.prefix +
                'orly "title" "bottom text" "top text" (optional)"author" (optional)`'
        );
    } else {
        jimp
            .read(
                `https://orly-appstore.herokuapp.com/generate?title=${encodeURIComponent(
                    title
                )}&top_text=${encodeURIComponent(
                    top
                )}&author=${encodeURIComponent(
                    author
                )}&image_code=${img}&theme=${theme}&guide_text=${encodeURIComponent(
                    text
                )}&guide_text_placement=bottom_right`
            )
            .then(im => {
                let out = new jimp(
                    im.bitmap.width,
                    im.bitmap.height,
                    (e, i) => {
                        i.composite(im, 0, 0);
                    }
                );

                out.getBuffer(jimp.MIME_PNG, (e, f) => {
                    msg.channel.createMessage("", {
                        name: "orly.png",
                        file: f
                    });
                });
            });
    }
};

let colsquare = function(ctx, msg, args) {
    let im = new jimp(256, 256, 0);

    let colors = [];

    for (let i = 0; i < 64; i++) {
        let col = Math.floor(Math.random() * 0xffffff).toString("16");
        colors.push(col);
        let colimg = new jimp(32, 32, parseInt(`0x${col}FF`));
        im.composite(colimg, 32 * (i % 8), 32 * Math.floor(i / 8));
    }

    im.getBuffer(jimp.MIME_PNG, (e, f) => {
        msg.channel.createMessage(`\`\`\`${colors.join(", ")}\`\`\``, {
            name: "colors.png",
            file: f
        });
    });
};

let color = function(ctx, msg, args) {
    if (args) {
        if (/#[0-9a-fA-F]{3,6}/.test(args)) {
            let hex = args.match(/#[0-9a-fA-F]{3,6}/)[0].replace("#", "");
            let col = c2c(`#${hex}`, "hex").replace("#", "");

            let im = new jimp(128, 128, parseInt(`0x${col}FF`));
            im.getBuffer(jimp.MIME_PNG, (e, f) => {
                msg.channel.createMessage(
                    {
                        embed: {
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
                    { name: `${col}.png`, file: f }
                );
            });
        } else if (/^\d{1,8}$/.test(args)) {
            let int = parseInt(args.match(/\d{1,8}/)[0]);
            if (int > 0xffffff) int = 0xffffff;

            let hex = int.toString("16");
            hex = "0".repeat(6 - hex.length) + hex;
            let col = c2c(`#${hex}`, "hex").replace("#", "");

            let im = new jimp(128, 128, parseInt(`0x${col}FF`));
            im.getBuffer(jimp.MIME_PNG, (e, f) => {
                msg.channel.createMessage(
                    {
                        embed: {
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
                    { name: `${col}.png`, file: f }
                );
            });
        } else if (/(\d{1,3}),(\d{1,3}),(\d{1,3})/.test(args)) {
            let rgb = args.match(/(\d{1,3}),(\d{1,3}),(\d{1,3})/);
            let col = c2c(`rgb(${rgb[0]})`, "hex").replace("#", "");

            let im = new jimp(128, 128, parseInt(`0x${col}FF`));
            im.getBuffer(jimp.MIME_PNG, (e, f) => {
                msg.channel.createMessage(
                    {
                        embed: {
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
                    { name: `${col}.png`, file: f }
                );
            });
        } else {
            let col = Math.floor(Math.random() * 0xffffff).toString("16");
            if (col.length < 6) {
                col += Math.floor(Math.random() * 16).toString("16");
            }

            let im = new jimp(128, 128, parseInt(`0x${col}FF`));
            im.getBuffer(jimp.MIME_PNG, (e, f) => {
                msg.channel.createMessage(
                    {
                        embed: {
                            title: "Random Color",
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
                    { name: `${col}.png`, file: f }
                );
            });
        }
    } else {
        let col = Math.floor(Math.random() * 0xffffff).toString("16");
        if (col.length < 6) {
            let len = 6 - col.length;
            for (i = 0; i < len; i++) {
                col += Math.floor(Math.random() * 16).toString("16");
            }
        }

        let im = new jimp(128, 128, parseInt(`0x${col}FF`));
        im.getBuffer(jimp.MIME_PNG, (e, f) => {
            msg.channel.createMessage(
                {
                    embed: {
                        title: "Random Color",
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
                            }
                        ],
                        thumbnail: {
                            url: `attachment://${col}.png`
                        }
                    }
                },
                { name: `${col}.png`, file: f }
            );
        });
    }
};

/*let _i2b = function(msg, url) {
    jimp.read(url).then(im => {
        im.getBuffer(jimp.MIME_PNG, (e, f) => {
            i2b
                .convert(f, {
                    width:
                        im.bitmap.width > 256
                            ? im.bitmap.width / 2
                            : im.bitmap.width,
                    height:
                        im.bitmap.height > 256
                            ? im.bitmap.height / 2
                            : im.bitmap.height,
                    threshold: 64
                })
                .then(x => {
                    ctx.libs.request.post(
                        "https://hastebin.com/documents",
                        {
                            body: x
                        },
                        function(err, res, body) {
                            if (res.statusCode == 200) {
                                let key = JSON.parse(body).key;
                                msg.channel.createMessage(
                                    `Output: https://hastebin.com/${key}`
                                );
                            } else {
                                msg.channel.createMessage(
                                    ":warning: Cannot upload output to Hastebin."
                                );
                            }
                        }
                    );
                });
        });
    });
};

let img2braille = async function(ctx, msg, args) {
    if (args && args.startsWith("http")) {
        _i2b(msg, args);
    } else if (msg.attachments.length > 0) {
        _i2b(msg, msg.attachments[0].url);
    } else {
        msg.channel.createMessage(
            "Image not found. Please give URL, attachment or user mention."
        );
    }
};*/

let imgfuck = function(msg, url) {
    msg.channel.sendTyping();
    jimp.read(url).then(i => {
        i.getBuffer(jimp.MIME_JPEG, (e, f) => {
            if (e) {
                msg.channel.createMessage(
                    "Image not found. Please give URL, attachment or user mention."
                );
                return;
            }
            let out = imgfkr.processBuffer(f);

            msg.channel.createMessage("", {
                name: "glitch.jpg",
                file: Buffer.from(out, "base64")
            });
        });
    });
};

let glitch = async function(ctx, msg, args) {
    if (args && args.startsWith("http")) {
        imgfuck(msg, args);
    } else if (msg.attachments.length > 0) {
        imgfuck(msg, msg.attachments[0].url);
    } else if (/[0-9]{17,21}/.test(args)) {
        ctx.utils.lookupUser(ctx, msg, args).then(u => {
            let url =
                u.avatar !== null
                    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
                          u.avatar.startsWith("a_") ? "gif" : "png"
                      }?size=1024`
                    : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                          5}.png`;
            imgfuck(msg, url);
        });
    } else {
        msg.channel.createMessage(
            "Image not found. Please give URL, attachment or user mention."
        );
    }
};

let glitchfuck = function(ctx, msg, url) {
    msg.channel.sendTyping();
    async function jimpAsync(buf) {
        return new Promise((resolve, reject) => {
            new jimp(buf, (err, img) => {
                if (err) reject(err);
                resolve(img);
            });
        });
    }

    async function glitchFrames(m, inp) {
        m.edit(
            "<a:typing:393848431413559296> Please wait, glitching in progress. `(Step: Extracting frames)`"
        );
        var outframes = [];

        for (let f in inp.frames) {
            let frame = inp.frames[f];
            let img = frame.bitmap;

            let i = await jimpAsync(img);
            let out = await i.getBufferAsync(jimp.MIME_JPEG);
            let glitch = Buffer.from(imgfkr.processBuffer(out), "base64");

            outframes.push({ data: glitch, delay: frame.delayCentisecs });
        }

        return outframes;
    }

    const { spawn } = require("child_process");

    async function makeTheGif(m, frames) {
        m.edit(
            "<a:typing:393848431413559296> Please wait, glitching in progress. `(Step: Creating gif)`"
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

    ctx.libs.superagent.get(url).then(img => {
        GifUtil.read(img.body).then(async inp => {
            let m = await msg.channel.createMessage(
                "<a:typing:393848431413559296> Please wait, glitching in progress."
            );

            var outframes = await glitchFrames(m, inp);

            var gif = await makeTheGif(m, outframes);

            m.edit(
                "<a:typing:393848431413559296> Please wait, glitching in progress. `(Step: Uploading)`"
            );
            msg.channel
                .createMessage("", { name: "glitch.gif", file: gif })
                .then(_ => m.delete());
        });
    });
};

let gglitch = async function(ctx, msg, args) {
    if (args && args.startsWith("http")) {
        glitchfuck(ctx, msg, args);
    } else if (msg.attachments.length > 0) {
        glitchfuck(ctx, msg, msg.attachments[0].url);
    } else if (/<a:([a-zA-Z0-9_*/-:]+):([0-9]+)>/.test(args)) {
        let emote = args.match(/<a:([a-zA-Z0-9_*/-:]+):([0-9]+)>/);
        let url = `https://cdn.discordapp.com/emojis/${emote[2]}.gif`;

        glitchfuck(ctx, msg, url);
    } else if (/[0-9]{17,21}/.test(args)) {
        ctx.utils.lookupUser(ctx, msg, args).then(u => {
            let url =
                u.avatar !== null
                    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
                          u.avatar.startsWith("a_") ? "gif" : "png"
                      }?size=1024`
                    : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                          5}.png`;

            if (u.avatar.startsWith("a_")) {
                glitchfuck(ctx, msg, url);
            } else {
                msg.channel.createMessage(
                    "User does not have an animated avatar."
                );
            }
        });
    } else {
        msg.channel.createMessage(
            "Image not found. Please give URL, attachment, user mention or animated emoji."
        );
    }
};

let i2gg = async function(msg, url) {
    async function glitchImageXTimes(m, inp) {
        m.edit(
            "<a:typing:393848431413559296> Please wait, glitching in progress. `(Step: Making glitch frames)`"
        );
        var outframes = [];

        for (let i = 0; i < 10; i++) {
            outframes.push(Buffer.from(imgfkr.processBuffer(inp), "base64"));
        }

        return outframes;
    }

    async function makeTheGif(m, frames) {
        m.edit(
            "<a:typing:393848431413559296> Please wait, glitching in progress. `(Step: Creating gif)`"
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

    let m = await msg.channel.createMessage(
        "<a:typing:393848431413559296> Please wait, glitching in progress."
    );

    var i = await jimp.read(url);
    var img = await i.getBufferAsync(jimp.MIME_JPEG);
    var frames = await glitchImageXTimes(m, img);
    var out = await makeTheGif(m, frames);

    m.edit(
        "<a:typing:393848431413559296> Please wait, glitching in progress. `(Step: Uploading)`"
    );
    msg.channel
        .createMessage("", { name: "img2glitch.gif", file: out })
        .then(_ => m.delete());
};

let img2glitch = async function(ctx, msg, args) {
    if (args && args.startsWith("http")) {
        i2gg(msg, args);
    } else if (msg.attachments.length > 0) {
        i2gg(msg, msg.attachments[0].url);
    } else if (/[0-9]{17,21}/.test(args)) {
        ctx.utils.lookupUser(ctx, msg, args).then(u => {
            let url =
                u.avatar !== null
                    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
                          u.avatar.startsWith("a_") ? "gif" : "png"
                      }?size=1024`
                    : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                          5}.png`;

            if (u.avatar.startsWith("a_")) {
                i2gg(msg, url);
            } else {
                msg.channel.createMessage(
                    "User does not have an animated avatar."
                );
            }
        });
    } else {
        msg.channel.createMessage(
            "Image not found. Please give URL, attachment or user mention."
        );
    }
};

module.exports = [
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
        name: "orly",
        desc: "Creates an O RLY parody book cover.",
        func: orly,
        group: "image",
        usage: '"title" "bottom text" "top text"(optional) "author"(optional)'
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
        name: "glitch",
        desc: "Glitch out an image",
        fulldesc: `
Credit to [bootsy](https://soc.uwu.st/@bootsy) for the idea and code.
Based off of [imgfkr](https://github.com/mikedotalmond/imgfkr-twitterbot)
([twitter](https://twitter.com/imgfkr) | [masto version by bootsy](https://botsin.space/@img))
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
        desc: "Glitch an image multiple times and make it a GIF.",
        func: img2glitch,
        group: "image",
        usage: "[url or attachment]",
        aliases: ["i2gg"]
    }

    /*{
        name: "img2braille",
        desc: "Makes an image into braille characters.",
        func: img2braille,
        group: "image",
        aliases: ["i2b"]
    }*/
];
