const Group = require('../models/Group');
const User = require('../models/User');

exports.createGroup = async (req, res) => {
  try {
    const { name, ownerId } = req.body;

    if (!name || !ownerId) {
      return res.status(400).json({ msg: 'Name and ownerId are required' });
    }

    const group = await Group.create({
      name,
      owner: ownerId,
      members: [ownerId]
    });

    await User.findByIdAndUpdate(ownerId, {
      $push: { groups: group._id }
    });

    res.status(201).json(group);
  } catch (err) {
    console.error('Error creating group:', err); 
    res.status(500).json({ msg: 'Failed to create group', error: err.message });
  }
};

exports.inviteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const { groupId } = req.params;

    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const userId = user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ msg: 'User already in group' });
    }

    await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { groups: groupId } }
    );

    res.json({ success: true, msg: 'User invited successfully' });
  } catch (err) {
    console.error('Invite error:', err);
    res.status(500).json({ msg: 'Invite failed', error: err.message });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const { userId, requesterId } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    // Only allow owner to remove others
    if (group.owner.toString() !== requesterId) {
      return res.status(403).json({ msg: 'Only the group owner can remove members' });
    }

    // Prevent owner from removing themselves
    if (userId === requesterId) {
      return res.status(400).json({ msg: 'Owner cannot remove themselves' });
    }

    group.members.pull(userId);
    await group.save();

    await User.findByIdAndUpdate(userId, { $pull: { groups: group._id } });

    res.json({ msg: 'User removed from group' });
  } catch (err) {
    console.error('Error removing user:', err);
    res.status(500).json({ msg: 'Failed to remove user' });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.params.userId }).populate('members', 'name email');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch groups' });
  }
};

exports.leaveGroup = async (req, res) => {
  const { groupId, userId } = req.body;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    // Remove the user from the group's members array
    group.members.pull(userId);

    // Check if the user is the owner
    const isOwnerLeaving = group.owner.toString() === userId;

    // If no members remain delete the group
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      await User.findByIdAndUpdate(userId, { $pull: { groups: groupId } });
      return res.json({ msg: 'User left group and group was deleted (no members left)' });
    }

    // If the owner is leaving assign a new owner
    if (isOwnerLeaving) {
      group.owner = group.members[0]; // Assign the first remaining member as the new owner
    }

    await group.save();

    // Remove group from user’s list
    await User.findByIdAndUpdate(userId, { $pull: { groups: groupId } });

    let msg = 'User left group';
    if (isOwnerLeaving) msg += '. Ownership transferred to another member.';

    res.json({ msg });
  } catch (err) {
    console.error('Error in leaveGroup:', err);
    res.status(500).json({ msg: 'Failed to leave group' });
  }
};
