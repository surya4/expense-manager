var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GithubStrategy = require('passport-github').Strategy;
var bcrypt = require('bcrypt-nodejs');

var models = require('../models');

// Serialize sessions
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    models.userTables.findById(id).then(function(user) {
        if (user) {
            done(null, user.get());
        } else {
            done(user.errors, null);
        }
    });

});

// Sign In with Email and Password
passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    function(email, password, done) {
        console.log("Data from email and password login in passport " + email + " " + password);
        models.userTables.findOne({
                where: {
                    email: email
                }
            })
            .then(function(user) {
                console.log("Data from user login in passport" + user);
                if (!user) {
                    return done(null, false, {
                        msg: 'The email address ' + email +
                            'is not associated with any account.' +
                            'Double-check your email address and try again.'
                    });
                };
                console.log("Checking before comparing" + user);
                console.log("password in login --> " + password);

                bcrypt.compare(password, user.password, function(err, isMatch) {
                    if (err)
                        console.log('Error while checking password');
                    else if (isMatch) {
                        console.log('The password matches!');
                        return done(null, user);
                    } else {
                        console.log('The username and password does NOT match!');
                        return done(null, false, { msg: 'Invalid email or password' });
                    }

                });

            })

        .catch(function(err) {
            console.log("Error:", err);
            return done(null, false, {
                message: 'Something went wrong with your Login'
            });
        });
    }));

// // Facebook Login
// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_ID,
//     clientSecret: process.env.FACEBOOK_SECRET,
//     callbackURL: '/auth/facebook/callback',
//     profileFields: ['name', 'email', 'gender', 'location'],
//     passReqToCallback: true
// }, function(req, accessToken, refreshToken, profile, done) {
//     if (req.user) {
//         User.findOne({
//             facebook: profil.id
//         }, function(err, user) {
//             if (user) {
//                 req.flash('error', { msg: 'There is already an existing account linked with Facebook that belongs to you.' });
//                 done(err);
//             } else {
//                 User.findById(req.user.id, function(err, user) {
//                     user.name = user.name || profile.name.givenName + ' ' + profile.name.familyName;
//                     user.gender = user.gender || profile._json.gender;
//                     user.picture = user.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
//                     user.facebook = profile.id;
//                     user.save(function(err) {
//                         req.flash('success', { msg: 'Your Facebook account has been linked.' });
//                         done(err, user);
//                     })
//                 })
//             }
//         })
//     } else {
//         User.findOne({
//             facebook: profile.id
//         }, function(err, user) {
//             if (user) {
//                 return done(err, user);
//             }
//             User.findOne({ email: profile._json.email }, function(err, user) {
//                 if (user) {
//                     req.flash('error', { msg: user.email + ' is already associated with another account.' });
//                     done(err);
//                 } else {
//                     var newUser = new User({
//                         name: profile.name.givenName + ' ' + profile.name.familyName,
//                         email: profile._json.email,
//                         gender: profile._json.gender,
//                         location: profile._json.location && profile._json.location.name,
//                         picture: 'https://graph.facebook.com/' + profile.id + '/picture?type=large',
//                         facebook: profile.id
//                     });
//                     newUser.save(function(err) {
//                         done(err, newUser);
//                     });
//                 }
//             });
//         })
//     }
// }));


// Sign in with Facebook
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['name', 'email', 'gender', 'location'],
    passReqToCallback: true
}, function(req, accessToken, refreshToken, profile, done) {
    if (req.user) {
        models.userTables.findOne({
                where: {
                    facebook: profile.id
                }
            })
            .then(function(user) {
                if (user) {
                    req.flash('error', { msg: 'There is already an existing account linked with Facebook that belongs to you.' });
                    return done(null);
                }
                models.userTables.findOne({
                        where: {
                            id: req.user.id
                        }
                    })
                    .then(function(user) {

                        var new_User = {
                            name: user.name || profile.name.givenName + ' ' + profile.name.familyName,
                            gender: user.gender || profile._json.gender,
                            picture: user.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large',
                            facebook: profile.id
                        }
                        models.userTables.create(
                                new_User
                            )
                            .then(function() {
                                req.flash('success', { msg: 'Your Facebook account has been linked.' });
                                done(null, user);
                            });
                    });
            });
    } else {
        models.userTables.findOne({
                where: {
                    facebook: profile.id
                }
            })
            .then(function(user) {
                if (user) {
                    return done(null, user);
                }
                models.userTables.findOne({
                        where: {
                            email: profile._json.email
                        }
                    })
                    .then(function(user) {
                        if (user) {
                            req.flash('error', { msg: user.get('email') + ' is already associated with another account.' });
                            return done();
                        }
                        var new_User = {
                            name: profile.name.givenName + ' ' + profile.name.familyName,
                            email: profile._json.email,
                            gender: profile._json.gender,
                            location: profile._json.location && profile._json.location.name,
                            picture: 'https://graph.facebook.com/' + profile.id + '/picture?type=large',
                            facebook: profile.id
                        }
                        models.userTables.create(
                                new_User
                            )
                            .then(function(user) {
                                done(null, user);
                            });
                    });
            });
    }
}));

