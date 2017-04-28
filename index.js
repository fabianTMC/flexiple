var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressValidator = require('express-validator');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/flexiple');

var passport = require("passport");
var Strategy = require('passport-local').Strategy;

var flash = require('connect-flash');
var Users = require("./models/users");

var app = express();
var port = process.env.PORT || 3000;

// Configure passport for local login
passport.use(new Strategy(
	{
		usernameField: "email"
	},
	function(email, password, done) {
		Users.find({ email: email, password: password }, (err, user) => {
			if(err) {
				return done(err, null, { message: 'An internal server error occurred.' });
			} else {
				if(user.length == 1) {
					return done(null, user[0]);
				} else {
					return done(null, false, { message: 'Invalid login credentials.' });
				}
			}
		});
	}
));

passport.serializeUser(function(user, cb) {
	cb(null, user);
});

passport.deserializeUser(function(user, cb) {
	cb(null, user);
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
}));
app.use(expressSession({
	secret: 'flexiple_secret_',
	resave: true,
	saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.set('view engine', 'pug');
app.set('views', './views')

app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.')
		, root    = namespace.shift()
		, formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg   : msg,
			value : value
		};
	},
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

function isLoggedIn(req, res, next) {
    if(req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

function isNotLoggedIn(req, res, next) {
    if(req.user === undefined) {
        next();
    } else {
        res.redirect('/profile');
    }
}

router.post('/login',
isNotLoggedIn,
passport.authenticate('local', {
	successRedirect: '/profile',
	failureRedirect: '/',
	failureFlash : true,
}),
function(req, res) {
	res.status(200).end();
}
);

router.post('/signup', isNotLoggedIn, function(req, res) {
	req.checkBody('email', 'Invalid email address').notEmpty().isEmail().isIndianEmail();

	req.checkBody('password', 'Missing password').notEmpty();
	req.checkBody('passwordRepeat', 'Missing repeated password').notEmpty();
	req.assert('password', 'Passwords do not match').equals(req.body.passwordRepeat);

	req.checkBody('password', 'Invalid password length').isLength({min: 4, max: 8});
	req.checkBody('password', 'Invalid password format').isValidPassword();

	req.checkBody('name', 'Invalid name').notEmpty().isValidName();

	req.getValidationResult().then(function(result) {
		if (!result.isEmpty()) {
			//res.status(400).json(result.array()).end();
			req.flash("error", result.array());
			res.redirect("/signup");
			return;
		} else {
			Users.find({ email: req.body.email, password: req.body.password }, (err, user) => {
				if(err) {
					req.flash("error", [{msg: "An internal server error occurred."}]);
					res.redirect("/signup");
					return;
				} else {
					if(user.length == 1) {
						req.flash("error", [{msg: "User already exists."}]);
						res.redirect("/signup");
						return;
					} else if(user.length == 0) {
						new Users({
							email: req.body.email,
							name: req.body.name,
							password: req.body.password,
						}).save((err) => {
							if(err) {
								req.flash("error", [{msg: "Internal server error."}]);
								res.redirect("/signup");
								return;
							} else {
								req.flash("success", [{msg: "User created successfully"}]);
								res.redirect("/");
								return;
							}
						});
					} else {
						req.flash("error", [{msg: "Duplicate users found."}]);
						res.redirect("/signup");
						return;
					}
				}
			});
		}
	});
});

app.use("/users", router);

app.get("/", isLoggedIn, function(req, res) {
	res.render('profile', {});
})

app.get('/profile', isLoggedIn, function (req, res) {
	res.render('profile', {})
});

app.get('/login', isNotLoggedIn, function (req, res) {
	res.render('index', { errors: req.flash('error')[0] })
});

app.get('/logout', function (req, res) {
	req.logout();
	res.redirect("/");
});

app.get('/signup', isNotLoggedIn, function (req, res) {
	var messages = req.flash("error");
	let errorMessage = "";
	messages.forEach((err) => {
		errorMessage += err.msg + " ";
	})

	var messages = req.flash("success");
	let successMessage = "";
	messages.forEach((err) => {
		successMessage += err.msg + " ";
	})
	res.render('signup', { errors: errorMessage, success: successMessage })
})

app.listen(port, function () {
	console.log('App listening on port ' + port);
});

module.exports = app;
