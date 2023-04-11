module.exports = (sequelize, Sequelize) => {
    const Article = sequelize.define('articles', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            // unique: true
        },
        description: {
            type: Sequelize.TEXT('long'),
            allowNull: true
        },
        original_file_name: {
            type: Sequelize.STRING,
            allowNull: true,

        },
        file_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        url: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        type: {
            type: Sequelize.STRING,
            allowNull: true,
            validate: {
                isIn: [['image', 'application', 'video', 'audio',]],
            }
        },
        file_URL: {
            type: Sequelize.STRING,
            allowNull: true
        },
        file_size: {
            type: Sequelize.FLOAT,
        },
        date: {
            type: Sequelize.STRING,
            allowNull: true
        },
        status: {
            type: Sequelize.STRING,
            allowNull: true,
            validate: {
                isIn: [['publish', 'draft',]],
            }
        },
    },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    return Article
}
