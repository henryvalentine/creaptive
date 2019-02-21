import passport from 'passport';
import logger from '../logger';
import Jwt from 'jsonWebToken';
import config from '../common/config';
// import mongoose from 'mongoose';
let User = {};
let Academic = {};

const init = (app, mongoose) =>
{
      User = mongoose.model('User');
    Academic = mongoose.model('Academic');
      app.get('/getGeek', getGeek);
      app.post('/getGeeks', getGeeks);
      app.get('/getSeller', getSeller);
      app.get('/geekSpace', geekSpace);
      app.get('/checkEmail', checkEmail);
      app.get('/checkGeekName', checkGeekName);

      app.post('/login', function(req, res, next)
      {
            try{
                passport.authenticate('local', function(err, user, info)
                {
                    if (err)
                    {
                        return res.json(err);
                    }
                    else
                    {

                        if (!user)
                        {
                            return res.json({code: -1, message: 'Your account could not be found'});
                        }

                        else
                        {
                            req.logIn(user, function(err)
                            {
                                if (err)
                                {
                                    return res.json({code: -1, message: 'An unknown error was encountered. Please try again later'});
                                }
                                else
                                {
                                    let name = user.geekName? user.geekName : user.firstName? user.firstName + ' ' + user.lastName : user.email;
                                    let tokenData =
                                        {
                                            id: user._id, email: user.email, role: user.role, isAuthenticated: true, name: name, dateIn: new Date()
                                        };
                                    let userData = Jwt.sign(tokenData, config.key.privateKey);

                                    let skills = [];
                                    if(user.topSpecialties !== undefined && user.topSpecialties !== null && user.topSpecialties.length > 0)
                                    {
                                        user.topSpecialties.forEach((s, i) =>
                                        {
                                            skills.push({skill: s._id, name: s.skill.name, level: s.level});
                                        });
                                    }

                                    let ll = {};
                                    if(user.location === undefined || user.location === null || user.location.city === undefined)
                                    {
                                        ll = {country: 'Not available', ip: '', city: ''};
                                    }
                                    else{
                                        ll = user.location;
                                        ll.ll = user.location.city.name;
                                    }

                                    return res.json({code: 5, message: 'Log in was successful', email: user.email, firstName: (user.firstName === undefined || user.firstName === null || user.firstName.length < 1)? '' : user.firstName,
                                        lastName:  (user.lastName === undefined || user.lastName === null || user.lastName.length < 1)? '' : user.lastName,
                                        id: user._id, role: user.role, isAuthenticated: true, name: name, userData: userData, geekName: user.geekName, geekNameUpper: user.geekNameUpper,
                                        professionalCaption: (user.professionalCaption === undefined || user.professionalCaption === null || user.professionalCaption.length < 1)? '' : user.professionalCaption,
                                        location: ll, phoneNumberConfirmed: user.phoneNumberConfirmed,
                                        languages: user.languages, profileImagePath: user.profileImagePath,
                                        dateRegistered: getMonthYear(user.dateRegistered), topSpecialties: skills, summary: (user.summary === undefined || user.summary === null || user.summary.length < 1)? '' : user.summary,
                                        academics: user.academics,
                                        onlineStatus:  user.onlineStatus === true? 1 : 0, successfulDealsDelivered: user.successfulDealsDelivered !== undefined && user.successfulDealsDelivered !== null? user.successfulDealsDelivered : 0
                                    });
                                }
                            });
                        }
                    }
                })(req, res, next);
            }
            catch(e)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again later'});
            }
      });

    app.get('/getUserSession', function(req, res, next)
    {
        let userData = req.headers.psid;

        if (!userData)
        {
            return res.json({code: -1, message: 'Your session has timed out or you are not logged in.', id: '', role: '', isAuthenticated: false, name: '', profileImage: ''});
        }
        else
        {
            Jwt.verify(userData, config.key.privateKey, (err, usr) =>
            {
                if (err)
                {
                    return res.json({code: -1, message: 'Your session has timed out or you are not logged in.', id: '', role: '', isAuthenticated: false, name: '', profileImage: ''});
                }
                else if (!usr || usr.id.length < 1 || usr.isAuthenticated !== true  || usr.email.length < 0)
                {
                    return res.json({code: -1, message: 'Your session has timed out or you are not logged in.', id: '', role: '', isAuthenticated: false, name: '', profileImage: ''});
                }
                else
                {
                    User.findOne({email: usr.email}).populate('location.city').populate('topSpecialties.skill').populate({path: 'academics', populate: { path: 'country', select: ['_id', 'name']}}).exec((err, user) =>
                    {
                        if (err)
                        {
                            res.json({code: -1, message: 'An error was encountered. Please try again later', userExists: false});
                        }
                        else
                        {
                            if (!user)
                            {
                                res.json({code: -1, message: 'Your session has expired or you are not logged in'});
                            }
                            else
                            {
                                let name = user.geekName? user.geekName : user.firstName? user.firstName + ' ' + user.lastName : user.email;
                                let tokenData =
                                {
                                    id: user._id, email: user.email, role: user.role, isAuthenticated: true, name: name, dateIn: new Date()
                                };

                                user.lastSeen = getDate();
                                user.save();

                                let userData = Jwt.sign(tokenData, config.key.privateKey);
                                let skills = [];
                                if(user.topSpecialties !== undefined && user.topSpecialties !== null && user.topSpecialties.length > 0)
                                {
                                    user.topSpecialties.forEach((s, i) =>
                                    {
                                        skills.push({skill: s._id, name: s.skill.name, level: s.level});
                                    });
                                }

                                let ll = {};
                                if(!user.location || !user.location.ip || !user.location.country)
                                {
                                    ll = {country: 'Not available', ip: '', city: ''};
                                }
                                else
                                {
                                    ll = user.location;
                                }

                                return res.json({code: 5, message: 'Log in was successful', email: user.email, firstName: (user.firstName === undefined || user.firstName === null || user.firstName.length < 1)? '' : user.firstName,
                                    lastName:  (user.lastName === undefined || user.lastName === null || user.lastName.length < 1)? '' : user.lastName,
                                    id: user._id, role: user.role, isAuthenticated: usr.isAuthenticated, name: name, userData: userData, geekName: user.geekName, geekNameUpper: user.geekNameUpper,
                                    professionalCaption: (user.professionalCaption === undefined || user.professionalCaption === null || user.professionalCaption.length < 1)? '' : user.professionalCaption,
                                    location: ll, phoneNumberConfirmed: user.phoneNumberConfirmed,
                                    languages: user.languages, profileImagePath: user.profileImagePath,
                                    dateRegistered: getMonthYear(user.dateRegistered), topSpecialties: skills, summary: (user.summary === undefined || user.summary === null || user.summary.length < 1)? '' : user.summary,
                                    academics: user.academics,
                                    onlineStatus: user.onlineStatus === true? 1 : 0, successfulDealsDelivered: user.successfulDealsDelivered !== undefined && user.successfulDealsDelivered !== null? user.successfulDealsDelivered : 0
                                });
                            }
                        }
                    });

                }
            });
        }


    });

  app.post('/logout', function (req, res)
  {
      let userData = req.headers.psid;

      if (!userData)
      {
          return res.json({code: -1, message: 'Your session has timed out or you are not logged in.', id: '', role: '', isAuthenticated: false, name: '', profileImage: ''});
      }
      else
      {
          Jwt.verify(userData, config.key.privateKey, (err, usr) =>
          {
              if (err)
              {
                  return res.json({code: -1, message: 'An error was encountered. Please try again later', id: '', role: '', isAuthenticated: false, name: '', profileImage: ''});
              }
              else if (!usr || usr.id.length < 1 || usr.isAuthenticated !== true  || usr.email.length < 0)
              {
                  return res.json({code: -1, message: 'Your session has timed out or you are not logged in.', id: '', role: '', isAuthenticated: false, name: '', profileImage: ''});
              }
              else
              {
                  User.findOne({email: usr.email}).exec((err, user) =>
                  {
                      if (err)
                      {
                          res.json({code: -1, message: 'An error was encountered. Please try again later', userExists: false});
                      }
                      else
                      {
                          if (!user)
                          {
                              res.json({code: -1, message: 'Your session has expired or you are not logged in'});
                          }
                          else
                          {
                              user.onlineStatus = false;
                              user.lastSeen = getDate();
                              user.save();
                              if (req.session)
                              {
                                  req.logout();
                              }

                              return res.json({code: 5, email: '', firstName: '', lastName: '', profileImage: '',
                                  id: '', name: '', geekName: '', emailConfirmed: false, friends: [],
                                  professionalCaption: '', languages: [], recommendedServices: [], geekNameUpper: '',
                                  dateRegistered: '', topSpecialties: [], summary: '', recommendedCrafts: [],
                                  location: {country: 'Not available', ip: '', city: ''}, isAuthenticated: false,
                                  academics: [], onlineStatus: 0, successfulDealsDelivered: 0
                              });
                          }
                      }
                  });

              }
          });
      }
  });
};

