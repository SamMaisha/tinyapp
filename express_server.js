const express = require("express"); // import express library
const cookieSession = require("cookie-session"); // import cookie session
const bcrypt = require("bcryptjs"); // import bycrypt to hash passwords
const { getUserByEmail, generateRandomString, getUrlsForUserID } = require('./helpers'); // import helper functions

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
/////////////////////////////////////////////////////////////////////////////////////////////////////

const app = express(); // set up server using express
const PORT = 8080; // deault port 8080

const cookieSessionConfig = cookieSession({
  name:'session',
  keys: ['secretKey1']
})

// configure view engine
app.set("view engine", "ejs"); 

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Middleware
/////////////////////////////////////////////////////////////////////////////////////////////////////

app.use(cookieSessionConfig);
app.use(express.urlencoded({ extended: true })); // parse request body

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Database
/////////////////////////////////////////////////////////////////////////////////////////////////////

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
    id: "h67f5h",
    email: "jade@gmail.com",
    password: "123"
  },

  "3g6j0s": {
    id: "3g6j0s",
    email: "alex@gmail.com",
    password: "321"
  },
};


/////////////////////////////////////////////////////////////////////////////////////////////////////
// Routes
/////////////////////////////////////////////////////////////////////////////////////////////////////

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
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID]
  };
  
   // check if user is logged in. If they are, redirect to /urls 
   if (userID) {
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
  const hashedPassword = bcrypt.hashSync(userPassword,10);
  const foundUser = getUserByEmail(userEmail, users);

  // if email or password fields are empty, send error message
  if (!userEmail || !userPassword) {
    return res.status(400).send(`${res.statusCode} error. Please enter valid email and password`)
  }

  // if email entered already exists in users object, send error message
  if (foundUser) { 
     return res.status(400).send(`${res.statusCode} error. User with email ${userEmail} already exists`);
  }

  // if user with email does not exist, add user to users object
  users[userID] = {
    id: userID,
    email: userEmail,
    password: hashedPassword
  };

  // set session cookie and redirect to /urls
  req.session.user_id = userID;
  res.redirect ("/urls");
});


/**
 * Login Page
 */

// GET route 
app.get("/login", (req, res) => {
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID]
  };
  
  // if user is logged in, redirect to /urls 
  if (userID ) {
    res.redirect("/urls");
  }

  // if user is not logged in, they can access login page
  res.render("login", templateVars);
});

// POST route 
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFound = getUserByEmail(userEmail, users);

  // if user's email does not exist in users object, send error message
  if (!userFound) {
    return res.status(403).send(`${res.statusCode} error. User with email ${userEmail} cannot be found.`)
  }

  // if user's password does not match password in users object, send error message
  if (!bcrypt.compareSync(userPassword,userFound.password)) {
    return res.status(403).send(`${res.statusCode} error. The password entered is incorrect.`)
  }

  // if email and password are correct, set session cookie and redirect to /urls page
  const userID = userFound.id;
  req.session.user_id = userID;
  res.redirect("/urls");
});


/**
 * Logout Process
 */

// POST route
app.post("/logout", (req, res) => {
  // clear user's cookie
  req.session = null;

  // redirect to login page
  res.redirect("/login");
});


/**
 * Page showing list of Urls
 */

// GET route
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const urlsUserCanAccess = getUrlsForUserID(userID, urlDatabase);

   // user cannot access /urls if not logged in
  if (!userID) {
    res.status(401).send(`${res.statusCode} error. Please login or register to access this resource`); 
  }

  // user can only see urls they created
  const templateVars = {
    urls: urlsUserCanAccess,
    user: users[userID]
  };

  res.render("urls_index", templateVars);
});


/**
 * Page to submit long URLs to be shortened
 */

// GET route
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id

  // if user is not logged in, redirect to /login
  if (!userID) {
    res.redirect("/login");
  }

  // if user is logged in, they can access /urls/new page
  const templateVars = {
    user: users[userID]
  };

  res.render("urls_new", templateVars);    
});

