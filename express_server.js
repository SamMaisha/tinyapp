const express = require("express"); // import express library
const cookieParser = require('cookie-parser'); // import cookie parser

const app = express(); // set up server using express
const PORT = 8080; // deault port 8080

// middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");


// DATA

// urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// users
const users = {
  "h67f5h": {
    id: "h67f5h",
    email: "jade@gmail.com",
    password: "123"
  },

  "3g6j0s": {
    id: "3g6j0s",
    email: "alex@gmail.com",
    password: "321"
  }
};

// helper functions
const generateRandomString = function() {
  return Math.random().toString(36).slice(2);
};

const getUserByEmail = function(email) {
  for (const userID in users) {
    if ( users[userID].email === email ) {
      return users[userID];
    }
  }
  return null;
};


////////////// ROUTES /////////////////////

// home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// route for registration page
app.get("/register", (req, res) => {
  res.render("register");
});

// POST route for registration
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (userEmail === "" || userPassword === "") {
    return res.status(400).send(`${res.statusCode} error. Please enter valid username and password`)
  }

  //check to see if user with email already exists
  const foundUser = getUserByEmail(userEmail);

  if (foundUser) { 
     return res.status(400).send(`${res.statusCode} error. User with email ${userEmail} already exists`);
  }

  // id user with email does not exist, add user to users object
  users[userID] = {
    id: userID,
    email: userEmail,
    password: userPassword
  };
  
  res.cookie('user_id', userID);
  res.redirect ("/urls");
});

// route for login page
app.get("/login", (req, res) => {
  res.render("login");
});

// POST route for login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

// POST route for logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');

  res.redirect("/urls");
});

// route with list of urls
app.get("/urls", (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// route to submit longURL to be shortened
app.get("/urls/new", (req, res) => {

  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  
  res.render("urls_new", templateVars);
});

// post route for client to submit new longURL to be shortened
app.post("/urls", (req, res) => {
  const longURLNew = req.body.longURL;
  const shortURLId = generateRandomString();
  urlDatabase[shortURLId] = longURLNew;

  res.redirect(`/urls/${shortURLId}`);
});

// route to provide information about a single url
app.get("/urls/:id", (req, res) => {
 
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_show", templateVars);
});

// post route to update text for a longURL
app.post("/urls/:id", (req, res) => {
  const shortURLID = req.params.id;
  const longURLUpdate = req.body.longURL;
  
  urlDatabase[shortURLID] = longURLUpdate;

  res.redirect("/urls");
});

// post route to remove a deleted URL
app.post("/urls/:id/delete", (req, res) => {
  const shortURLId = req.params.id;
  delete urlDatabase[shortURLId];

  res.redirect("/urls");
});

// route to redirect user to the longURL site
app.get("/u/:id", (req, res) => {
  const shortURLID = req.params.id;
  const longURL = urlDatabase[shortURLID];

  //edge case: client requests short URL with a non-existant id
  if (!longURL) {
    return res.status(404).send("Error: URL not found. Please enter valid id");
  }

  // redirect client to site
  res.redirect(longURL);
});



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

