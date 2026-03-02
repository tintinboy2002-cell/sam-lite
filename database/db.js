const Sequelize = require('sequelize')
const db = {}
const sequelize = new Sequelize("mean_login", "root", "", {
    host: "localhost",
    dialect: "mysql",
    operatorsAliases: false,

    pools: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db