const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");
app.use(cookieParser());

function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Users database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!")
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies.username, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);     
});

// POST request to login
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username); 
  res.redirect('/urls');
});

// POST request to logout
app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect('/urls');
});

// Page that shows shortened URL 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Create New URL page
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
});

// Register Page
app.get("/urls/register", (req, res) => {
  let templateVars = { username: req.cookies.username };
  res.render("urls_register", templateVars);
});

// Register page submission 
app.post("/urls/register", (req, res) => {
  // new user object added to global users object. Should include id, email, password 
  // generate random user id
  let userId = generateString();
  let users[userId] = {id: userId, email: req.body.email, password: req.body.password };
  // set user_Id to cookie
  res.cookie();
  res.redirect('/urls');
});

// Page that shows shortened URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies.username, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

// Updating short url to long url
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls");
});

//deletes URL from My URL page
app.post("/urls/:shortURL/delete", (req, res) => { 
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});