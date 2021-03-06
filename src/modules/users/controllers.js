const User = require('./models');
const bcrypt = require('bcrypt');
const { HashSettings, jwt } = require('../../config');
const jwtToken = require('jsonwebtoken');
const { response } = require('./../../utils');

async function auth(req, res) {
  const { user, authenticated, permission } = req;
  if (req.user) {
    return res.status(200).send(response({ user, authenticated, permission }, '', true));
  }
  res.status(401).send(response({}, 'Unauthorized request', false));
}

async function userAvailability(req, res) {
  const { username } = req.body;
  const hasUser = await User.findOne({ username });
  
  if (hasUser) {
    return res.status(400).json(response({}, 'Username Taken', false));
  }
  res.status(200).send(response(req.user, 'Username available', true));
}

async function listOne(req, res) {
  res.status(200).send(response(req.user, '', true));
}

async function changePassword(req, res) {
  const { password } = req.body;
  const hashedPassword = await bcrypt.hashSync(password, HashSettings.SaltRounds).catch(e => {
    return res.status(400).json(response({}, e.message, false));
  });
  const updatedUser = await User.findOneAndUpdate({ _id: req.user.id }, { password: hashedPassword }, { new: true });
  res.status(200).send(response(updatedUser, 'Updated the password successfully', true));
}

async function update(req, res) {
  let user = {};
  const authUser = req.user;
  const { name, mobile, username, email } = req.body;
  const hasUser = await User.findOne({ $or: [{ username }, { email }] });
  
  if (hasUser) {
    return res.status(400).json(response({}, 'Username or email is already in use', false));
  }
  
  if (username) {
    user.username = username;
  }
  
  if (email) {
    user.email = email;
  }
  
  const updatedUser = await User.findOneAndUpdate({ _id: authUser.id }, { name, mobile, ...user }, { new: true });
  
  if (updatedUser) {
    updatedUser.password = null;
    return res.status(200).send(response(updatedUser, 'User Updated Successfully', true));
  }
  
  res.status(400).send(response({}, 'User update failed', false));
}

async function registerUser(req, res) {
  
  const { name, password, email, mobile, username, image } = req.body;
  const hasUser = await User.findOne({ email });
  
  if (hasUser) {
    return res.status(201).json(response({}, 'User already exists', false));
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
  res.status(200).json(response(req.body, '', true));
}

async function loginUser(req, res) {
  
  const { username, password } = req.body;
  const userFromDb = await User.findOne({ username });
  
  if (!userFromDb) {
    return res.status(400).json(response({}, 'User not found', false));
  }
  
  const passwordFromDb = userFromDb.password;
  const isValid = await bcrypt.compare(password, passwordFromDb).catch(e => {
    return res.status(400).json(response({}, e.message, false));
  });
  
  if (!isValid) {
    return res.status(400).json(response({}, 'Invalid Password', false));
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
  return res.status(200).json(response(userFromDb, 'User successfully logged in', true));
}

module.exports = {
  registerUser,
  loginUser,
  listOne,
  userAvailability,
  auth,
  update,
  changePassword
};
