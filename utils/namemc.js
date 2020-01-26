const superagent = require("superagent");
const { drawSkin3D } = require("./namemc-renderer.js");

async function getProfileFromUUID(uuid) {
    uuid = uuid.replace(/\-/g, "");

    let history = await superagent
        .get(`https://api.mojang.com/user/profiles/${uuid}/names`)
        .then(x => x.body);
    let username = history[history.length - 1].name;

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

    return out;
}

async function getProfileFromName(name) {
    let uuid = await superagent
        .get(`https://api.mojang.com/users/profiles/minecraft/${name}`)
        .then(x => x.body.id);
    if (!uuid)
        uuid = await superagent
            .get(`https://api.mojang.com/users/profiles/minecraft/${name}?at=0`)
            .then(x => x.body.id);
    if (!uuid) return;

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
