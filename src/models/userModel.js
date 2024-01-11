import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import connection from "../config/db.js";

const User = connection.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resetToken: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  resetTokenExpiration: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
});

User.beforeCreate(async (user) => {
  const saltRounds = 10;
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
});

User.prototype.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default User;
