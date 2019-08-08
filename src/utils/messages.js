const generateMessage = (username, text) => {
  return {
    username,
    message: text,
    createdAt: new Date().getTime()
  };
};

module.exports = generateMessage;
