const express = require("express");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");

const {
  getUserByEmail,
  generateRandomString,
  checkEmailAndPasswordExist,
  getIDfromEmail,
  urlsForUser,
  isEmpty,
} = require("./helpers.js");

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

//////////////////////////////////////
//////////////GET ROUTES//////////////
//////////////////////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

// returns the index page, empty for new users and populated with urls for existing users
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

// returns the form to create a new URL
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

// returns the form to create a new user
app.get("/register", (req, res) => {
  const templateVars = {
    email: req.body["email"],
    password: req.body["password"],
    user_id: req.session["user_id"],
  };
  res.render("urls_register", templateVars);
});

// shows the page for a specific short URL and its long URL
app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;

  if (user_id) {
    if (isEmpty(urlsForUser(user_id, urlDatabase))) {
      res.send("Error: Url does not belong to User");
      return;
    }
    const templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id]["longURL"],
      user_id: user_id,
      email: usersDatabase[user_id]["email"],
    };
    res.render("urls_show", templateVars);
    return;
  }
  res.send("Error: You are Not Logged in");
});

// redirects to the website for the short URL if valid
app.get("/u/:id", (req, res) => {
  urlDatabase[req.params.id]
    ? res.redirect(urlDatabase[req.params.id]["longURL"])
    : res.send("Error: This is not a valid short URL");
});

// returns the form to login
app.get("/login", (req, res) => {
  const user = req.session["user_id"];
  res.render("urls_login", { user_id: user });
});

//////////////////////////////////////
//////////////POST ROUTES//////////////
//////////////////////////////////////

//updates or edit the long url for short url
app.post("/urls/:id", (req, res) => {
  const user = req.session["user_id"];
  if (!user) {
    res.redirect("/login");
  } else {
    urlDatabase[req.params.id]["longURL"] = req.body["longURL"];
    return res.redirect("/urls");
  }
});

//deletes url from urlDatabase and redirects to the urls page
app.post("/urls/:id/delete", (req, res) => {
  const user = req.session["user_id"];
  if (!user) {
    res.redirect("/login");
  } else {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  }
});

// generates a new shortURL and adds it to the urlDatabase if the user is logged in, if not, redirects to the login page
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

// creates a new user and adds it to the usersDatabase and sets the cookie session to the user's id and redirects to the urls page if successful or redirects to the register page if unsuccessful
app.post("/login", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];

  if (!getUserByEmail(email, usersDatabase)) {
    return res.status(403).send("email cannot be found, please register");
  }
  if (!checkEmailAndPasswordExist(email, password, usersDatabase)) {
    return res.status(403).send("password is incorrect");
  } else {
    req.session["user_id"] = getIDfromEmail(email, password, usersDatabase);
    res.redirect("/urls");
  }
});

// creates a new user and adds it to the usersDatabase and redirects to the login page if successful or returns an error if unsuccessful
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
  if (getUserByEmail(email, usersDatabase)) {
    res.statusCode = 400;
    res.send("Email Already Exists");
    return;
  } else {
    usersDatabase[userID] = newUser;
    req.session["user_id"] = userID;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
