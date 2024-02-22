const pool = require("../db");
const Project = require("../model/Project.model");

class ProjectController {
  getId = async () => {
    try {
      const users = await Project.find()
      if (!users.length) {
        return null
      }
      return users[0].id
    } catch(e) {
        console.error(e.message)
    }
  }
  updateId = async (newId) => {
    try {
      const users = await Project.find()
      if (users.length) {
        return await Project.findByIdAndUpdate(users[0]._id, {id: newId})
      } else {
        return await Project({id: newId}).save()
      }
    } catch (err) {
      console.error('Error updating ID', err.message);
    }
  }
}

module.exports = new ProjectController()
