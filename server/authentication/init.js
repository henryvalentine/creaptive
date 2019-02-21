import passport from 'passport';
import bCrypt from 'bcrypt';
import passportLocal from 'passport-local';
import logger from '../logger';
const LocalStrategy = passportLocal.Strategy;
// import mongoose from 'mongoose';
let User = {};
import authenticationMiddleware from './middleware';

passport.serializeUser(function(user, done)
{
  done(null, user);
});

passport.deserializeUser(function(user, done)
{
  User.findById({_id: user.id}, function(err, user)
  {
      done(err, user);
  });
});

const initPassport = (app, mongoose) =>
{
    User = mongoose.model('User');
  passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
      },(email, password, done) => 
      {
          User.findOne({ email: email }).populate('recommendedCrafts.craft').populate('recommendedServices.service').populate('friends.user').populate('topSpecialties.skill').populate({path: 'academics', populate: { path: 'country', select: ['_id', 'name']}}).exec((err, user) =>
          {
            if (err)
            {
              return({code: -1, message: `An unknown error was encountered. Please try again later`})
            }
            else if (!user)
            {
              return done({code: -1, message: `Your Email could not be recognized`})
            }
            else
            {
                bCrypt.compare(password, user.password, (err, isValid) =>
                {
                  if (err)
                  {
                    return done({code: -1, message: `The password you provided is incorrect`})
                  }
                  else if (!isValid)
                  {
                    return done({code: -1, message: `Incorrect password.`})
                  }
                  else
                  {
                      user.onlineStatus = true;
                      user.lastSeen = getDate();
                      user.save();
                      return done(null, user)
                  }
                })

            }

          });

      }
  ));

    function getDate(d = null)
    {
        if (!d)
        {
            d = new Date();
        }
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();
        let date = year + '/' + month + '/' + day;
        let hours = formatTwoDigits(d.getHours());
        let minutes = formatTwoDigits(d.getMinutes());
        let seconds = formatTwoDigits(d.getSeconds());
        return date + ' ' + hours + ":" + minutes + ":" + seconds;
    }

    function formatTwoDigits(n)
    {
        return n < 10 ? '0' + n : n;
    }

  passport.authenticationMiddleware = authenticationMiddleware
};

module.exports = initPassport;
