// Mappings

let fwcharmap = {
    "!": "\uFF01",
    '"': "\uFF02",
    "#": "\uFF03",
    $: "\uFF04",
    "%": "\uFF05",
    "&": "\uFF06",
    "'": "\uFF07",
    "(": "\uFF08",
    ")": "\uFF09",
    "*": "\uFF0A",
    "+": "\uFF0B",
    ",": "\uFF0C",
    "-": "\uFF0D",
    ".": "\uFF0E",
    "/": "\uFF0F",
    ":": "\uFF1A",
    ";": "\uFF1B",
    "<": "\uFF1C",
    "=": "\uFF1D",
    ">": "\uFF1E",
    "?": "\uFF1F",
    "@": "\uFF20",
    "[": "\uFF3B",
    "\\": "\uFF3C",
    "]": "\uFF3D",
    "^": "\uFF3E",
    _: "\uFF3F",
    "`": "\uFF40",
    "{": "\uFF5B",
    "|": "\uFF5C",
    "}": "\uFF5D",
    "~": "\uFF5E",

    A: "\uFF21",
    B: "\uFF22",
    C: "\uFF23",
    D: "\uFF24",
    E: "\uFF25",
    F: "\uFF26",
    G: "\uFF27",
    H: "\uFF28",
    I: "\uFF29",
    J: "\uFF2A",
    K: "\uFF2B",
    L: "\uFF2C",
    M: "\uFF2D",
    N: "\uFF2E",
    O: "\uFF2F",
    P: "\uFF30",
    Q: "\uFF31",
    R: "\uFF32",
    S: "\uFF33",
    T: "\uFF34",
    U: "\uFF35",
    V: "\uFF36",
    W: "\uFF37",
    X: "\uFF38",
    Y: "\uFF39",
    Z: "\uFF3A",

    a: "\uFF41",
    b: "\uFF42",
    c: "\uFF43",
    d: "\uFF44",
    e: "\uFF45",
    f: "\uFF46",
    g: "\uFF47",
    h: "\uFF48",
    i: "\uFF49",
    j: "\uFF4A",
    k: "\uFF4B",
    l: "\uFF4C",
    m: "\uFF4D",
    n: "\uFF4E",
    o: "\uFF4F",
    p: "\uFF50",
    q: "\uFF51",
    r: "\uFF52",
    s: "\uFF53",
    t: "\uFF54",
    u: "\uFF55",
    v: "\uFF56",
    w: "\uFF57",
    x: "\uFF58",
    y: "\uFF59",
    z: "\uFF5A",

    "0": "\uFF10",
    "1": "\uFF11",
    "2": "\uFF12",
    "3": "\uFF13",
    "4": "\uFF14",
    "5": "\uFF15",
    "6": "\uFF16",
    "7": "\uFF17",
    "8": "\uFF18",
    "9": "\uFF19",

    " ": "\u3000"
};

let bubblemap = {
    A: "\u24B6",
    B: "\u24B7",
    C: "\u24B8",
    D: "\u24B9",
    E: "\u24BA",
    F: "\u24BB",
    G: "\u24BC",
    H: "\u24BD",
    I: "\u24BE",
    J: "\u24BF",
    K: "\u24C0",
    L: "\u24C1",
    M: "\u24C2",
    N: "\u24C3",
    O: "\u24C4",
    P: "\u24C5",
    Q: "\u24C6",
    R: "\u24C7",
    S: "\u24C8",
    T: "\u24C9",
    U: "\u24CA",
    V: "\u24CB",
    W: "\u24CC",
    X: "\u24CD",
    Y: "\u24CE",
    Z: "\u24CF",

    a: "\u24D0",
    b: "\u24D1",
    c: "\u24D2",
    d: "\u24D3",
    e: "\u24D4",
    f: "\u24D5",
    g: "\u24D6",
    h: "\u24D7",
    i: "\u24D8",
    j: "\u24D9",
    k: "\u24DA",
    l: "\u24DB",
    m: "\u24DC",
    n: "\u24DD",
    o: "\u24DE",
    p: "\u24DF",
    q: "\u24E0",
    r: "\u24E1",
    s: "\u24E2",
    t: "\u24E3",
    u: "\u24E4",
    v: "\u24E5",
    w: "\u24E6",
    x: "\u24E7",
    y: "\u24E8",
    z: "\u24E9",

    "0": "\u24EA",
    "1": "\u2460",
    "2": "\u2461",
    "3": "\u2462",
    "4": "\u2463",
    "5": "\u2464",
    "6": "\u2465",
    "7": "\u2466",
    "8": "\u2467",
    "9": "\u2468",

    " ": "\u25EF"
};

