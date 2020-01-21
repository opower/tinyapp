const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

//GET
app.get('/', (req,res)=>{
  res.send('Hello!');
});

app.get('/urls', (req,res)=>{
  let templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render('urls_index' , templateVars);
});

app.get('/urls/new', (req,res) => {
  let templateVars = {username: req.cookies['username']};
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req,res)=>{

  if(!urlDatabase[req.params.shortURL]){
    return res.render('errorPage', {url: req.params.shortURL})
  }

  let templateVars = {shortURL : req.params.shortURL, longURL : urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get('/urls.json', (req,res) =>{
  res.json(urlDatabase);
});

app.get('/register', (req, res) =>{
  res.render('registration');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//POST
app.post('/urls', (req,res) =>{
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
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

app.post('/login', (req,res)=>{
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req,res)=>{
  res.clearCookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if(email.length === 0 || password.length === 0){
    return res.send('Status Code: 400! You Entered An Invalid Email / Password');
  }
  if(emailExist(email)){
    return res.send('Status Code: 400! This Email is Already An Account');
  }
  const randomId = generateRandomString();
  users[randomId] = {
    id: randomId,
    email,
    password
  }
  res.cookie('user_id', randomId);
  res.redirect('/urls')
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

  if(userList.length != 0){
    for(const i of userList){
      let values = Object.values(i);
      if(values.includes(email)){
        return true;
      }
    }
  }
  return false;
}

const generateRandomString = () => {

  let string = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let newStr = '';
  
  for (let i = 0; i < 6; i++) {
    let rand = Math.floor(Math.random() * 36);
    newStr += string[rand];
  }
  return newStr;
};