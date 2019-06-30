const User = require('./models');
const bcrypt = require('bcrypt');
const {HashSettings, jwt} = require('../../config');
const jwtToken = require('jsonwebtoken');


async function registerUser(req, res) {

    const {name, password, email, mobile, username, image } = req.body

    const hashedPassword = await bcrypt.hashSync(password, HashSettings.SaltRounds);
    const data = {
        name,
        password: hashedPassword,
        email,
        mobile,
        username,
        image
    }

    const user = new User(data);
    await user.save();
    res.status(200).json(req.body);
}

async function loginUser(req, res) {
    const {username, password} = req.body;

    const userFromDb = await User.findOne({username});

    if(!userFromDb) {
        return res.status(400).json({ message: 'User Not Found'});
    }
    const passwordFromDb = userFromDb.password;

    const isValid = await bcrypt.compare(password, passwordFromDb);

    if(!isValid) {
        return res.status(400).json({ message: 'Invalid password'});
    }
       const tokenData = {
           id: userFromDb._id,
           username: userFromDb.username,
       };
       const token = jwtToken.sign(tokenData,
        jwt.jwt_sceret, { expiresIn: jwt.jwt_exp },
      );

      res.header('x-auth', token);
      return res.status(200).json({ message: 'Success'});
}

module.exports = {
    registerUser,
    loginUser
}