// Sign in with Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
}, function(req, accessToken, refreshToken, profile, done) {
    if (req.user) {
        models.userTables.findOne({
                where: {
                    google: profile.id
                }
            })
            .then(function(user) {
                if (user) {
                    req.flash('error', { msg: 'There is already an existing account linked with Google that belongs to you.' });
                    return done(null);
                }
                models.userTables.findOne({
                        where: {
                            id: req.user.id
                        }
                    })
                    .then(function(user) {
                        var new_User = {
                            name: user.name || profile.displayName,
                            gender: user.gender || profile._json.gender,
                            picture: user.picture || profile._json.image.url,
                            google: profile.id
                        }
                        models.userTables.create(
                                new_User
                            )
                            .then(function() {
                                req.flash('success', { msg: 'Your Google account has been linked.' });
                                done(null, user);
                            });
                    });
            });
    } else {
        models.userTables.findOne({
                where: {
                    google: profile.id
                }
            })
            .then(function(user) {
                if (user) {
                    return done(null, user);
                }
                models.userTables.findOne({
                        where: {
                            email: profile.emails[0].value
                        }
                    })
                    .then(function(user) {
                        if (user) {
                            req.flash('error', { msg: user.get('email') + ' is already associated with another account.' });
                            return done();
                        }
                        var new_User = {
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            gender: profile._json.gender,
                            location: profile._json.location,
                            picture: profile._json.image.url,
                            google: profile.id
                        }
                        models.userTables.create(
                            new_User
                        ).then(function(user) {
                            done(null, user);
                        });
                    });
            });
    }
}));


// // Twitter Login
// passport.use(new TwitterStrategy({
//     consumerKey: process.env.TWITTER_KEY,
//     consumerSecret: process.env.TWITTER_SECRET,
//     callbackURL: '/auth/twitter/callback',
//     passReqToCallback: true
// }, function(req, accessToken, tokenSecret, profile, done) {
//     if (req.user) {
//         User.findOne({
//             twitter: profil.id
//         }, function(err, user) {
//             if (user) {
//                 req.flash('error', { msg: 'There is already an existing account linked with Twitter that belongs to you.' });
//                 done(err);
//             } else {
//                 User.findById(req.user.id, function(err, user) {
//                     user.name = user.name || profile.displayName;
//                     user.location = user.location || profile._json.location;
//                     user.picture = user.picture || profile._json.profile_image_url_https;
//                     user.twitter = profile.id;
//                     user.save(function(err) {
//                         req.flash('success', { msg: 'Your Twitter account has been linked.' });
//                         done(err, user);
//                     })
//                 })
//             }
//         })
//     } else {
//         User.findOne({ twitter: profile.id }, function(err, existingUser) {
//             if (existingUser) {
//                 return done(null, existingUser);
//                 done(err);
//             } else {
//                 // twiiter do not provied email
//                 var newUser = new User({
//                     name: profile.displayName,
//                     email: profile.username + '@twiiter.com',
//                     location: profile._json.location,
//                     picture: profile._json.profile_image_url_https,
//                     twitter: profile.id
//                 });
//                 newUser.save(function(err) {
//                     done(err, newUser);
//                 });
//             }
//         });
//     }
// }));


// // Github Login
// passport.use(new GithubStrategy({
//     clientID: process.env.GITHUB_ID,
//     clientSecret: process.env.GITHUB_SECRET,
//     callbackURL: '/auth/github/callback',
//     passReqToCallback: true
// }, function(req, accessToken, refreshToken, profile, done) {
//     if (req.user) {
//         User.findOne({
//             github: profil.id
//         }, function(err, user) {
//             if (user) {
//                 req.flash('error', { msg: 'There is already an existing account linked with Github that belongs to you.' });
//                 done(err);
//             } else {
//                 User.findById(req.user.id, function(err, user) {
//                     user.name = user.name || profile.displayName;
//                     user.picture = user.picture || profile._json.avatar_url;
//                     user.github = profile.id;

