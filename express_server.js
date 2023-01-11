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

// post route for new longURL to be shortened
app.post("/urls", (req, res) => {
  const longURLNew = req.body.longURL;
  const shortURLId = generateRandomString(); 
  urlDatabase[shortURLId] = longURLNew;
  res.redirect(`/urls/${shortURLId}`);
})

// route to provide information about a single url
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
})

// post route to update text for a longURL
app.post("/urls/:id", (req, res) => {
  const shortURLID = req.params.id;
  const longURLUpdate = req.body.longURL;
  
  urlDatabase[shortURLID] = longURLUpdate;

  res.redirect("/urls");
})

// post route to remove a deleted URL
app.post("/urls/:id/delete", (req, res) => {
  const shortURLId = req.params.id;
  delete urlDatabase[shortURLId];

  res.redirect("/urls");

})

// route to redirect user to the longURL site
app.get("/u/:id", (req, res) => {
  const shortURLID = req.params.id; 
  const longURL = urlDatabase[shortURLID];

  //edge case: client requests short URL with a non-existant id
  if (!longURL) {
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

