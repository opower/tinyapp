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

const generateRandomString = () => {

  let string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let newStr = '';
  
  for (let i = 0; i < 6; i++) {
    let rand = Math.floor(Math.random() * 62);
    newStr += string[rand];
  }
  return newStr;
};

const urlsForUser = (id, database) => {

  let urls = {};
  let entries = Object.entries(database);

  for (const url of entries) {
    if (url[1].userID === id) {
      urls[url[0]] = url[1];
    }
  }
  return urls;
};

module.exports = { emailExist, generateRandomString, urlsForUser };