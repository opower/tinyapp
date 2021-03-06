/**
 * @param email
 * @param database
 * @return a user object that contains id, email, and password if the email exists in the data and false if not
 */
const emailExist = (email, database) =>{
  let userList = Object.values(database);
  if (userList.length !== 0) {
    for (const user of userList) {
      let values = Object.values(user);
      if (values.includes(email)) {
        return user;
      }
    }
  }
  return false;
};

/**
 * @returns a random generated 6 character string
 */
const generateRandomString = () => {
  let string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let newStr = '';
  
  for (let i = 0; i < 6; i++) {
    let rand = Math.floor(Math.random() * 62);
    newStr += string[rand];
  }
  return newStr;
};

/**
 * @param id
 * @param database
 * @returns an urls object that contains the users urls
 */
const urlsForUser = (id, database) => {
  let urls = {};
  let entries = Object.entries(database);

  for (const url of entries) {
    if (url[1].userID === id) {
      let key = url[0]
      urls[key] = url[1];
    }
  }
  return urls;
};

//exporting helper functions as a module
module.exports = { emailExist, generateRandomString, urlsForUser};