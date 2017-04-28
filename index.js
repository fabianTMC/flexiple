var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

var app = express();
var port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false,
}));
app.use(expressValidator({
	customValidators: {
		isIndianEmail: (email) => {
			if(email) {
				let index = email.indexOf("@");
				if(index !== -1) {
					let domain = email.substr(index + 1);
					let dotIndex = domain.indexOf(".");
					if(index !== -1) {
						return domain.substr(dotIndex + 1) === "in";
					}
				}
			}

			return false;
		},
		isValidPassword: (password) => {
			if(password) {
				var numUpper = password.length - password.replace(/[A-Z]/g, '').length;
				var numSpecial = password.replace(/[a-zA-Z0-9]/g, '').length;
				return numUpper === 2 && numSpecial === 2;
			}

			return false;
		},
		isValidName: (name) => {
			if(name) {
				return name.replace(/^flexiple_[a-z_]+$/g, '').length === 0;
			}

			return false;
		},
	}
}));


let router = express.Router();

router.post('/login', function(req, res) {
    res.send('Login!');
});

router.post('/signup', function(req, res) {
    req.checkBody('email', 'Invalid email address').notEmpty().isEmail().isIndianEmail();

	req.checkBody('password', 'Missing  password').notEmpty();
	req.checkBody('passwordRepeat', 'Missing repeated password').notEmpty();
	req.assert('password', 'Passwords do not match').equals(req.body.passwordRepeat);

	req.checkBody('password', 'Invalid password length').isLength({min: 4, max: 8});
	req.checkBody('password', 'Invalid password format').isValidPassword();

	req.checkBody('name', 'Invalid name').notEmpty().isValidName();

	req.getValidationResult().then(function(result) {
	    if (!result.isEmpty()) {
	      res.status(400).json(result.array()).end();
	      return;
	    } else {
	    	res.status(200).json({message: "Successfully registered"}).end();
	    	return;
	    }
	});
})

app.use("/users", router);

app.listen(port, function () {
    console.log('App listening on port ' + port);
});

module.exports = app;
