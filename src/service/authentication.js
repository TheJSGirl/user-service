const jwt = require('jsonwebtoken');
const User = require('./../modules/users/models');
const config = require('./../config');
const { response } = require('./../utils');
const _ = require('lodash');

const checkAuth = async(req, res, next) =>{
    const headerToken = req.headers.authorization;
    const token = headerToken ? headerToken.split(' ')[1] : '';

    if (!token) {
        req.authenticated = false;
        return res.status(401).send(response({}, 'Unauthorized Request', false))
    }
    
    let decoded = '';
    
    try {
        decoded = await jwt.verify(token, config.jwt.jwt_sceret, config.jwt.jwt_exp)
    } catch (e) {
        req.authenticated = false;
        res.status(401).send(response({}, e.message, false))
    }
    if (!decoded) {
        req.authenticated = false;
        return res.status(401).send(response({}, 'Unauthorized Request', false))
    }
    
    const dbUser = await User.findOne({ _id: decoded.id });
    const permission = {
        admin: false,
    };

    if (dbUser && dbUser.role === 'admin') {
        permission.admin = true;
    }

    req.authenticated = true;
    dbUser.password = null;
    req.user = dbUser;
    req.permission = permission;
    await next();

}

module.exports = checkAuth;
