const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //default port 8080
const bcrypt = require('bcrypt');

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
  return user.password === password;
}

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: 1000},
  "9sm5xK": {longURL: "http://www.google.com", userId: 2000}
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
console.log(users["userRandomID"]);
console.log(users.id);

const urlsForUser = function(id) {
  let urlsForUser = [];
    for (let shortUrl in urlDatabase) {
      if (urlDatabase[shortUrl].userId === id) {
        urlsForUser.push({
          ...urlDatabase[shortUrl],
          shortUrl: shortUrl
        });
      } 
    }
  return urlsForUser;
  };

app.get("/", (req, res) => {
  res.send("Hello!")
});

app.get("/urls", (req, res) => {
  let userId = req.cookies.userId;
   if (users[userId]) {
    let urls = urlsForUser(req.cookies.userId);
    let templateVars = { user: users[req.cookies.userId], urls: urls };
    res.render('urls_index', templateVars);
  } else {
    res.render('urls_login', { notification: 'You are not logged in.' })
  }
});

// Index of urls 
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: req.body.longURL, userId: req.cookies.userId};
  res.redirect(`/urls/${shortURL}`);     
});

// LOGIN PAGE
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies.userId] };
  res.render("urls_login", templateVars);
})

// POST request to login
app.post("/login", (req, res) => {
  let user = checkIfEmailAlreadyExists(req.body.email);
  let password = user.password;
  if (!user) {
    res.status(403);
    res.send("403 Forbidden - user with that email cannot be found");
  } else if (!bcrypt.compareSync(req.body.password, password)) {
    res.send("Password does not match the account. Please try again");
    res.status(403);
  } else {
   res.cookie('userId', user.id)
   res.redirect('/urls');
  }
});

// !checkIfPasswordMatches(user, req.body.password)

// POST request to logout
app.post("/logout", (req, res) => {
  res.clearCookie('userId', req.body.userId);
  res.redirect('/urls');
});

// Page that shows shortened URL 
app.get("/u/:shortURL", (req, res) => {
  // const longURL = urlDatabase[req.params.shortURL];
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Create New URL page
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies.userId] };
  if (req.cookies.userId) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// Register Page
app.get("/register", (req, res) => {
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
    users[userId] = { "id": userId, 
                      "email": req.body.email,
                      "password": bcrypt.hashSync(req.body.password, 10)
                     };
    res.cookie('userId', userId);
    res.redirect('/urls');
  }
});

// Page that shows shortened URL
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let userId = req.cookies.userId;
  console.log(userId, urlDatabase, shortURL, urlDatabase[shortURL]);
  if (userId === urlDatabase[shortURL].userId) {
    let templateVars = { user: users[req.cookies.userId], shortURL, longURL: urlDatabase[shortURL].longURL};
    res.render('urls_show', templateVars);
  } else if (users[userId]) {
    res.render('urls_index', { notification: 'This short url does not belong to you.', urls: [] })
   } else {
    res.render('urls_login', { notification: 'You are not logged in.' })
  }
});

// editing short url to long url
app.post("/urls/:shortURL", (req, res) => {
  let userId = req.cookies.userId;
  let shortURL = req.params.shortURL
  urlDatabase[shortURL].longURL = req.body.longURL;
  if (userId) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//deletes URL from My URL page
app.post("/urls/:shortURL/delete", (req, res) => { 
  let userId = req.cookies.userId;
  let shortURL = req.params.shortURL;
  if (userId) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});