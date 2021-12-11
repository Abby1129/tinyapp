const bcrypt = require("bcrypt");

//function that returns a user object when its provided with an email that exists in the database
const getUserByEmail = function (email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};

//function checks if email and corresponding bcrypted password is in the database object, and returns true or false if it is or not
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

//function checks if email and bcrypted password match what is in the database object, and returns the key
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

//function that returns the urls object associated with the userId in the database of users if the userId is valid
const urlsForUser = function (id, urlDb) {
  const urls = {};
  for (const key in urlDb) {
    if (urlDb[key]["userId"] === id) {
      urls[key] = urlDb[key];
    }
  }
  return urls;
};

//function that generates a random string of length 6 and returns it as a shortURL
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

//check if object is empty
const isEmpty = (obj) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
};

module.exports = {
  getUserByEmail,
  checkEmailAndPasswordExist,
  getIDfromEmail,
  urlsForUser,
  generateRandomString,
  isEmpty,
};
