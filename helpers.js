const bcrypt = require("bcrypt");

const usersDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const getUserByEmail = function (email, database) {
  for (let user in database) {
    console.log(database[user].email);
    if (database[user].email === email) {
      return database[user];
    }
  }
};

const checkEmailAndPasswordExist = function (email, password, userDb) {
  for (const key in userDb) {
    if (
      userDb[key].email === email &&
      bcrypt.compareSync(password, userDb[key].password)
    ) {
      return true;
    }
  }
  return false;
};

const getIDfromEmail = function (email, password, userDb) {
  for (const key in userDb) {
    if (
      userDb[key].email === email &&
      bcrypt.compareSync(password, userDb[key].password)
    ) {
      return key;
    }
  }
};
// a function that returns the urls object associated with the userId in the database of users if the userId is valid
const urlsForUser = function (id, urlDb) {
  const urls = {};
  for (const key in urlDb) {
    if (urlDb[key].userId === id) {
      urls[key] = urlDb[key];
    }
  }
  return urls;
};

const generateRandomString = function () {
  const tempArray = [];
  const randomString =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    tempArray.push(
      randomString[Math.floor(Math.random() * randomString.length)]
    );
  }
  return tempArray.join("");
};

module.exports = {
  getUserByEmail,
  checkEmailAndPasswordExist,
  getIDfromEmail,
  urlsForUser,
  generateRandomString,
};
