// config/config.js

module.exports = {
  development: {
    username: 'postgres',
    password: 'samwin25',
    database: 'gestionnaire_db',
    host: '127.0.0.1',
    port: 5433,
    dialect: 'postgres'
  },
  test: {
    username: 'postgres',
    password: 'samwin25',
    database: 'gestionnaire-test',
    host: '127.0.0.1',
    port: 5433,
    dialect: 'postgres'
  },
  production: {
    username: 'postgres',
    password: 'samwin25',
    database: 'gestionnaire-db',
    host: '127.0.0.1',
    port: 5433,
    dialect: 'postgres'
  }
};
