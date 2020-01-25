const superagent = require("superagent");
const cheerio = require("cheerio");
const { drawSkin3D } = require("./namemc-renderer.js");

let cache = {};

async function getProfileFromUUID(uuid) {
    uuid = uuid.replace(/\-/g, "");
    if (cache[uuid]) return cache[uuid];

    let page = await superagent
        .get(`https://namemc.com/profile/${uuid}`)
        .set(
            "User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0"
        )
        .then(x => x.text);

    if (!page) return;

    $ = cheerio.load(page);
    let username = $("main h1").text();

    let history = [];
    $($(".col-lg-8 .card")[1])
        .find(".card-body .row")
        .each(function(i, e) {
            let x = $(this);
            let username = x.find("a:not(.copy-button)").text();
            let date = x.find("time").attr("datetime");
            let row = { name: username };
            if (date != null) {
                row.date = new Date(date);
            }
            history.push(row);
        });

    let skinData = await superagent
        .get(
            `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
        )
        .then(x =>
            JSON.parse(Buffer.from(x.body.properties[0].value, "base64"))
        );
    let ofCape = false;
    await superagent
        .get(`http://s.optifine.net/capes/${username}.png`)
        .then(x => (ofCape = true))
        .catch(e => (ofCape = false));

    let out = {
        username: username,
        uuid: uuid,
        nameHistory: history,
        skinData: {
            skin: skinData.textures.SKIN.url,
            cape: ofCape
                ? `http://s.optifine.net/capes/${username}.png`
                : skinData.textures.CAPE
                ? skinData.textures.CAPE.url
                : null,
            model: skinData.textures.SKIN.metadata
                ? skinData.textures.SKIN.metadata.model
                : null
        }
    };
    cache[uuid] = out;

    return out;
}

async function getProfileFromName(name) {
    /*let page = await superagent
        .get(`https://namemc.com/name/${name.toLowerCase()}`)
        .set(
            "User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0"
        )
        .then(x => x.text);

    if (!page) return;

    let $ = cheerio.load(page);

    let uuid =
        "https://namemc.com" +
        $($(".col-lg-7 .card")[0])
            .find(".card-header .row .col samp")
            .text();*/
    let uuid = await superagent
        .get(`https://api.mojang.com/users/profiles/minecraft/${name}`)
        .then(x => x.body.id);

    return await getProfileFromUUID(uuid);
}

async function renderPlayerModelFromUUID(uuid) {
    let playerData = await getProfileFromUUID(uuid);

    let front = await drawSkin3D(
        playerData.skinData.model == "slim",
        playerData.skinData.skin,
        playerData.skinData.cape || null
    ).then(x => x);
    let back = await drawSkin3D(
        playerData.skinData.model == "slim",
        playerData.skinData.skin,
        playerData.skinData.cape || null,
        false,
        false,
        -210
    ).then(x => x);

    return {
        front: await front,
        back: await back
    };
}

async function renderPlayerModelFromName(name) {
    let playerData = await getProfileFromName(name);

    let front = await drawSkin3D(
        playerData.skinData.model == "slim",
        playerData.skinData.skin,
        playerData.skinData.cape || null
    );
    let back = await drawSkin3D(
        playerData.skinData.model == "slim",
        playerData.skinData.skin,
        playerData.skinData.cape || null,
        false,
        true,
        -210
    );

    return {
        front: front,
        back: back
    };
}

module.exports = {
    getProfileFromUUID,
    getProfileFromName,
    renderPlayerModelFromUUID,
    renderPlayerModelFromName
};
