module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Professional', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        specialty: { type: DataTypes.STRING, allowNull: false },
        bio: DataTypes.TEXT,
        avatarUrl: DataTypes.STRING,
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    })
}
