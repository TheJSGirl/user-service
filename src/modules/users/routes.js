const controller = require('./controllers');
const UserValidation = require('./validation');
const checkAuth = require('./../../service/authentication');
const validate = require('express-validation');
const route = require('express').Router();

route.post('/signUp', [validate(UserValidation.signup)], controller.registerUser);
route.post('/signIn', [validate(UserValidation.signin)], controller.loginUser);
route.get('/', checkAuth, controller.listOne);

module.exports = route;
