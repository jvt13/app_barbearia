module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Service', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        price: DataTypes.DECIMAL,
        duration: DataTypes.INTEGER // em minutos
    })
}
