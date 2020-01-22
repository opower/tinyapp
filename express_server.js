const { emailExist } = require('./helper.js');
const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');


const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['this-is-confusing'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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
  let database = urlsForUser(req.session.user_id);
  let templateVars = {urls: database, user: users[req.session.user_id]};
  res.render('urls_index' , templateVars);
});

app.get('/urls/new', (req,res) => {
  if (!users[req.session.user_id]) {
    return res.redirect('/urls');
  }
  let templateVars = {user: users[req.session.user_id]};
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req,res)=>{

  if (!urlDatabase[req.params.shortURL]) {
    return res.render('errorPage', {url: 'urls', user: undefined, msg: 'Short URL Does Not Exisit', status: 404, page: 'URL\'s'});
  }

  let templateVars = {shortURL : req.params.shortURL, longURL : urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id]};
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
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req,res) =>{
  let param = req.params.shortURL;
  if (req.session.user_id) {
    let id = urlDatabase[param].userID;
    if (id && id === req.session.user_id) {
      delete urlDatabase[param];
    }
  }
  res.redirect('/urls');

});

app.post('/urls/:id', (req,res) =>{

  let param = req.params.id;
  if (req.session.user_id) {
    let userId = urlDatabase[param].userID;
    if (userId && userId === req.session.user_id) {
      urlDatabase[param] = {longURL: req.body.updateURL, userID: req.session.user_id};
    }
  }
  res.redirect('/urls');

});


app.post('/login', (req,res)=>{
  const { email, password } = req.body;
  let user = emailExist(email, users);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      return res.redirect('/urls');
    } else {
      let templateVars = { status: 403, msg: 'Incorrect Password', url: 'login',  page: 'Login', user: undefined};
      return res.render('errorPage', templateVars);
    }
  }
  res.render('errorPage', {status: 403, msg: 'Email Not Found!', user: undefined, url: 'register',  page: 'Register'});
});


app.post('/logout/:user', (req,res)=>{
  req.session = null;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (email.length === 0 || password.length === 0) {
    return res.send('Status Code: 400! You Entered An Invalid Email / Password');
  }
  if (emailExist(email, users)) {
    return res.send('Status Code: 400! This Email is Already An Account');
  }
  const randomId = generateRandomString();
  const hashed = bcrypt.hashSync(password, 10);
  users[randomId] = {
    id: randomId,
    email,
    password: hashed
  };
  req.session.user_id = randomId;
  res.redirect('/urls');
});



//Catch all
app.get('*', (req, res) =>{
  res.redirect('/urls');
});

app.listen(PORT, ()=>{
  console.log(`Listening on port ${PORT}`);
});


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

  for (const url of entries) {
    if (url[1].userID === id) {
      urls[url[0]] = url[1];
    }
  }
  return urls;
};

