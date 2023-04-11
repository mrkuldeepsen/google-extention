module.exports = (sequelize, Sequelize) => {
    const GroupMember = sequelize.define('group_members', {
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

    return GroupMember
}