//                     user.save(function(err) {
//                         req.flash('success', { msg: 'Your Github account has been linked.' });
//                         done(err, user);
//                     })
//                 })
//             }
//         })
//     } else {
//         User.findOne({
//             github: profile.id
//         }, function(err, user) {
//             if (user) {
//                 return done(null, user);
//             }
//             User.findOne({ email: profile.email }, function(err, user) {
//                 if (user) {
//                     req.flash('error', { msg: user.email + ' is already associated with another account.' });
//                     done(err);
//                 } else {
//                     var newUser = new User({
//                         name: profile.displayName,
//                         email: profile._json.email,
//                         location: profile._json.location,
//                         picture: profile._json.avatar_url,
//                         github: profile.id
//                     });
//                     newUser.save(function(err) {
//                         done(err, newUser);
//                     });
//                 }
//             });
//         })
//     }
// }));

// // validate password
// function comparePassword(password, cb) {
//     bcrypt.compare(password, this.password, function(err, isMatch) {
//         cb(err, isMatch);
//     });
// };

// Sign in with Twitter
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_KEY,
    consumerSecret: process.env.TWITTER_SECRET,
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
}, function(req, accessToken, tokenSecret, profile, done) {

    if (req.user) {
        models.userTables.findOne({
                where: {
                    twitter: profile.id
                }
            })
            .then(function(user) {
                if (user) {
                    req.flash('error', { msg: 'There is already an existing account linked with Twitter that belongs to you.' });
                    return done(null);
                }
                models.userTables.findOne({
                        where: {
                            id: req.user.id
                        }
                    })
                    .then(function(user) {

                        var new_User = {
                            name: user.name || profile.displayName,
                            location: user.location || profile._json.location,
                            picture: user.picture || profile._json.profile_image_url_https,
                            twitter: profile.id
                        }
                        models.userTables.create(
                            new_User
                        )

                        .then(function() {
                            req.flash('success', { msg: 'Your Twitter account has been linked.' });
                            done(null, user);
                        });
                    });
            });
    } else {
        models.userTables.findOne({
                where: {
                    twitter: profile.id
                }
            })
            .then(function(user) {
                if (user) {
                    return done(null, user);
                }
                // Twitter does not provide an email address, but email is a required field in our User schema.
                // We can "fake" a Twitter email address as follows: username@twitter.com.
                // Ideally, it should be changed by a user to their real email address afterwards.
                // For example, after login, check if email contains @twitter.com, then redirect to My Account page,
                // and restrict user's page navigation until they update their email address.
                // user = new User()

                var new_User = {
                    name: profile.displayName,
                    email: profile.username + '@twiiter.com',
                    location: profile._json.location,
                    picture: profile._json.profile_image_url_https,
                    twitter: profile.id
                }
                models.userTables.create(
                    new_User
                )

                .then(function(user) {
                    done(null, user);
                });
            });
    }
}));

// Sign in with Github
passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: '/auth/github/callback',
    passReqToCallback: true
}, function(req, accessToken, refreshToken, profile, done) {
    if (req.user) {
        models.userTables.findOne({
                where: {
                    github: profile.id
                }
            })
            .then(function(user) {
                if (user) {
                    req.flash('error', { msg: 'There is already an existing account linked with Github that belongs to you.' });
                    return done(null);
                }

                models.userTables.findOne({
                        where: {
                            id: req.user.id
                        }
                    })
                    .then(function(user) {
                        var new_User = {
                            name: user.name || profile.displayName,
                            picture: user.picture || profile._json.avatar_url,
                            github: profile.id
                        }
                        models.userTables.create(
                                new_User
                            )
                            .then(function() {
                                req.flash('success', { msg: 'Your Github account has been linked.' });
                                done(null, user);
                            });
                    });
            });
    } else {

        models.userTables.findOne({
                where: {
                    github: profile.id
                }
            })
            .then(function(user) {
                if (user) {
                    return done(null, user);
                }
                models.userTables.findOne({
                        where: {
                            email: profile.email
                        }
                    })
                    .then(function(user) {
                        if (user) {
                            req.flash('error', { msg: user.get('email') + ' is already associated with another account.' });
                            return done();
                        }
                        var new_User = {
                            name: user.name || profile.displayName,
                            picture: user.picture || profile._json.avatar_url,
                            github: profile.id
                        }
                        models.userTables.create(
                                new_User
                            )
                            .then(function(user) {
                                done(null, user);
                            });
                    });
            });
    }
}));