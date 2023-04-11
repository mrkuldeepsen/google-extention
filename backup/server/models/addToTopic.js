module.exports = (sequelize, Sequelize) => {
    const AddToTopic = sequelize.define('add_to_topics', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
    },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    return AddToTopic
}
