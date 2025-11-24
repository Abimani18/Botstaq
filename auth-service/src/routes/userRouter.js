const express = require('express');
const userController = require('../controller/userController');

const userRouter = express.Router();

userRouter.post('/register', userController.register);
userRouter.post('/login', userController.login);
userRouter.post('/forgot', userController.forgot);
userRouter.post('/reset', userController.reset);

module.exports = userRouter;
