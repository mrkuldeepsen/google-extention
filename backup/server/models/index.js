const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    operatorsAliases: 0,
    hooks: {
        beforeDefine: function (columns, model) {
            // model.tableName = 'initial_' + model.name.plural
        },
        afterCreate: (record) => {
            delete record.dataValues.password
        },
        afterUpdate: (record) => {
            delete record.dataValues.password
        },
    },
    define: {
        timestamps: true,
        freezeTableName: true
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

const db = {
    sequelize: sequelize,
    User: require('./user')(sequelize, Sequelize),
    Article: require('./article')(sequelize, Sequelize),
    Topic: require('./topic')(sequelize, Sequelize),
    Group: require('./group')(sequelize, Sequelize),
    GroupMember: require('./groupMember')(sequelize, Sequelize),

    //Add to topic
    AddToTopic: require('./addToTopic')(sequelize, Sequelize),

    //Share in group
    Share: require('./share')(sequelize, Sequelize),

}

//////////////////// Association section      /////////////////

db.Article.belongsTo(db.User, { constraints: false, foreignKey: 'id' })
db.User.hasMany(db.Article, { constraints: false, foreignKey: 'user_id' })

//Article with topic

db.Topic.belongsTo(db.Topic, { constraints: false, foreignKey: 'id' })
db.Topic.hasMany(db.Topic, { constraints: false, foreignKey: 'parent_id' })

db.Topic.belongsTo(db.User, { constraints: false, foreignKey: 'id' })
db.User.hasMany(db.Topic, { constraints: false, foreignKey: 'user_id' })

db.Group.belongsTo(db.User, { constraints: false, foreignKey: 'id' })
db.User.hasMany(db.Group, { constraints: false, foreignKey: 'admin_id' })

//Add to topic tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt

db.AddToTopic.belongsTo(db.Topic, { constraints: false, foreignKey: 'id' })
db.Topic.hasMany(db.AddToTopic, { constraints: false, foreignKey: 'topic_id' })

db.AddToTopic.belongsTo(db.Article, { constraints: false, foreignKey: 'id' })
db.Article.hasMany(db.AddToTopic, { constraints: false, foreignKey: 'article_id' })

//tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt

db.GroupMember.belongsTo(db.User, { constraints: false, foreignKey: 'id' })
db.User.hasMany(db.GroupMember, { constraints: false, foreignKey: 'admin_id' })

db.GroupMember.belongsTo(db.Group, { constraints: false, foreignKey: 'id' })
db.Group.hasMany(db.GroupMember, { constraints: false, foreignKey: 'group_id' })

db.GroupMember.belongsTo(db.User, { constraints: false, foreignKey: 'id' })
db.User.hasMany(db.GroupMember, { constraints: false, foreignKey: 'member_id' })

//Share Add to article in the group

db.Share.belongsTo(db.Group, { constraints: false, foreignKey: 'id' })
db.Group.hasMany(db.Share, { constraints: false, foreignKey: 'group_id' })

db.Share.belongsTo(db.Article, { constraints: false, foreignKey: 'id' })
db.Article.hasMany(db.Share, { constraints: false, foreignKey: 'article_id' })

db.Share.belongsTo(db.User, { constraints: false, foreignKey: 'id' })
db.User.hasMany(db.Share, { constraints: false, foreignKey: 'user_id' })

//////////////////////////////////////////////////////////

db.sequelize.sync({ alter: true, }).then(() => { console.log('Yes re-sync') })
module.exports = db