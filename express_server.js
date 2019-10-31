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

function checkIfEmailAlreadyExists(email) {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id]; //  users[id]
    }
  }
  return false; 
}

function checkIfPasswordMatches(user, password) {
  console.log(password);
  console.log(user.password);
  return user.password === password;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Users database
let users = { 
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
console.log(users.id);


app.get("/", (req, res) => {
  res.send("Hello!")
});

app.get("/urls", (req, res) => {
  let templateVars = { user: users[req.cookies.userId], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Index of urls 
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  // urlDatabase[shortURL] = longURL 
  urlDatabase[shortURL] = { longURL: req.body.longURL, userId: req.cookies.userId};
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);     
});

// LOGIN PAGE
app.get("/urls/login", (req, res) => {
  let templateVars = { user: users[req.cookies.userId] };
  res.render("urls_login", templateVars);
})

// POST request to login
app.post("/login", (req, res) => {
  let user = checkIfEmailAlreadyExists(req.body.email);
  if (!user) {
    res.status(403);
    res.send("403 Forbidden - user with that email cannot be found");
  } else if (!checkIfPasswordMatches(user, req.body.password)) {
    res.send("Password does not match the account. Please try again");
    res.status(403);
  } else {
   res.cookie('userId', user.id)
   res.redirect('/urls');
  }
});

// POST request to logout
app.post("/logout", (req, res) => {
  res.clearCookie('userId', req.body.userId);
  res.redirect('/urls');
});

// Page that shows shortened URL 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Create New URL page
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies.userId] };
  if (req.cookies.userId) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/urls/login');
  }
});

// Register Page
app.get("/urls/register", (req, res) => {
  let templateVars = { user: users[req.cookies.userId] };
  res.render("urls_register", templateVars);
});

// POSTs to register 
app.post("/register", (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send("400 Error - Bad Request: No email or password entered. Try again");
  } else if (checkIfEmailAlreadyExists(req.body.email)) {
    res.status(400);
    res.send("This email already exists. Please use another email address");
  } else {
    let userId = generateRandomString();
    users[userId] = {id: userId, email: req.body.email, password: req.body.password };
    res.cookie('userId', userId);
    res.redirect('/urls');
  }
});

// Page that shows shortened URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user: users[req.cookies.userId], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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