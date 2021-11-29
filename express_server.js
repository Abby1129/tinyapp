const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

// handles the link to the website. when short url is clicked, long url is triggered
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL]
    ? res.redirect(urlDatabase[shortURL])
    : res.send("Error: This is not a valid short URL");
});

//updates or edit the long url for short url
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body["longUrl"];

  res.redirect("/urls");
});

// generates a new shortURL and adds it to the urlDatabase
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//deletes url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
