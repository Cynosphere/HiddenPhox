module.exports = function(ctx) {
    let dbs = {};

    dbs.econ = ctx.db.define("econ", {
        id: {
            type: ctx.libs.sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        currency: {
            type: ctx.libs.sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        noreact: {
            type: ctx.libs.sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        lastdaily: {
            type: ctx.libs.sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        points: {
            type: ctx.libs.sequelize.INTEGER,
            defaultValue: 3,
            allowNull: false
        },
        cd_jail: {
            type: ctx.libs.sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        cd_grace: {
            type: ctx.libs.sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        cd_regen: {
            type: ctx.libs.sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        cd_heist: {
            type: ctx.libs.sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        }
    });

    dbs.taxbanks = ctx.db.define("taxbanks", {
        id: {
            type: ctx.libs.sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        currency: {
            type: ctx.libs.sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        cooldown: {
            type: ctx.libs.sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        }
    });

    dbs.sdata = ctx.db.define("sdata", {
        id: {
            type: ctx.libs.sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        roleme: {
            type: ctx.libs.sequelize.STRING,
            defaultValue: "[]",
            allowNull: false
        },
        logging: {
            type: ctx.libs.sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        logchan: {
            type: ctx.libs.sequelize.STRING,
            defaultValue: "0",
            allowNull: false
        },
        allow_snipe: {
            type: ctx.libs.sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        shortlinks: {
            type: ctx.libs.sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    });

    dbs.analytics = ctx.db.define("analytics", {
        id: {
            type: ctx.libs.sequelize.INTEGER,
            unique: true,
            primaryKey: true
        },
        econ_steal_succ: {
            type: ctx.libs.sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        econ_steal_fail: {
            type: ctx.libs.sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        cmd_usage: {
            type: ctx.libs.sequelize.STRING,
            defaultValue: "{}",
            allowNull: false
        }
    });

    dbs.osu = ctx.db.define("osu", {
        id: {
            type: ctx.libs.sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        username: {
            type: ctx.libs.sequelize.STRING,
            defaultValue: "",
            allowNull: false
        }
    });

    dbs.osutrack = ctx.db.define("osutrack", {
        id: {
            type: ctx.libs.sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        tracking: {
            type: ctx.libs.sequelize.STRING,
            defaultValue: "[]",
            allowNull: false
        },
        channel: {
            type: ctx.libs.sequelize.STRING,
            defaultValue: "",
            allowNull: false
        }
    });

    dbs.econ.sync({ force: false, alter: true });
    dbs.taxbanks.sync({ force: false, alter: true });
    dbs.sdata.sync({ force: false, alter: true });
    dbs.analytics.sync({ force: false, alter: true });
    dbs.osu.sync({ force: false, alter: true });
    dbs.osutrack.sync({ force: false, alter: true });

    return dbs;
};
