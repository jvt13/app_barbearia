module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Package', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: DataTypes.TEXT,
        price: { type: DataTypes.DECIMAL, allowNull: false },
        duration: { type: DataTypes.INTEGER, allowNull: false },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    })
}
