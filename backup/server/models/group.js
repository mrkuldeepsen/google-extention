module.exports = (sequelize, Sequelize) => {
    const Group = sequelize.define('groups', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        name: {
            type: Sequelize.STRING,
            require: true,
            unique: {
                args: true, msg: 'This group is already taken.'
            },
        },
        short_description: {
            type: Sequelize.TEXT('long'),
        },
        description: {
            type: Sequelize.TEXT('long'),
        },
    },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    return Group
}
