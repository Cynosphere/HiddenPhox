const superagent = require("superagent");
const unilib = { data: {} };

unilib.cacheList = async function() {
    let raw = await superagent
        .get("https://unicode.org/Public/UNIDATA/UnicodeData.txt")
        .then(x => x.text);
    await raw
        .split("\n")
        .map(x => x.split(";").splice(0, 2))
        .map(x => {
            if (x[0] != "") unilib.data[x[0].toLowerCase()] = x[1];
        });
};
unilib.cacheList().then(x => {
    unilib.getNamesFromString = function(string) {
        let charcodes = Array.from(string).map(x =>
            x.codePointAt().toString(16)
        );

        return charcodes.map(x => [
            x.padStart(4, "0"),
            unilib.data[x.padStart(4, "0")]
        ]);
    };
});

module.exports = unilib;
