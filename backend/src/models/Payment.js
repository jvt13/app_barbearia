module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Payment', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        amount: DataTypes.DECIMAL,
        method: DataTypes.ENUM('cash', 'pix', 'card'),
        status: DataTypes.ENUM('paid', 'pending')
    })
}