// Commands

let dancesay = function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage(`Please use with some text.`);
    } else {
        let emotes = {
            "0": "<a:r_letter_0:393623734092693524>",
            "1": "<a:r_letter_1:393623734344220673>",
            "2": "<a:r_letter_2:393623734180642837>",
            "3": "<a:r_letter_3:393623734109601812>",
            "4": "<a:r_letter_4:393623734147088384>",
            "5": "<a:r_letter_5:393623733731983362>",
            "6": "<a:r_letter_6:393623733962539019>",
            "7": "<a:r_letter_7:393623734075785216>",
            "8": "<a:r_letter_8:393623734155739136>",
            "9": "<a:r_letter_9:393623734101213194>",
            a: "<a:r_letter_a:393623734344351744>",
            b: "<a:r_letter_b:393623734034104322>",
            c: "<a:r_letter_c:393623734176448512>",
            d: "<a:r_letter_d:393623734168190996>",
            e: "<a:r_letter_e:393623733937373185>",
            f: "<a:r_letter_f:393623734268985346>",
            g: "<a:r_letter_g:393623734055075841>",
            h: "<a:r_letter_h:393623734549741568>",
            i: "<a:r_letter_i:393623734616981514>",
            j: "<a:r_letter_j:393623734323249174>",
            k: "<a:r_letter_k:393623734461792257>",
            l: "<a:r_letter_l:393623734621306881>",
            m: "<a:r_letter_m:393623734813982720>",
            n: "<a:r_letter_n:393623734696542209>",
            o: "<a:r_letter_o:393623735011246080>",
            p: "<a:r_letter_p:393623734931554305>",
            q: "<a:r_letter_q:393623735137206272>",
            r: "<a:r_letter_r:393623735065903114>",
            s: "<a:r_letter_s:393623735132749824>",
            t: "<a:r_letter_t:393623735002988545>",
            u: "<a:r_letter_u:393623735229218816>",
            v: "<a:r_letter_v:393623735216898049>",
            w: "<a:r_letter_w:393623735388602368>",
            x: "<a:r_letter_x:393623735028154369>",
            y: "<a:r_letter_y:393623735233675265>",
            z: "<a:r_letter_z:393623735376150550>",
            "&": "<a:r_letter_and:393623733761212427>",
            "@": "<a:r_letter_at:393623734122053632>",
            $: "<a:r_letter_dollar:393623734344351774>",
            "!": "<a:r_letter_exclaim:393623734377906176>"
        };

        let inp = ctx.utils.safeString(args).split("");
        let out = "";
        for (let x in inp) {
            if (inp[x].toLowerCase() == " " || inp[x].toLowerCase() == ":") {
                out += "<:blankboi:393555375389016065>";
            } else {
                out += emotes[inp[x].toLowerCase()] || inp[x].toLowerCase();
            }
        }

        msg.channel.createMessage(out);
    }
};

let fullwidth = function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage(`Please use with some text.`);
    } else {
        let inp = ctx.utils.safeString(args).split("");
        let out = "";
        for (let x in inp) {
            out += fwcharmap[inp[x]] || inp[x];
        }

        msg.channel.createMessage(out);
    }
};

