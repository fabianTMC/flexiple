var chai = require("chai");
var chaiHttp = require("chai-http");

var server = require("../index.js");
var Users = require("../models/users");

chai.use(chaiHttp);
chai.should(); // Make chai use the should test methodology

describe('API tests', () => {
    var body, validBody, validLogin;

    before((done) => {
        validBody = {
            email: "abc@gmail.in",
            name: "flexiple_rahul_jain",
            password: "PAss@@",
            passwordRepeat: "PAss@@",
        };

        validLogin = {
            email: "abc@gmail.in",
            password: "PAss@@",
        }

        // Remove all the user so that we can run other tests
        Users.remove({
            email: validBody.email
        }, function (err) {
            if(err) {
                process.exit(1);
            } else {
                done();
            }
        });
    })

    describe('POST /users/signup', () => {
        beforeEach(() => {
            // Clone the valid body so we can test things independantly
            // Reference: http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/5344074#5344074
            body = JSON.parse(JSON.stringify(validBody));
        });

        it('should fail due to missing body', (done) => {
            chai.request(server)
            .post('/users/signup')
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

        describe('Email tests', () => {
            it('should fail due to invalid email address', (done) => {
                body.email = "abc@gmail@com";

                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to invalid email address (.in.com)', (done) => {
                body.email = "abc@gmail.in.com";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to invalid email address (com.in)', (done) => {
                body.email = "abc@gmail.com.in";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to invalid email address (abc@gmail.com)', (done) => {
                body.email = "abc@gmail.com";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to invalid email address (abc.gmail.in)', (done) => {
                body.email = "abc.gmail.in";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should succeed because the email address is valid (abc@gmail.in)', (done) => {
                chai.request(server)
                .post('/users/signup')
                .send(validBody)
                .end((err, res) => {
                    res.should.have.status(200);

                    // Remove all the user so that we can run other tests
                    Users.remove({
                        email: validBody.email
                    }, function (err) {
                        if(err) {
                            process.exit(1);
                        } else {
                            done();
                        }
                    });
                });
            });
        });

        describe('Password tests', () => {
            it('should fail due to both empty passwords', (done) => {
                body.password = "";
                body.passwordRepeat = "";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to empty repeated password', (done) => {
                body.password = "abc";
                body.passwordRepeat = "";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to empty main password', (done) => {
                body.password = "";
                body.passwordRepeat = "abc";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to passwords not matching', (done) => {
                body.password = "abc123";
                body.passwordRepeat = "abc";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to main password not available', (done) => {
                delete body.password;
                body.passwordRepeat = "abc";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to repeated password not available', (done) => {
                delete body.passwordRepeat;
                body.password = "abc";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to invalid password length', (done) => {
                body.password = "abc";
                body.passwordRepeat = "abc";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to invalid password length (too long)', (done) => {
                body.password = "Password@@";
                body.passwordRepeat = "Password@@";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to missing uppercase characters', (done) => {
                body.password = "Pass@@";
                body.passwordRepeat = "Pass@@";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to missing special characters', (done) => {
                body.password = "PAss12";
                body.passwordRepeat = "PAss12";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail due to missing uppercase character', (done) => {
                body.password = "Pass@@";
                body.passwordRepeat = "Pass@@";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should succeed as all constraints are met', (done) => {
                body.password = "PAss@@";
                body.passwordRepeat = "PAss@@";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(200);

                    // Remove all the user so that we can run other tests
                    Users.remove({
                        email: validBody.email
                    }, function (err) {
                        if(err) {
                            process.exit(1);
                        } else {
                            done();
                        }
                    });
                });
            });
        });

        describe('Name test', () => {
            it('should fail because the name field is missing', (done) => {
                delete body.name;
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail because the name field is missing the prefix', (done) => {
                body.name = "rahul_jain";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail because the name field contains a space without the prefix', (done) => {
                body.name = "rahul jain";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail because the name field contains a space with the prefix', (done) => {
                body.name = "flexiple_rahul jain";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail because the name field contains a special character', (done) => {
                body.name = "flexiple_rahul_jain$";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail because the name field contains an uppercase character', (done) => {
                body.name = "flexiple_Rahul_jain";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should fail because the name field contains an uppercase character', (done) => {
                body.name = "flexiple_Rahul_jain";
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
            });

            it('should succeed as the name is valid', (done) => {
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
            });

            it('should fail since the user is duplicate', (done) => {
                chai.request(server)
                .post('/users/signup')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
            });
        });
    });

    describe('POST /users/login', () => {
        beforeEach(() => {
            // Clone the valid body so we can test things independantly
            // Reference: http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/5344074#5344074
            body = JSON.parse(JSON.stringify(validLogin));
        });

        it('should fail due to missing body', (done) => {
            chai.request(server)
            .post('/users/login')
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

        it('should fail due to missing password', (done) => {
            delete body.password;
            chai.request(server)
            .post('/users/login')
            .send(body)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

        it('should fail due to missing email', (done) => {
            delete body.email;
            chai.request(server)
            .post('/users/login')
            .send(body)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

        it('should fail due to empty email', (done) => {
            body.email = "";
            chai.request(server)
            .post('/users/login')
            .send(body)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

        it('should fail due to empty password', (done) => {
            body.password = "";
            chai.request(server)
            .post('/users/login')
            .send(body)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

        it('should succeed due to valid credentials', (done) => {
            chai.request(server)
            .post('/users/login')
            .send(body)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
        });
    })
})
