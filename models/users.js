var mongoose = require('mongoose');

module.exports = mongoose.model('Users', {
    name: String,
    email: String,
    password: String,
});
