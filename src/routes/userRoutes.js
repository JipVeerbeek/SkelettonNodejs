import express from 'express';
import UserController from '../controllers/userController.js'; // Ensure proper casing for UserController

const userRouter = express.Router();

// Route to get all users
userRouter.get('/users', UserController.getAllUsers);

export default userRouter;
