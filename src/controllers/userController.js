import user from '../models/userModel.js';

const UserController = {
  async getAllUsers(req, res) {
    try {
      const users = await user.findAll();

      if (!users || users.length === 0) {
        return res.status(404).json({ message: 'No users found' });
      }

      return res.status(200).json({ message: 'Users found', users });
    } catch (error) {
      return res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
  },
};

export default UserController;