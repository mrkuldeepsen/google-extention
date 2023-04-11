module.exports = (sequelize, Sequelize) => {
    const Topic = sequelize.define('topics', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        title: {
            type: Sequelize.STRING,
            require: true,
            allowNull: false,
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

    return Topic
}
