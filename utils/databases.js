const sequelize = require("sequelize");

module.exports = function(ctx) {
    let dbs = {};

    dbs.econ = ctx.db.define("econ", {
        id: {
            type: sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        currency: {
            type: sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        noreact: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        lastdaily: {
            type: sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        lastvote: {
            type: sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        points: {
            type: sequelize.INTEGER,
            defaultValue: 3,
            allowNull: false
        },
        cd_jail: {
            type: sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        cd_grace: {
            type: sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        cd_regen: {
            type: sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        cd_heist: {
            type: sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        }
    });

    dbs.taxbanks = ctx.db.define("taxbanks", {
        id: {
            type: sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        currency: {
            type: sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        cooldown: {
            type: sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        }
    });

    dbs.sdata = ctx.db.define("sdata", {
        id: {
            type: sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        roleme: {
            type: sequelize.STRING,
            defaultValue: "[]",
            allowNull: false
        },
        logging: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        logchan: {
            type: sequelize.STRING,
            defaultValue: "0",
            allowNull: false
        },
        allow_snipe: {
            type: sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        shortlinks: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        twimg: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        prefix: {
            type: sequelize.STRING,
            defaultValue: "",
            allowNull: false
        },
        noreactglobal: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        funallowed: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    });

    dbs.udata = ctx.db.define("udata", {
        id: {
            type: sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        prefix: {
            type: sequelize.STRING,
            defaultValue: "",
            allowNull: false
        }
    });

    dbs.econ.sync({ force: false, alter: true });
    dbs.taxbanks.sync({ force: false, alter: true });
    dbs.sdata.sync({ force: false, alter: true });
    dbs.udata.sync({ force: false, alter: true });

    return dbs;
};