let bunnysay = function(ctx, msg, args) {
    let cside = "\uFF5C";
    let ctop = "\uFFE3";
    let cbot = "\uFF3F";

    let bun = "(\\__/) ||\n(\u2022\u3145\u2022) ||\n/ \u3000 \u3065||";

    if (!args) {
        let err = "Please use with some text.";
        let inp = ctx.utils.safeString(err).split("");
        let out = "";
        for (let x in inp) {
            out += fwcharmap[inp[x]] || inp[x];
        }

        let final = "";
        final += cside + ctop.repeat(err.length) + cside + "\n";
        final += cside + out + cside + "\n";
        final += cside + cbot.repeat(err.length) + cside + "\n";
        final += bun;

        msg.channel.createMessage(`\`\`\`${final}\`\`\``);
    } else {
        let inp = ctx.utils.safeString(args).split("");
        let out = "";
        for (let x in inp) {
            out += fwcharmap[inp[x]] || inp[x];
        }

        let final = "";
        final += cside + ctop.repeat(args.length) + cside + "\n";
        final += cside + out + cside + "\n";
        final += cside + cbot.repeat(args.length) + cside + "\n";
        final += bun;

        msg.channel.createMessage(`\`\`\`${final}\`\`\``);
    }
};

let bubblesay = function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage(`Please use with some text.`);
    } else {
        let inp = ctx.utils.safeString(args).split("");
        let out = "";
        for (let x in inp) {
            out += bubblemap[inp[x]] || inp[x];
        }

        msg.channel.createMessage(out);
    }
};

let logosay = function(ctx, msg, args) {
    if (!args) {
        msg.channel.createMessage(`Please use with some text.`);
    } else {
        let emotes = {
            "0": "0",
            "1": "1",
            "2": "2",
            "3": "3",
            "4": "4",
            "5": "5",
            "6": "6",
            "7": "7",
            "8": "8",
            "9": "9",
            a: "<:LogoA:414655543458922506>",
            b: "<:LogoB:414655554158329856>",
            c: "<:LogoC:414655566636646400>",
            d: "<:LogoD:414655751181565974>",
            e: "<:LogoE:414655783116996608>",
            f: "<:LogoF:414655803157381122>",
            g: "<:LogoG:414655817493512200>",
            h: "<:LogoH:414655829732753420>",
            i: "<:LogoI:414656712478294026>",
            j: "<:LogoJ:414660430577795072>",
            k: "<:LogoK:414660451822075904>",
            l: "<:LogoL:414660470834724876>",
            m: "<:LogoM:414660488970895360>",
            n: "<:LogoN:414660515298541589>",
            o: "<:LogoO:414660533531181057>",
            p: "<:LogoP:414676183926571009>",
            q: "<:LogoQ:414666225600299018>",
            r: "<:LogoR:414666249138601994>",
            s: "<:LogoS:414666264930418698>",
            t: "<:LogoT:414666283687346187>",
            u: "<:LogoU:414666299407335424>",
            v: "<:LogoV:414666317627523073>",
            w: "<:LogoW:414666346144595978>",
            x: "<:LogoX:414666361373982722>",
            y: "<:LogoY:414666374179454976>",
            z: "<:LogoZ:414666386304925706>"
        };

        let inp = ctx.utils.safeString(args).split("");
        let out = "";
        for (let x in inp) {
            if (inp[x].toLowerCase() == " " || inp[x].toLowerCase() == ":") {
                out += "<:blankboi:393555375389016065>";
            } else {
                out += emotes[inp[x].toLowerCase()] || inp[x].toLowerCase();
            }
        }

        msg.channel.createMessage(out);
    }
};

module.exports = [
    {
        name: "dancesay",
        desc: "hey its that dancing letter meme",
        func: dancesay,
        group: "text",
        aliases: ["dsay", "ds"]
    },
    {
        name: "fullwidth",
        desc:
            "\uFF41\uFF45\uFF53\uFF54\uFF48\uFF45\uFF54\uFF49\uFF43\u3000\uFF54\uFF45\uFF58\uFF54",
        func: fullwidth,
        group: "text",
        aliases: ["fw"]
    },
    {
        name: "bunnysay",
        desc: "Make a bunny say things",
        func: bunnysay,
        group: "text",
        aliases: ["bunsay"]
    },
    {
        name: "bubblesay",
        desc: "Just don't let them pop",
        func: bubblesay,
        group: "text",
        aliases: ["bsay"]
    },
    {
        name: "logosay",
        desc: "Say things in logos",
        func: logosay,
        group: "text",
        aliases: ["lsay", "ls"]
    }
];
