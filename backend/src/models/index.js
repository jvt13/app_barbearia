const { Sequelize, DataTypes } = require('sequelize')

const UserModel = require('./User')
const ServiceModel = require('./Service')
const AppointmentModel = require('./Appointment')
const PaymentModel = require('./Payment')
const ProfessionalModel = require('./Professional')
const ProductModel = require('./Product')
const ServicePackageModel = require('./Package')

const sequelize = new Sequelize(
    process.env.DB_NAME || 'app_barbearia',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        dialect: 'postgres',
        logging: false
    }
)

const User = UserModel(sequelize, DataTypes)
const Service = ServiceModel(sequelize, DataTypes)
const Appointment = AppointmentModel(sequelize, DataTypes)
const Payment = PaymentModel(sequelize, DataTypes)
const Professional = ProfessionalModel(sequelize, DataTypes)
const Product = ProductModel(sequelize, DataTypes)
const ServicePackage = ServicePackageModel(sequelize, DataTypes)

User.hasMany(Appointment, { foreignKey: 'userId' })
Appointment.belongsTo(User, { foreignKey: 'userId' })

Service.hasMany(Appointment, { foreignKey: 'serviceId' })
Appointment.belongsTo(Service, { foreignKey: 'serviceId' })

User.hasMany(Payment, { foreignKey: 'userId' })
Payment.belongsTo(User, { foreignKey: 'userId' })

module.exports = {
    sequelize,
    Sequelize,
    User,
    Service,
    Appointment,
    Payment,
    Professional,
    Product,
    Package: ServicePackage
}
