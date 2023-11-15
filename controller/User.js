const User = require('../model/User');
const helper = require('../Utils/helper');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
  let hsh_password = await helper.password_hash(req.body.password);
  delete req.body.password;
  req.body.password = hsh_password;
  let save = new User(req.body);
  try {
    let result = await save.save();
    res.send(result);
  } catch (e) {
    next(new Error(e));
  }
};

const login = async (req, res, next) => {
  const user = await User.findOne({ name: req.body.name });

  if (user) {
    const isValidPassword = await helper.compare_password(
      req.body.password,
      user.password
    );

    if (isValidPassword) {
      const userPlainObject = user.toObject();
      const token = jwt.sign(userPlainObject, process.env.Private_Key, '');
      userPlainObject.token = token;
      await helper.redis_set(userPlainObject._id, userPlainObject);

      res.status(200).json({
        status: 'success',
        user: userPlainObject,
      });
    } else {
      res.status(401).json({
        status: 'fail',
        message: 'Password Incorrect',
      });

      next(new Error('Password Incorrect'));
    }
  } else {
    res.status(401).json({
      status: 'fail',
      message: 'Name Doesnt Exist',
    });

    next(new Error('Name Doesnt Exist'));
  }
};

const active = async (req, res, next) => {
  try {
    const activeUsers = await User.find({
      isActive: true,
      _id: { $ne: req.query.id },
    });
    res.status(200).json(activeUsers);
  } catch (error) {
    console.log(`file: User.js:57 ~ active ~ error:`, error);
  }
};

const all_user = async (req, res, next) => {
  console.log(req.query);
  let result = await User.find({ _id: { $ne: req.query.id } });
  res.cookie('Hello', 'Hi');
  res.send(result);
};

const edit = async (req, res, next) => {
  let current_user = await User.findById(req.params.id);

  if (current_user) {
    await User.findByIdAndUpdate(current_user._id, req.body);
    let result = await User.findById(current_user._id);
    res.send(result);
  } else {
    next(new Error('Id is incorrect'));
  }
};

const userByID = async (req, res, next) => {
  const result = await User.findById(req.params.id);
  res.send(result);
};

module.exports = { register, login, active, all_user, edit, userByID };
