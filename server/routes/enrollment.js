
import bcrypt from 'bcrypt';
import config from '../common/config';
import logger from '../logger';
import common from '../common/common';
import Jwt from 'jsonWebToken';
import uuidv4 from 'uuid/v4';
let User = '';

const init = (app, mongoose) =>
{
    User = mongoose.model('User');
    app.post('/enroll', addUser);
    app.post('/updateEnrollment', updateUser);
};

function addUser (req, res)
{
   try
   {
       let geek = req.body;
       if (!geek.email || !geek.password || !geek.confirmPassword)
       {
           return res.json({code: -1, id: '', message: 'Please provide all required fields'});
       }
       else
       {
           if (geek.password !== geek.confirmPassword)
           {
               return res.json({ id: '', code: -1, message: 'The passwords do not match' });
           }
           else
           {
               User.findOne({email: geek.email}).exec((err, existingUser) =>
               {
                   if (!existingUser)
                   {
                       let geekName = geek.geekName.replace(' ', '');
                       let geekNameUpper = geekName.toUpperCase();
                       const user = new User({
                           email: geek.email,
                           geekName: geekName,
                           geekNameUpper: geekNameUpper,
                           password: geek.password,
                           dateRegistered: new Date(),
                           securityStamp: uuidv4(),
                           role: 'user'
                       });

                       bcrypt.hash(geek.password, 10, function (err, hash)
                       {
                           if (err)
                           {
                               return res.json({id: '', code: -1, message: 'Your account could not be created at this time. Please try again later'})
                           }
                           else
                           {
                               user.password = hash;
                               user.save((err, savedUser) =>
                               {
                                   if (!savedUser)
                                   {
                                       logger.error(err);
                                       return res.json({id: '', code: -1, message: 'Your account could not be created at this time. Please try again later'})
                                   }
                                   else
                                   {
                                       //Send confirmation Email
                                       let tokenData =
                                           {
                                               email: user.email,
                                               id: savedUser._id
                                           };

                                       common.sendVerificationMail(user.email, Jwt.sign(tokenData, config.key.privateKey)).then((vRes) =>
                                       {
                                           if(!vRes.success || !vRes.success.messageId || vRes.success.messageId.length < 1)
                                           {
                                               logger.error(vRes.error);
                                               return res.json({id: savedUser._id, role: savedUser.role, geekName: user.geekName, isAuthenticated: true, code: -3, message: 'Your account was successfully created but a verification email could not be sent to you at this time. Please do request for a verification link at your convenience.'})
                                           }
                                           else
                                           {
                                               let name = savedUser.firstName? savedUser.firstName + ' ' + savedUser.lastName : savedUser.email;
                                               let tokenData =
                                                   {
                                                       id: savedUser._id, email: savedUser.email, role: savedUser.role, isAuthenticated: true, name: name, dateIn: new Date()
                                                   };
                                               let userData = Jwt.sign(tokenData, config.key.privateKey);
                                               const message = 'Your account was successfully created. Please verify your account by clicking on the confirmation link just sent to your email.';
                                               return res.json({id: savedUser._id, role: savedUser.role, isAuthenticated: true, name: name, userData: userData, code: 5, message: message, geekName: savedUser.geekName});
                                           }
                                       });
                                   }
                               });
                           }
                       });
                   }
                   else
                   {
                       if(!existingUser.emailConfirmed)
                       {
                           let tokenDataz =
                               {
                                   email: geek.email,
                                   id: existingUser._id
                               };

                           common.sendVerificationMail(geek.email, Jwt.sign(tokenDataz, config.key.privateKey)).then((vRes) =>
                           {
                               let name = existingUser.geekName? existingUser.geekName : existingUser.firstName? existingUser.firstName + ' ' + existingUser.lastName : existingUser.email;
                               if(!vRes.success || !vRes.success.messageId || vRes.success.messageId.length < 1)
                               {
                                   logger.error(vRes.error);

                                   let tokenData =
                                       {
                                           id: existingUser._id, email: existingUser.email, role: existingUser.role, isAuthenticated: true, name: name, dateIn: new Date()
                                       };
                                   return res.json({id: existingUser._id, role: existingUser.role, geekName: existingUser.geekName, isAuthenticated: true, name: name, userData: Jwt.sign(tokenData, config.key.privateKey), code: 3, message: 'Your account has not been activated. A new verification email could not be sent to you at this time. Please do request for a verification link at your convenience.'})
                               }
                               else
                               {
                                   const message = 'Your account has not been activated. A new confirmation email has been sent to you.';
                                   let tokenData =
                                       {
                                           id: existingUser._id, email: existingUser.email, role: existingUser.role, isAuthenticated: true, name: name, dateIn: new Date()
                                       };
                                   let userData = Jwt.sign(tokenData, config.key.privateKey);
                                   return res.json({id: existingUser._id, role: existingUser.role, geekName: existingUser.geekName, name: name, userData: userData, code: 5, message: message});
                               }
                           });
                       }
                       else
                       {
                           let name = existingUser.geekName? existingUser.geekName : existingUser.firstName? existingUser.firstName + ' ' + existingUser.lastName : existingUser.email;
                           let tokenData =
                               {
                                   id: existingUser._id, email: existingUser.email, role: existingUser.role, isAuthenticated: true, name: name, dateIn: new Date()
                               };
                           let userData = Jwt.sign(tokenData, config.key.privateKey);
                           return res.json({id: existingUser._id, role: existingUser.role, geekName: existingUser.geekName, name: name, userData: userData, isAuthenticated: true, code: 5, message: 'You already have a creaptive account'});
                       }
                   }
               });
           }
       }
   }
   catch(e)
   {
       return res.json({id: '', code: -1, message: 'An internal server error was encountered. Please try again later'})
   }
}

function updateUser (req, res)
{
    try
    {
        let geek = req.body;

        if (!geek.email || !geek.id)
        {
            return res.json({id: '', code: -1, message: 'An error was encountered and the process was halted. <br/>Please try again later'})
        }
        else
        {
            if (geek.password !== geek.confirmPassword)
            {
                return res.json({id: '', code: -1, message: 'The passwords do not match'})
            }
            else
            {
                let opts =
                    {
                        firstName: geek.firstName,
                        middleName:  geek.middleName,
                        lastName:  geek.lastName,
                        phoneNumber:  geek.phoneNumber,
                        gender:  geek.gender,
                        dob:  geek.dob,
                        profileImagePath:  geek.profileImagePath,
                        topSpecialties:  geek.topSpecialties,
                        displayName:  geek.displayName,
                        location:  geek.location
                    };

                User.update({_id: geek.id}, {$set: opts}, (err, savedUser) =>
                {
                  console.log('\nsavedUser\n');
                  console.log(savedUser);
                    if (err)
                    {
                        return res.json({id: '', code: -1, message: 'Process could not be completed at this time. Please try again later'})
                    }
                    else
                    {;
                        return res.json({id: savedUser._id, code: 5, message: 'Process was successfully completed'});
                    }
                });
            }
        }
    }
    catch(e)
    {
        console.log(e);
        return res.json({id: '', code: -1, message: 'Process could not be completed at this time. Please try again later'})
    }
}

module.exports = init;