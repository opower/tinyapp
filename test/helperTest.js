const { assert } = require('chai');

const { emailExist, urlsForUser } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
const testDatabase = {
  'B6EHu7': {
    longUrl: 'http://youtube.com',
    userID: 'A4eg32'
  },
  '46dsa': {
    longUrl: 'http://google.ca',
    userID: 'd093JU'
  }
}

describe('emailExist', function() {
  it('should return a user with valid email', function() {
    const user = emailExist("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
  it('should return undefined if user email does not exist', function(){
    const user = emailExist('', testUsers);
    const expectedOutput = undefined;
    assert.equal(user.id, expectedOutput);
  });
});

describe('urlForUser', function() {
  it('should return one url object', function() {
    const url = urlsForUser("d093JU", testDatabase)
    const expectedOutput = {'46dsa': {
      longUrl: 'http://google.ca',
      userID: 'd093JU'
    }}
    assert.deepEqual(url, expectedOutput);
  });
  it('should return an empty object if userId does not exist', function() {
    const url = urlsForUser("d0u8dw", testDatabase)
    const expectedOutput = {};
    assert.deepEqual(url, expectedOutput);
  });
});