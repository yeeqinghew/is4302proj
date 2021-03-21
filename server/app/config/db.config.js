module.exports = {
    HOST: "localhost",
    USER: "postgres",
    PASSWORD: "password",
    DB: "is4302", // this will be the database name
    dialect: "postgres",
    pool: {
        max: 5, // mac number of connection in pool
        min: 0, // min number of connection in pool
        acquire: 30000, // max time, in ms that a connection can be idle before being released
        idle: 10000 // max time, in ms that a pool will try to get connection before throwing error
    }
};