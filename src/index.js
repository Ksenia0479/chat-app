const server = require("./app");

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`The server is running on ${PORT}`);
});
