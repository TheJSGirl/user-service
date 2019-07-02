const User = require('./models');
const bcrypt = require('bcrypt');
const {HashSettings, jwt} = require('../../config');
const jwtToken = require('jsonwebtoken');
const { response } = require('./../../utils');

async function listOne(req, res) {
    res.status(200).send(response(req.user, ''));
}

async function registerUser(req, res) {

    const { name, password, email, mobile, username, image } = req.body;
    const hasUser = await User.findOne({ email });
    
    if(hasUser) {
        return res.status(201).json(response({}, 'User already exists'));
    }
    
    const hashedPassword = await bcrypt.hashSync(password, HashSettings.SaltRounds);
    const data = {
        name,
        password: hashedPassword,
        email,
        mobile,
        username,
        image
    };

    const user = new User(data);
    await user.save();
    res.status(200).json(response(req.body, ''));
}

async function loginUser(req, res) {
    
    const { username, password } = req.body;
    const userFromDb = await User.findOne({username});

    if(!userFromDb) {
        return res.status(400).json(response({}, 'User not found'));
    }
    
    const passwordFromDb = userFromDb.password;
    const isValid = await bcrypt.compare(password, passwordFromDb);

    if(!isValid) {
        return res.status(400).json(response({}, 'Invalid Password'));
    }
       const tokenData = {
           id: userFromDb._id,
           username: userFromDb.username,
       };
       const token = jwtToken.sign(tokenData,
        jwt.jwt_sceret, { expiresIn: jwt.jwt_exp },
      );

      res.header('x-auth', token);
      userFromDb.password = null;
      return res.status(200).json(response(userFromDb, 'User successfully logged in'));
}

module.exports = {
    registerUser,
    loginUser,
    listOne
};
