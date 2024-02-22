const pool = require("../db");
const User = require("../model/User.model");

class UserController {
  create = async (body) => {
    try {
      const user = new User(body);
      await user.save()
      return user
    } catch(e) {
        console.error(e.message)
    }
  }
  getReadyUsers = async () => {
    try {
      return await User.find({going: true})
    } catch (err) {
      console.error('Ошибка при получении пользователей', err.message);
    }
  }
  getOne = async (id) => {
    try {
      return await User.findOne({ id: id })
    } catch (err) {
      console.error('Error fetching user:', err);
      throw err;
    }
  }
  updateUser = async (data, id) => {
    try {
      const user = await User.findOneAndUpdate(
        { id: id },
        {
          $set: data
        },
        {new: true}
      )
      if (!user.categories.length) {
        return await User.findOneAndUpdate(
          { id: id },
          {
            $set: {going: false}
          },
          {new: true}
        )
      }
      return user
    } catch (err) {
      console.error('Error updating user:', err);
    }
  }
  deleteUser = async (id) => {
    try {
      return await User.deleteOne({id: id})
    } catch (err) {
      console.error('Error deleting user', err.message);
    }
  }
}

module.exports = new UserController()
