const Task = require('../models/Task');
const Group = require('../models/Group');

exports.createTask = async (req, res) => {
  try {
    if (req.body.visibility === 'group' && req.body.group) {
      const group = await Group.findOne({ _id: req.body.group, members: req.body.owner });
      if (!group) {
        return res.status(403).json({ msg: 'You are not a member of this group' });
      }
    }
    const task = await Task.create(req.body);
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to create task' });
  }
};

exports.getUserTasks = async (req, res) => {
  const userId = req.params.userId;
  try {
    // Get groups user is in
    const groups = await Group.find({ members: userId }).select('_id');
    const groupIds = groups.map(g => g._id);

    // Fetch tasks
    const tasks = await Task.find({
      $or: [
        { owner: userId },
        { visibility: 'public' },
        { visibility: 'group', group: { $in: groupIds } }
      ]
    });

    res.json(tasks);
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
    res.status(500).json({ msg: 'Failed to fetch tasks' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update task' });
  }
};

exports.markTaskCompleted = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.taskId, { completed: true }, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to mark task completed' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ msg: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete task' });
  }
};