function checkEmail (req, res)
 {
     User.findOne({email: req.query.email}).exec((err, user) =>
     {
         if (err)
         {
             res.json({code: -1, message: 'An error was encountered. Please try again later', userExists: false});
         }
         else
         {
             if (user)
             {
                 res.json({code: 5, message: 'This Email already exists in our records. Please log in to continue', userExists: true});
             }
             else
             {
                 res.json({code: 5, message: "This Email doesn't exist yet in our records", userExists: false});
             }
         }
     });

}

function checkGeekName (req, res)
{
    let geekName = req.query.geekName.replace(' ', '');
    let geekNameUpper = geekName.toUpperCase();
    User.findOne({geekNameUpper: geekNameUpper}).exec((err, user) =>
    {
        if (err)
        {
            res.json({code: -1, message: 'An error was encountered. Please try again later', geekNameExists: false});
        }
        else
        {
            if (user)
            {
                res.json({code: 5, message: 'Your Geek Name is already taken. Please choose a different one', geekNameExists: true});
            }
            else
            {
                res.json({code: 5, message: "Your Geek Name doesn't exist yet in our records", geekNameExists: false});
            }
        }
    });
}

function getGeek (req, res)
{
    try{
        let geekName = req.query.cre.replace(' ', '');
        let geekNameUpper = geekName.toUpperCase();
        User.findOne({geekNameUpper: geekNameUpper}).populate('location.city').populate('topSpecialties.skill').populate({path: 'academics', populate: { path: 'country', select: ['_id', 'name']}}).exec((err, user) =>
        {
            if (err)
            {
                res.json({id: '', code: -1, message: 'Your request could not be completed now. Please try again later'});
            }
            else
            {
                if(user)
                {
                    let name = user.geekName? user.geekName : user.firstName? user.firstName + ' ' + user.lastName : user.email;
                    let tokenData =
                        {
                            id: user._id, email: user.email, role: user.role, isAuthenticated: true, name: name, dateIn: new Date()
                        };

                    let userData = Jwt.sign(tokenData, config.key.privateKey);
                    let skills = [];

                    if(user.topSpecialties !== undefined && user.topSpecialties !== null && user.topSpecialties.length > 0)
                    {
                        user.topSpecialties.forEach((s, i) =>
                        {
                            skills.push({skill: s.skill._id, name: s.skill.name, level: s.level});
                        });
                    }

                    let ll = {};
                    let ip = (req.headers["X-Forwarded-For"] || req.headers["x-forwarded-for"] || '').split(',')[0] || req.client.remoteAddress;
                    if(user.location === undefined || user.location === null || user.location.city === undefined)
                    {
                        ll = {country: 'Not available', ip: ip, city: ''};
                    }
                    else{
                        ll = user.location;
                    }

                    return res.json({code: 5, message: 'Log in was successful', email: user.email, firstName: (user.firstName === undefined || user.firstName === null || user.firstName.length < 1)? '' : user.firstName,
                        lastName:  (user.lastName === undefined || user.lastName === null || user.lastName.length < 1)? '' : user.lastName,
                        id: user._id, role: user.role, isAuthenticated: false, name: name, userData: userData, geekName: user.geekName, geekNameUpper: user.geekNameUpper,
                        professionalCaption: (user.professionalCaption === undefined || user.professionalCaption === null || user.professionalCaption.length < 1)? '' : user.professionalCaption,
                        location: ll, phoneNumberConfirmed: user.phoneNumberConfirmed,
                        languages: user.languages, profileImagePath: user.profileImagePath,
                        dateRegistered: getMonthYear(user.dateRegistered), topSpecialties: skills, summary: (user.summary === undefined || user.summary === null || user.summary.length < 1)? '' : user.summary,
                        academics: user.academics,
                        onlineStatus: user.onlineStatus === true? 1 : 0, successfulDealsDelivered: user.successfulDealsDelivered !== undefined && user.successfulDealsDelivered !== null? user.successfulDealsDelivered : 0
                    });
                }
                else{
                    return res.json({code: -1, email: '', firstName: '', lastName: '',
                        id: '', name: '', geekName: '', emailConfirmed: false, friends: [],
                        professionalCaption: '', languages: [], recommendedServices: [], geekNameUpper: '',
                        dateRegistered: '', topSpecialties: [], summary: '', recommendedCrafts: [], phoneNumberConfirmed: false,
                        location: {country: 'Not available', ip: '', city: ''}, isAuthenticated: false,
                        academics: [], onlineStatus: 0, successfulDealsDelivered: 0, profileImagePath: ''
                    });
                }
            }
        });
    }
    catch(e)
    {
        console.log('\nGEEK ERROR');
        console.log(e);
        res.json({id: '', code: -1, message: 'Your request could not be completed now. Please try again later'});
    }
}

