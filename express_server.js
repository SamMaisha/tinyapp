const express = require("express"); // import express library
const app = express(); // set up server using express
const PORT = 8080; // deault port 8080

// middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// functions
function generateRandomString() { 
  return Math.random().toString(36).slice(2);
}

// data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// route with list of urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// route to submit longURL to be shortened
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

// handle form input 
app.post("/urls", (req, res) => {
  const longURLToShorten = req.body.longURL;
  const shortURLId = generateRandomString(); 
  urlDatabase[shortURLId] = longURLToShorten;
  res.redirect(`/urls/${shortURLId}`);
})

// route to provide information about a single url
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
})

// route to redirect user to the longURL site
app.get("/u/:id", (req, res) => {
  const shortURLID = req.params.id; 
  const longURL = urlDatabase[shortURLID];

  //end case: client requests short URL with a non-existant id
  if (!shortURLID) {
    return res.status(404).send("Error: URL not found. Please enter valid id")
  }

  // redirect client to site
  res.redirect(longURL);
  
})



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

