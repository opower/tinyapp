const { emailExist, generateRandomString, urlsForUser } = require('./helper.js');
const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');

app.set('view engine', 'ejs');

//Middleware
app.use(cookieSession({
  name: 'session',
  keys: ['this-is-confusing'],
}));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));

//Test Data
const urlDatabase = {
};
const users = {

};

//GET
app.get('/', (req,res)=>{
  res.redirect('/login');
});

app.get('/urls', (req,res)=>{
  let database = urlsForUser(req.session.user_id, urlDatabase);
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

  let templateVars = {shortURL : req.params.shortURL, longURL : urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id], date: urlDatabase[req.params.shortURL].date};
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL]){
    res.render('errorPage', {status:403, msg:'Short URL does not exist', page: 'Your URLS', user: undefined, url:'urls'});
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get('/register', (req, res) =>{
  res.render('registration', {user: undefined});
});

app.get('/login', (req,res) => {
  res.render('login', {user: undefined});
});


//POST
app.post('/urls', (req,res) =>{
  let shortURL = generateRandomString();
  let date = new Date().toLocaleString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id, date: date};
  res.redirect(`/urls/${shortURL}`);
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
  if (emailExist(email, users)) {
    return res.render('errorPage', {status: 400, msg: 'Email Is Already An Account', user: undefined, page: 'Login', url: 'login'});
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

//Delete
app.delete('/urls/:shortURL/delete', (req,res) =>{
  let param = req.params.shortURL;
  if (req.session.user_id) {
    let id = urlDatabase[param].userID;
    if (id && id === req.session.user_id) {
      delete urlDatabase[param];
    }
  }
  res.redirect('/urls');
});

//Put
app.put('/urls/:id', (req,res) =>{
  let param = req.params.id;
  if (req.session.user_id) {
    let userId = urlDatabase[param].userID;
    if (userId && userId === req.session.user_id) {
      let date = new Date().toLocaleString();
      urlDatabase[param] = {longURL: req.body.updateURL, userID: req.session.user_id, date: date};
    }
    else{
      return res.render('errorPage', {status: 401, msg:'You Do Not Have Access To Modify This URL', user: users[req.session.user_id] , page: 'URL\'s', url: 'urls' })
    }
  }
  res.redirect('/urls');
});

//Catch all
app.get('*', (req, res) =>{
  res.redirect('/urls');
});

app.listen(PORT, ()=>{
  console.log(`Listening on port ${PORT}`);
});


