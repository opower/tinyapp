const emailExist = (email, database) =>{
  let userList = Object.values(database);

  if (userList.length !== 0) {
    for (const user of userList) {
      let values = Object.values(database);
      if (values.includes(email)) {
        return user;
      }
    }
  }
  return false;
};

module.exports = { emailExist };