module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Product', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: DataTypes.TEXT,
        price: { type: DataTypes.DECIMAL, allowNull: false },
        stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        imageUrl: DataTypes.STRING,
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    })
}
