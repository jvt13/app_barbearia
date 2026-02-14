module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Appointment', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        date: DataTypes.DATE,
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
            defaultValue: 'pending'
        }
    })
}
