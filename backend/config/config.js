// config/config.js

const config = {
    production: {
        SECRET: process.env.SECRET || 'SUPER_SECRET_KEY_PROD',
        DATABASE: process.env.MONGODB_URI || 'mongodb://localhost:27017/mi_app_prod'
    },
    default: {
        SECRET: 'SUPER_SECRET_KEY_DEV',
        DATABASE: 'mongodb://localhost:27017/mi_app_dev'
    }
};

exports.get = function get(env) {
    return config[env] || config.default;
};