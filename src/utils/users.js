const users = [];

const addUser = ({ id, username, room }) => {
  // to clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the username and room on an empty
  if (!username || !room) {
    return {
      error: "Username and room must be provided!"
    };
  }

  // Validate if user already exists in the room
  const isExistingUser = users.find(user => {
    return user.username === username && user.room === room;
  });

  if (isExistingUser) {
    return {
      error: "The username is already in use. Please choose another username!"
    };
  }

  // To store the user to the storage
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
