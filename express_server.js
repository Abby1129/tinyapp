const express = require("express");
const morgan = require("morgan");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
const PORT = 8080;

app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"],
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userId: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userId: "aJ48lW" },
};

//const urlDatabase = {};

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

//a function that returns a string of 6 random alphanumeric characters:
function generateRandomString() {
  const tempArray = [];
  const randomString =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    tempArray.push(
      randomString[Math.floor(Math.random() * randomString.length)]
    );
  }
  return tempArray.join("");
}

//a function that returns a boolean value indicating whether the email is already in use in the database of users
function checkEmailExist(email, userDB) {
  for (const key in userDB) {
    if (userDB[key].email === email) {
      return true;
    }
  }
  return false;
}

// a function that returns a boolean value indicating whether the email and password match the user in the database of users or not
function checkEmailAndPasswordExist(email, password, userDb) {
  for (const key in userDb) {
    if (
      userDb[key].email === email &&
      bcrypt.compareSync(password, userDb[key].password)
    ) {
      return true;
    }
  }
  return false;
}

function getIDfromEmail(email, password, userDb) {
  for (const key in userDb) {
    if (
      userDb[key].email === email &&
      bcrypt.compareSync(password, userDb[key].password)
    ) {
      return key;
    }
  }
}
// a function that returns the urls object associated with the userId in the database of users if the userId is valid
function urlsForUser(id, urlDb) {
  const urls = {};
  for (const key in urlDb) {
    if (urlDb[key].userId === id) {
      urls[key] = urlDb[key];
    }
  }
  return urls;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const userId = req.session.user_id;
  const urls = urlsForUser(userId, urlDatabase);
  let templateVars = {
    urls: urls,
    user_id: userId,
    email: usersDatabase[userId]["email"],
  };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect("/login");
  } else {
    let templateVars = {
      user_id: userId,
      email: usersDatabase[userId]["email"],
    };
    return res.render("urls_new", templateVars);
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    email: req.body["email"],
    password: req.body["password"],
    user_id: req.session["user_id"],
  };
  res.render("urls_register", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]["longURL"],
    user_id: user_id,
    email: usersDatabase[user_id]["email"],
  };
  res.render("urls_show", templateVars);
});

// handles the link to the website. when short url is clicked, long url is triggered
app.get("/u/:id", (req, res) => {
  urlDatabase[req.params.id]
    ? res.redirect(urlDatabase[req.params.id]["longURL"])
    : res.send("Error: This is not a valid short URL");
});

app.get("/login", (req, res) => {
  const user = req.session["user_id"];
  res.render("urls_login", { user_id: user });
});

//updates or edit the long url for short url
app.post("/urls/:id", (req, res) => {
  const user = req.session["user_id"];
  if (!user) {
    res.redirect("/login");
  } else {
    urlDatabase[req.params.id]["longURL"] = req.body["longUrl"];
    return res.redirect("/urls");
  }
  console.log(urlDatabase);
});

// generates a new shortURL and adds it to the urlDatabase
app.post("/urls", (req, res) => {
  const user = req.session["user_id"];
  if (!user) {
    res.redirect("/login");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body["longURL"],
      userId: user,
    };
    return res.redirect(`/urls/${shortURL}`);
  }
});

//deletes url
app.post("/urls/:id/delete", (req, res) => {
  const user = req.session["user_id"];
  if (!user) {
    res.redirect("/login");
  } else {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];

  if (!checkEmailExist(email, usersDatabase)) {
    return res.status(403).send("email cannot be found, please register");
  }
  if (!checkEmailAndPasswordExist(email, password, usersDatabase)) {
    return res.status(403).send("password is incorrect");
  } else {
    req.session["user_id"] = getIDfromEmail(email, password, usersDatabase);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  //res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const userID = generateRandomString();

  const newUser = {
    id: userID,
    email: email,
    password: bcrypt.hashSync(password, saltRounds),
  };

  if (email === "" || password === "") {
    res.statusCode = 400;
    res.send("Empty Fields detected");
    return;
  }
  if (checkEmailExist(email, usersDatabase)) {
    res.statusCode = 400;
    res.send("Email Already Exists");
    return;
  } else {
    usersDatabase[userID] = newUser;
    return res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
