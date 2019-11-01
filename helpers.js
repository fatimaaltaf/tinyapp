// HELPER FUNCTION

function getUserFromEmail(email, database) {
  for (let userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
} 

module.exports = { getUserFromEmail };