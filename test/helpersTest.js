const { assert } = require('chai');

const { getUserFromEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserFromEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput, "true");
  });

  it('should return undefined when using invalid email', function() {
    const user = getUserFromEmail("user205@gmail.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput, "undefined");
  });
});