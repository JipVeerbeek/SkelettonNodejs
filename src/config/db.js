import { Sequelize } from 'sequelize'

const connection = new Sequelize('skeletondb', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
  });
  
  export default connection;