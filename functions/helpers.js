// function to return a user object when an email exists in the database; else provide null
const getUserByEmail = function(email, database) {
  for (const userID in database) {
    if ( database[userID].email === email ) {
      return database[userID];
    }
  }
  return null;
};

// function to return urls that a user has access to as an object
const getUrlsForUserID = function(userID, database) {
  const urlObj = {}; // empty object to take in list of short url IDs and longURLs

  for (const urlID in database) {
    if (database[urlID].userID === userID) {
      urlObj[urlID] = {
        longURL: database[urlID].longURL,
      }
    } 
  } 
  return urlObj; 
}


// function to generate an identifier
const generateRandomString = function() {
  return Math.random().toString(36).slice(2);
};



module.exports = { getUserByEmail, generateRandomString, getUrlsForUserID }