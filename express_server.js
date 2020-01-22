const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "adsawd" }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: 'olivia@hotmail.com',
    password: 'password'
  }
};

//GET
app.get('/', (req,res)=>{
  res.send('Hello!');
});

app.get('/urls', (req,res)=>{
  let database = urlsForUser(req.cookies['user_id']);
  let templateVars = {urls: database, user: users[req.cookies["user_id"]]};
  res.render('urls_index' , templateVars);
});

app.get('/urls/new', (req,res) => {
  if(!users[req.cookies['user_id']]){
    return res.redirect('/urls')
  }
  let templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req,res)=>{

  if (!urlDatabase[req.params.shortURL]) {
    return res.render('errorPage', {url: req.params.shortURL});
  }

  let templateVars = {shortURL : req.params.shortURL, longURL : urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]]};
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get('/urls.json', (req,res) =>{
  res.json(urlDatabase);
});

app.get('/register', (req, res) =>{
  res.render('registration', {user: undefined});
});

app.get('/login', (req,res) => {
  res.render('login', {user: undefined});
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//POST
app.post('/urls', (req,res) =>{
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies['user_id']}
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req,res) =>{
  let param = req.params.shortURL;
  delete urlDatabase[param];
  res.redirect('/urls');
});

app.post('/urls/:id', (req,res) =>{

  let param = req.params.id;
  urlDatabase[param] = req.body.updateURL;
  res.redirect('/urls');

});

// Update the edit and delete endpoints such that only the owner (creator) of the URL can edit or delete the link. Use a testing utility like cURL to confirm that if a user is not logged in, they cannot edit or delete urls.

app.post('/login/:email', (req,res)=>{
  const { email, password } = req.body;
  let user = emailExist(email);
  if (user) {
    if (password === user.password) {
      res.cookie('user_id', user.id);
      return res.redirect('/urls');
    } else {
      return res.send('Status Code: 403! Password Incorrect!');
    }
  }
  res.send('Status Code: 403! Email Not Found!');
});

app.post('/logout/:user', (req,res)=>{
  res.clearCookie('user_id', req.params.user.id);
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (email.length === 0 || password.length === 0) {
    return res.send('Status Code: 400! You Entered An Invalid Email / Password');
  }
  if (emailExist(email)) {
    return res.send('Status Code: 400! This Email is Already An Account');
  }
  const randomId = generateRandomString();
  users[randomId] = {
    id: randomId,
    email,
    password
  };
  res.cookie('user_id', randomId);
  res.redirect('/urls');
});


//Catch all
app.get('*', (req, res) =>{
  res.redirect('/urls');
});

app.listen(PORT, ()=>{
  console.log(`Listening on port ${PORT}`);
});

const emailExist = (email) =>{
  let userList = Object.values(users);

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

  let string = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let newStr = '';
  
  for (let i = 0; i < 6; i++) {
    let rand = Math.floor(Math.random() * 36);
    newStr += string[rand];
  }
  return newStr;
};


const urlsForUser = (id) => {

  let urls = {}; 
  let entries = Object.entries(urlDatabase);

  for(const url of entries){
    if(url[1].userID === id){
      urls[url[0]] = url[1];
    }
  }
  return urls;
}

