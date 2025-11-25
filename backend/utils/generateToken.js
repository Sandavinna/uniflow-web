const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;





<<<<<<< HEAD
=======

>>>>>>> 1de8c248abde07605b154e729a8f2497ba6925e6
