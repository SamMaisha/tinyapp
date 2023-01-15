const express = require("express"); // import express library
const cookieParser = require('cookie-parser'); // import cookie parser

const app = express(); // set up server using express
const PORT = 8080; // deault port 8080

// middleware
app.use(cookieParser()); // parse cookie data
app.use(express.urlencoded({ extended: true })); // parse request body

app.set("view engine", "ejs"); 


// DATA
// urls
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "h67f5h"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "h67f5h"
  }, 
};

// users
const users = {
  "h67f5h": {
    id: h67f5h,
    email: "jade@gmail.com",
    password: "123"
  },

  "3g6j0s": {
    id: "3g6j0s",
    email: "alex@gmail.com",
    password: "321"
  },
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


////////////////////////////////////////////////////////// 
                   //ROUTES// 
/////////////////////////////////////////////////////////

/**
 * home page
 */

app.get("/", (req, res) => {
  res.redirect("/urls");
});


/**
 * Registration Page
 */

// GET route 
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  
   // check if user is logged in. If they are, redirect to /urls 
   if (req.cookies["user_id"]) {
    res.redirect("/urls");
  }

  // if user is not logged in, they can access registration page
  res.render("register", templateVars);
});

// POST route 
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    return res.status(400).send(`${res.statusCode} error. Please enter valid email and password`)
  }

  //check to see if user with email already exists
  const foundUser = getUserByEmail(userEmail);

  if (foundUser) { 
     return res.status(400).send(`${res.statusCode} error. User with email ${userEmail} already exists`);
  }

  // if user with email does not exist, add user to users object
  users[userID] = {
    id: userID,
    email: userEmail,
    password: userPassword
  };
  
  res.cookie('user_id', userID);
  res.redirect ("/urls");
});


/**
 * Login Page
 */

// GET route 
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  
  // check if user is logged in. If they are, redirect to /urls 
  if (req.cookies["user_id"] ) {
    res.redirect("/urls");
  }

  // if user is not logged in, they can access login page
  res.render("login", templateVars);
});

// POST route 
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFound = getUserByEmail(userEmail);

  // if user's email does not exist in users object, send 403 status code
  if (!userFound) {
    return res.status(403).send(`${res.statusCode} error. User with email ${userEmail} cannot be found.`)
  }

  // if user's password does not match password in users object, send 403 status code
  if (userPassword !== userFound.password) {
    return res.status(403).send(`${res.statusCode} error. The password entered is incorrect.`)
  }

  const userID = userFound.id
  res.cookie('user_id', userID);
  res.redirect("/urls");
});


/**
 * Logout Process
 */

// POST route
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');

  res.redirect("/login");
});


/**
 * Page showing list of Urls
 */

// GET route
app.get("/urls", (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});


/**
 * Page to submit long URLs to be shortened
 */

// GET route
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  // if user is not logged in, redirect to /login
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  // if user is logged in, they can access /urls/new page
  res.render("urls_new", templateVars);
});

// POST route
app.post("/urls", (req, res) => {

  // if user is not logged in, they cannot create shortURL
  if (!req.cookies["user_id"]) {
    res.status(401).send(`${res.statusCode} error. Please login to submit URL`);
  } else {
  const longURLNew = req.body.longURL;
  const shortURLId = generateRandomString();
  urlDatabase[shortURLId] = longURLNew;

  res.redirect(`/urls/${shortURLId}`);
  }
  console.log(urlDatabase);  
});


/** 
 * Additional Pages
 */

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET route to provide information about a single url
app.get("/urls/:id", (req, res) => {
 
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_show", templateVars);
});

// POST route to update text for a longURL
app.post("/urls/:id", (req, res) => {
  const shortURLID = req.params.id;
  const longURLUpdate = req.body.longURL;
  
  urlDatabase[shortURLID] = longURLUpdate;

  res.redirect("/urls");
});

// POST route to remove a deleted URL
app.post("/urls/:id/delete", (req, res) => {
  const shortURLId = req.params.id;
  delete urlDatabase[shortURLId];

  res.redirect("/urls");
});

// GET route to redirect user to the longURL site
app.get("/u/:id", (req, res) => {
  const shortURLID = req.params.id;
  const longURL = urlDatabase[shortURLID];

  //user requests short URL with a non-existant id
  if (!longURL) {
    return res.status(404).send(`${res.statusCode} error URL not found. Please enter valid URL id`);
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