function getGeeks (req, res)
{
    try{
        let find = req.body.searchText && req.body.searchText.length > 0? { geekName: { "$regex": req.body.searchText, "$options": "i" },  } : {};
        // let count = User.count(find);
        User.find(find).sort({rating: 'asc'}).skip((req.body.page - 1) * req.body.itemsPerPage).limit(req.body.itemsPerPage).populate('location.city').populate('topSpecialties.skill').populate({path: 'academics', populate: { path: 'country', select: ['_id', 'name']}}).exec((error, geeks) =>
        {
            if(error)
            {
                res.json([]);
            }
            else{
                return res.json(geeks);
            }
        });
    }
    catch(e)
    {
        res.json([]);
    }
}

function getSeller (req, res)
{
    let geekNameUpper = req.query.cre.replace(' ', '');
    User.findOne({geekNameUpper: geekNameUpper}).populate({path: 'academics', populate: { path: 'country', select: ['_id', 'name']}}).exec((err, user) =>
    {
        if (err)
        {
            res.json({id: '', code: -1, message: 'Your request could not be completed now. Please try again later'});
        }
        else
        {
            if(user)
            {
                let name = user.geekName? user.geekName : user.firstName? user.firstName + ' ' + user.lastName : user.email;

                let ll = {};
                if(user.location === undefined || user.location === null || user.location.city === undefined)
                {
                    ll = {country: 'Not available', ip: '', city: ''};
                }
                else{
                    ll = user.location;
                }
                return res.json({code: 5, geek: {email: user.email,
                        id: user._id, name: name, geekName: user.geekName, geekNameUpper: user.geekNameUpper,
                        professionalCaption: (user.professionalCaption === undefined || user.professionalCaption === null || user.professionalCaption.length < 1)? '' : user.professionalCaption,
                        location: ll, phoneNumberConfirmed: user.phoneNumberConfirmed,
                        languages: user.languages, profileImagePath: user.profileImagePath,
                        dateRegistered: getMonthYear(user.dateRegistered), summary: (user.summary === undefined || user.summary === null || user.summary.length < 1)? '' : user.summary,
                        academics: user.academics,
                        onlineStatus: user.onlineStatus === true? 1 : 0, successfulDealsDelivered: user.successfulDealsDelivered !== undefined && user.successfulDealsDelivered !== null? user.successfulDealsDelivered : 0}
                });
            }
            else{
                res.json({id: '', code: -1, message: 'Your request could not be completed now. Please try again later'});
            }
        }
    });
}