// POST route
app.post("/urls", (req, res) => {
  const longURLNew = req.body.longURL;
  const shortURLID = generateRandomString();
  const userID = req.session.user_id;

  // if user is not logged in, they cannot create shortURL
  if (!userID) {
    res.status(401).send(`${res.statusCode} error. Please login to submit URL`);
  } else {
  urlDatabase[shortURLID] = {
    longURL: longURLNew,
    userID
    }
  res.redirect(`/urls/${shortURLID}`);
  }
});


/** 
 * Additional Pages
 */

// GET route to provide information about a single url
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlsUserCanAccess = getUrlsForUserID(userID, urlDatabase);
  const shortURLID = req.params.id;

  // send error message if the shortUrlID does not exist
  if (!(shortURLID in urlDatabase)) {
    res.status(404).send(`${res.statusCode} error. The url you are trying to access does not exist`);
  }

  // if user is not logged in, they cannot access /urls/:id 
  if (!userID) {
    res.status(401).send(`${res.statusCode} error. Please login or register to access this resource`);
  } 

  // users can only access urls they created
  if (!(shortURLID in urlsUserCanAccess)) {
    res.status(403).send(`${res.statusCode} error. You are not authorized to access this resource`);
  } else {
    const templateVars = {
      id: shortURLID,
      longURL: urlsUserCanAccess[shortURLID].longURL,
      user: users[userID]
    };
    res.render("urls_show", templateVars);
  }
});

// POST route to update text for a longURL
app.post("/urls/:id", (req, res) => {
  const shortURLID = req.params.id;
  const longURLUpdate = req.body.longURL;
  const userID = req.session.user_id;
  const urlsUserCanAccess = getUrlsForUserID(userID, urlDatabase);

  // send error message if the shortUrlID does not exist
  if (!(shortURLID in urlDatabase)) {
    res.status(404).send(`${res.statusCode} error. The url you are trying to update does not exist`);
  }

  // send error message if the user is not logged in
  if (!userID) {
    res.status(401).send(`${res.statusCode} error. Please login or register to update this resource`);
  } 
  
  // user cannot update urls they did not create
  if (!(shortURLID in urlsUserCanAccess)) {
    res.status(403).send(`${res.statusCode} error. Insufficient permission to update this resource`)
  } else {
    urlDatabase[shortURLID] = {
      longURL: longURLUpdate,
      userID
    }
    res.redirect("/urls");
  } 
  
});

// POST route to remove a deleted URL
app.post("/urls/:id/delete", (req, res) => {
  const shortURLID = req.params.id;
  const userID = req.session.user_id;
  const urlsUserCanAccess = getUrlsForUserID(userID, urlDatabase);

  // send error message if the shortUrlID does not exist
  if (!(shortURLID in urlDatabase)) {
    res.status(404).send(`${res.statusCode} error.The url you are trying to delete does not exist`);
  }

  // send error message if the user is not logged in
  if (!userID) {
    res.status(401).send(`${res.statusCode} error. Please login or register to delete this resource`);
  } 
  
  // user cannot delete urls they did not create
  if (!(shortURLID in urlsUserCanAccess)) {
    res.status(403).send(`${res.statusCode} error. Insufficient permission to delete this resource`)
  } else {
    delete urlDatabase[shortURLID];

    res.redirect("/urls");
  }
});

// GET route to redirect user to the longURL site
app.get("/u/:id", (req, res) => {
  const shortURLID = req.params.id;

  // if user requests short URL with a non-existant id, send error message
  if (!(shortURLID in urlDatabase)) {
    res.status(404).send(`${res.statusCode} error URL not found. Please enter valid URL id`);
  } else {
    // redirect user to site
  const longURL = urlDatabase[shortURLID].longURL;
  res.redirect(longURL);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

