import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const package_model = sequelize.define("package", {
    id_package: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    id_shop: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_product1: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_product2: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    id_product3: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    id_product4: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    id_product5: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    name_package: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    creation_package: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    active_package: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default package_model;