function geekSpace (req, res)
{
    try{
        User.findOne({geekName: req.query.cre}).populate('location.city').populate('education.countryId').exec((err, user) =>
        {
            if (err)
            {
                res.json({id: '', code: -1, message: 'Your request could not be completed now. Please try again later'});
            }
            else
            {
                let name = user.geekName? user.geekName : user.firstName? user.firstName + ' ' + user.lastName : user.email;
                return res.json({code: 5, email: user.email, firstName: user.firstName, lastName: user.lastName,
                    id: user._id, name: name, geekName: user.geekName,
                    professionalCaption: user.professionalCaption, location: user.location, language: user.language,
                    dateRegistered: getMonthYear(user.dateRegistered), topSpecialties: user.topSpecialties, summary: user.summary,
                    education: user.education, onlineStatus: 1, successfulDealsDelivered: user.successfulDealsDelivered
                });
            }
        });
    }
    catch(e)
    {
        res.json({id: '', code: -1, message: 'Your request could not be completed now. Please try again later'});
    }

}

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

function getMonthYear(d = null)
{
    if (!d)
    {
        d = new Date();
    }
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let monthYear = '';
    let monthNames = months.filter(function(m){
        return m.id === parseInt(month);
    });
    if(monthNames.length > 0)
    {
        monthYear = monthNames[0].name + ', ' + year;
    }
    else{
        monthYear = month + ', ' + year;
    }
    return monthYear;
}

let months = [{id: 1, name: 'January'}, {id: 2, name: 'February'}, {id: 3, name: 'March'}, {id: 4, name: 'April'}, {id: 5, name: 'May'}, {id: 6, name: 'June'}, {id: 7, name: 'July'}, {id: 8, name: 'August'}, {id: 9, name: 'September'}, {id: 10, name: 'October'}, {id: 11, name: 'November'}, {id: 12, name: 'December'}]

module.exports = init;
