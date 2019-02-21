/**
 * Created by Jack V on 9/22/2017.
 */
import logger from '../logger';
import common from '../common/common';
import Jwt from 'jsonWebToken';
const fetch = require('node-fetch');
import bcrypt from 'bcrypt';
const config = require('../common/config');

const twilioClient = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
let User = '';
let Skill = '';
let Academic = '';

const init = (app, mongoose) =>
{
    User = mongoose.model('User');
    Skill = mongoose.model('Skill');
    Academic = mongoose.model('Academic');
    app.post('/verifyAccount', verifyAccount);
    app.post('/changePassword', changePassword);
    app.post('/resetPassword', resetPassword);
    app.post('/forgotPassword', forgotPassword);
    app.post('/updateUserSkill', updateUserSkill);
    app.post('/addUserSkill', addUserSkill);
    app.post('/processFriend', processFriend);
    app.post('/processLocation', processLocation);
    app.post('/processEducation', processEducation);
    app.post('/processServiceRecommendation', processServiceRecommendation);
    app.post('/processCraftRecommendation', processCraftRecommendation);
    app.post('/updateServiceRecommendationClick', updateServiceRecommendationClick);
    app.post('/updateCraftRecommendationClick', updateCraftRecommendationClick);
    app.post('/saveGeekNames', saveGeekNames);
    app.post('/saveProfessionalCaption', saveProfessionalCaption);
    app.post('/saveLanguage', saveLanguage);
    app.post('/verifyPhone', verifyPhone);
    app.post('/verifyCode', verifyCode);
    app.post('/saveSummary', saveSummary);
    app.post('/addEducation', addEducation);
    app.post('/updateEducation', updateEducation);
    app.get('/gIp', getClientIp);
    app.get('/gl', getGeekLocation);

};

function verifyAccount (req, res)
{
    if(!req.body.auth)
    {
        return res.json({code: -1, message: 'An unknown error was encountered. Please try again later'});
    }
    else{
        Jwt.verify(req.body.auth, config.key.privateKey, (err, decoded) =>
        {
            if(err)
            {
                console.log(err);
                if(err.JsonWebTokenError.toLowerCase().contains('expired'))
                {
                    //Send a fresh confirmation Email
                    let tokenData =
                    {
                        email: decoded.email,
                        id: decoded.id
                    };

                    common.sendVerificationMail(decoded.email, Jwt.sign(tokenData, config.key.privateKey)).then((response) =>
                    {
                        if(response.error)
                        {
                            return res.json({code: -1, message: 'The verification link has expired. We tried to send a fresh one to your mail but an error was encountered in the process. Please try requesting for an activation mail at your convenience.'});
                        }
                        else
                        {
                            return res.json({code: -1, message: 'The verification link has expired. A fresh one has been sent to your mail. Please try clicking on the new link to verify your account within the next 24 hours.'});
                        }
                    });

                }
                else
                {
                    logger.error(err);
                    return res.json({code: -1, message: 'An unknown error was encountered. Please try again later'});
                }
            }
            else
            {
                User.findOne({email: decoded.email, _id: decoded.id}).exec((err, user) =>
                {
                    if (err)
                    {
                        logger.error(err);
                        return res.json({code: -1, message: 'An unknown error was encountered. Please try again later'});
                    }
                    else if (user == null)
                    {
                        return res.json({code: -1, message: 'This account could not be recognised'});
                    }
                    else if (user.emailConfirmed)
                    {
                        return res.json({code: -1, message: 'Your account is already verified'});
                    }
                    else
                    {
                        user.emailConfirmed = true;
                        user.save((err, updatedUser) =>
                        {
                            if (!err)
                            {
                                return res.json({code: 5, message:`Your account was successfully verified`});
                            }
                            else
                            {
                                logger.error(err);
                                return res.json({code: -1, message: `Your account could not be verified now due to an unknown error. Please try again later`});
                            }
                        })
                    }
                })
            }
        });
    }
}

function verifyPhone (req, res)
{
    const phone = req.body.phone;
    const userId = req.body.user;
    if(!phone || phone.length< 1)
    {
        return res.json({code: -1, message: 'Please provide your phone number'});
    }
    else if(!userId || userId.length < 1)
    {
        return res.json({code: -1, message: 'An unexpected system behaviour was encountered. \nPlease refresh the page and try again'});
    }
    else
     {
         User.findOne({_id: userId}).exec((err, user) =>
         {
             if (err || user == null)
             {
                 return res.json({code: -1, message: 'An internal server error was encountered. Please try again later'});
             }
             else
             {
                 if(user.phoneNumberConfirmed)
                 {
                     return res.json({code: 7, message:`Phone already activated`});
                 }
                 else
                 {
                     let phoneTokens = Jwt.sign(phone, config.key.privateKey).toUpperCase().replace('_', '').replace('-', '').split('.');
                     let numExtracts = phoneTokens[2].match(/\d+/g).join('');
                     let code = numExtracts.length > 4? numExtracts.substring(0, 4) : numExtracts;
                     user.phoneNumber = phone;
                     user.phoneCode = code;
                     user.phoneCodeGeneratedAt = new Date();

                     user.save((err, updatedUser) =>
                     {
                         if (!err)
                         {
                             let message = 'Your phone verification code is: ' + code;
                             twilioClient.messages.create({
                                 to: phone,
                                 from: '+14175516011',
                                 body: message,
                             }).then(message =>
                             {
                                 return res.json({code: 5, message:`A verification code has been sent to the provided phone number`});

                             }).catch(function(err)
                             {
                                 console.log("Error: \n");
                                 console.log(err);
                                 return res.json({code: -1, message:`An error was encountered and process terminated. Please try again later`});
                             });

                         }
                         else
                         {
                             logger.error(err);
                             return res.json({code: -1, message: `An error was encountered and process terminated. Please try again later`});
                         }
                     });
                 }
             }
         })
    }
}

function verifyCode (req, res)
{
    const phoneCode = req.body.phoneCode;
    const userId = req.body.user;
    if(!phoneCode || phoneCode.length< 1)
    {
        return res.json({code: -1, message: 'Please provide the confirmation code sent to you'});
    }
    if(!userId || userId.length < 1)
    {
        return res.json({code: -1, message: 'Please provide the confirmation code sent to you'});
    }
    else
    {
        User.findOne({_id: userId}).exec((err, user) =>
        {
            if (err || user == null)
            {
                return res.json({code: -1, message: 'An internal server error was encountered. Please try again later'});
            }
            else
            {
                if (user.phoneCode !== phoneCode)
                {
                    return res.json({code: -1, message: 'Wrong verification code'});
                }
                else
                {
                    let min = (new Date().getMinutes() - user.phoneCodeGeneratedAt.getMinutes()) * 60;
                    console.log('seconds');
                    console.log(min);
                    if (min > 60)
                    {
                        let phoneCode = Math.floor(1000 + Math.random() * 9000);
                        let code = phoneCode.length > 4? phoneCode.substring(0, 4) : phoneCode;
                        user.phoneCode = code;
                        user.phoneCodeGeneratedAt = new Date();
                        user.save((err, updatedUser) =>
                        {
                            if (!err)
                            {
                                let message = 'Your new phone verification code is: ' + code;
                                twilioClient.messages.create({
                                    to: user.phoneNumber,
                                    from: '+2347011988054',
                                    body: message,
                                }).then(message =>
                                {
                                    return res.json({code: 5, phoneVerified: false, message:`A new verification code has been sent to the provided phone number.\n Be sure to use it within the next one minute`});

                                }).catch(function(err)
                                {
                                    return res.json({code: -1, phoneVerified: false, message:`An error was encountered. \nA fresh verification code could not be sent to you. Please try again later`});
                                });

                            }
                            else
                            {
                                logger.error(err);
                                return res.json({code: -1, phoneVerified: false, message: `An error was encountered and process terminated. Please try again later`});
                            }
                        });
                    }
                    else
                     {
                        user.phoneNumberConfirmed = true;
                        user.datePhoneConfirmed = new Date();
                        user.save((err, updatedUser) =>
                        {
                            if (!err)
                            {
                                return res.json({code: 5, message:`Phone verification was successful`, phoneVerified: true});
                            }
                            else
                            {
                                logger.error(err);
                                return res.json({code: -1, message: `An error was encountered and process terminated. Please try again later`, phoneVerified: false});
                            }
                        });
                    }
                }
            }
        })
    }
}

function forgotPassword (req, res)
{
    if (!req.body.email)
    {
        return res.json({code: -1, message: `Please provide your Email`});
    }
    else{
        User.findOne({ email: req.body.email }).exec((err, user) =>
        {
            if (err)
            {
                logger.error(err);
                return res.json({code: -1, message: `Your request could not be completed now due to an unknown error. Please try again later.`});
            }
            else if (user == null)
            {
                return res.json({code: -1, message: `The provided Email could not be recognised. Please ensure you typed it correctly`});
            }
            else
            {
                let tokenData =
                {
                    email: user.email,
                    id: user._id
                };
                common.sendForgotPasswordMail(user.email, Jwt.sign(tokenData, config.key.privateKey)).then((response) =>
                {
                    if(response.error)
                    {
                        console.log(response.error);
                        return res.json({message: `Your request could not be completed now due to an unknown error. Please ensure the provided Email is correct and then try again later.`, code: -1});
                    }
                    else
                    {
                        return res.json({message: `A password request verification link has been sent to your Email. Please click on the provided link within the next 24 hours to effect changing your password. `, code: 5});
                    }
                });
            }
        })
    }

}

function resetPassword (req, res)
{
    if(!req.body.auth)
    {
        return res.json({code: -1, message: `An unknown error was encountered. Please try again later`});
    }
    else
    {
        Jwt.verify(req.body.auth, config.key.privateKey, (err, decoded) =>
        {
            if(err)
            {
                if(err.JsonWebTokenError.toLowerCase().contains('expired'))
                {
                    //Send a fresh password reset Email
                    let tokenData =
                    {
                        email: decoded.email,
                        id: decoded.id
                    };

                    common.sendForgotPasswordMail(decoded.email, Jwt.sign(tokenData, config.key.privateKey)).then((response) =>
                    {
                        if(response.error)
                        {
                            res.json({code: -1, message: `An unknown error was encountered. Please try again later`});
                        }
                        else
                        {
                            res.json({code: -1, message: `The password reset link has expired. A fresh one has been sent to your mail. <br/>Please try clicking on the new link within the next 24 hours to reset your password.`});
                        }
                    });

                }
                else
                {
                    logger.error(err);
                    res.json({code: -1, message: `An unknown error was encountered. Please try again later`});
                }
            }
            else
            {
                User.findOne({email: decoded.email}).exec((err, user) =>
                {
                    if (err)
                    {
                        logger.error(err);
                        console.log(err);
                        res.json({code: -1, message: `An unknown error was encountered. Please try again later`});
                    }
                    else if (user === null)
                    {
                        return res.json({code: -1, message: `Your Email could not be recognised`});
                    }
                    else
                    {
                        let tokenData =
                        {
                            email: user.email,
                            id: user.id
                        };
                        
                        var resetToken = (Jwt.sign(tokenData, config.key.privateKey)).toString();
                        return res.json({code: 5, message: `Welcome back. <br>Please provide your new password to continue`, sci: resetToken, email: user.email});
                    }
                })
            }
        });
    }

}

function changePassword (req, res)
{
    if(!req.body.sci)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please try again later.'});
    }
    else
    {
        const sci = req.body.sci;
        Jwt.verify(sci, config.key.privateKey, (err, decoded) =>
        {
            if(err)  return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            else if(decoded.email !== req.body.email) 
            {
                return res.json({code: -1, message: `The provided Email is inconsistent with the one that requested a password reset. <br/> Please ensure you typed the correct one and try again.`});
            }
            else
            {
                User.findOne({email: req.body.email}).exec((err, user) => 
                {
                    if (err || user.id !== decoded.id)
                    {
                        logger.error(err);
                        return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
                    }
                    else if (user == null)
                    {
                        return res.json({code: -1, message: `The provided Email could not be recognised`});
                    }
                    else if (req.body.password !== req.body.confirmPassword)
                    {
                        return res.json({code: -1, message: `The Passwords did not match`});
                    }
                    else
                    {
                        let hashProduced = false;
                        bcrypt.hash(req.body.password, 10, function (err, hash)
                        {
                            if (!err)
                            {
                                user.password = hash;
                                user.save((err, user) =>
                                {
                                    if (err)
                                    {
                                        logger.error(err);
                                        return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
                                    }
                                    else
                                    {
                                        return res.json({code: 5, message: `Your password was successfully changed. <br/>You can now log in with your new password.`});
                                    }
                                })
                            }
                            else
                            {
                                return res.json({id: '', code: -1, message: 'Your password could not be changed at this time. Please try again later'})
                            }
                        });

                    }
                });
            }
        })
    }
}

function addUserSkill (req, res)
{
    if(req.body === undefined || req.body.name.length < 1 || req.body.geekId === undefined || req.body.geekId === null || req.body.geekId.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please provide all required fields and try again later.'});
    }
    else
    {
        let skill = req.body;
        let geekId = skill.geekId;
        let nameUpper = skill.name.replace(' ', '').toUpperCase();
        let specialties = [];
        let skills = [];
        User.findOne({_id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                Skill.findOne({nameUpper: nameUpper}).exec((err, skillInfo) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
                    }
                    else if (skillInfo == null)
                    {
                        let sk = new Skill({name: skill.name, nameUpper: nameUpper});
                        sk.save((err, savedSkill) =>
                        {
                            if (err || !savedSkill)
                            {
                                resolve({ id: '', code: -1, message: 'Process failed. Please try again later'});
                            }
                            else
                            {
                                let ee = user.topSpecialties.filter(function(s)
                                {
                                    return s.skill === savedSkill.id;
                                });
                                if(ee.length < 1)
                                {
                                    user.topSpecialties.push({skill: savedSkill.id, level: skill.level});
                                    user.save((err, usr) =>
                                    {
                                        if (err)
                                        {
                                            return res.json({code: 5, message: 'Process failed. Please try again later'})
                                        }
                                        else
                                        {
                                            User.findOne({_id: geekId}).populate('topSpecialties.skill').exec((err, user) =>
                                            {
                                                if(user.topSpecialties !== undefined && user.topSpecialties !== null && user.topSpecialties.length > 0)
                                                {
                                                    user.topSpecialties.forEach((sk, i) =>
                                                    {
                                                        specialties.push({skill: sk.skill._id, name: sk.skill.name, level: sk.level});
                                                        skills.push(sk.skill);
                                                    });
                                                }
                                                return res.json({code: 5, skillId: savedSkill.id, specialties: specialties, skills: skills,  message: `Process was successful`});
                                            });

                                        }
                                    });
                                }
                                else
                                {
                                    User.findOne({_id: geekId}).populate('topSpecialties.skill').exec((err, user) =>
                                    {
                                        if(user.topSpecialties !== undefined && user.topSpecialties !== null && user.topSpecialties.length > 0)
                                        {
                                            user.topSpecialties.forEach((sk, i) =>
                                            {
                                                specialties.push({skill: sk.skill._id, name: sk.skill.name, level: sk.level});
                                                skills.push(sk.skill);
                                            });
                                        }
                                        return res.json({code: 5, skillId: savedSkill.id, specialties: specialties, skills: skills,  message: `Process was successful`});
                                    });
                                }

                            }
                        });
                    }
                    else
                    {
                        let ee = user.topSpecialties.filter(function(s){
                            return s.skill === skillInfo.id;
                        });
                        if(ee.length < 1)
                        {
                            user.topSpecialties.push({skill: skillInfo.id, level: skill.level});
                            user.save((err, usr) =>
                            {
                                if (err)
                                {
                                    logger.error(err);
                                    return res.json({code: -1, message: 'Process failed. Please try again later'})
                                }
                                else
                                {
                                    User.findOne({_id: geekId}).populate('topSpecialties.skill').exec((err, user) =>
                                    {
                                        if(user.topSpecialties !== undefined && user.topSpecialties !== null && user.topSpecialties.length > 0)
                                        {
                                            user.topSpecialties.forEach((sk, i) =>
                                            {
                                                specialties.push({skill: sk.skill._id, name: sk.skill.name, level: sk.level});
                                                skills.push(sk.skill);
                                            });
                                        }
                                        return res.json({code: 5, skillId: skillInfo.id, specialties: specialties, skills: skills,  message: `Process was successful`});
                                    });
                                }
                            });
                        }
                        else
                        {
                            User.findOne({_id: geekId}).populate('topSpecialties.skill').exec((err, user) =>
                            {
                                if(user.topSpecialties !== undefined && user.topSpecialties !== null && user.topSpecialties.length > 0)
                                {
                                    user.topSpecialties.forEach((sk, i) =>
                                    {
                                        specialties.push({skill: sk.skill._id, name: sk.skill.name, level: sk.level});
                                        skills.push(sk.skill);
                                    });
                                }
                                return res.json({code: 5, skillId: skillInfo.id, specialties: specialties, skills: skills,  message: `Process was successful`});
                            });
                        }
                    }
                });
            }
        });
    }
}

function updateUserSkill (req, res)
{
    if(req.body === undefined || req.body.name.length < 1 || req.body.geekId === undefined || req.body.geekId === null || req.body.geekId.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please provide all required fields and try again later.'});
    }
    else
    {
        let skill = req.body;
        let geekId = skill.geekId;
        let nameUpper = skill.name.replace(' ', '').toUpperCase();
        User.findOne({_id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                logger.error(err);
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                Skill.findOne({_id: skill.skill}).exec((err, s) =>
                {
                    if (err)
                    {
                        logger.error(err);
                        return res.json({
                            code: -1,
                            message: `Your request could not be completed at this time. <br/>Please try again later`
                        });
                    }
                    else if (s == null)
                    {
                        return res.json({id: '', code: -1, message: 'Process failed. Please try again later'});
                    }
                    else
                    {
                        s.name = skill.name;
                        s.nameUpper = nameUpper;
                        s.save((err, sS) =>
                        {
                            if (err || sS === undefined || sS === null)
                            {
                                logger.error(err);
                                return res.json({id: '', code: -1, message: 'Process failed. Please try again later'})
                            }
                            else
                            {
                                let specialties = [];
                                let skills = [];
                                User.findOne({_id: geekId}).populate('topSpecialties.skill').exec((err, user) =>
                                {
                                    if(user.topSpecialties !== undefined && user.topSpecialties !== null && user.topSpecialties.length > 0)
                                    {
                                        user.topSpecialties.forEach((sk, i) =>
                                        {
                                            specialties.push({skill: sk.skill._id, name: sk.skill.name, level: sk.level});
                                            skills.push(sk.skill);
                                        });
                                    }
                                    return res.json({code: 5, skillId: sS.id, specialties: specialties, skills: skills,  message: `Process was successful`});
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}

function processFriend (req, res)
{
    if(req.body.friend === undefined || req.body.friend === null || req.body.friend.id.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please try again later.'});
    }
    else
    {
        let friend = req.body.friend;
        let geekId = friend.geekId;

        User.findOne({id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                logger.error(err);
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                let ee = user.friends.filter(function(f)
                {
                    return f.userId === friend.id;
                });
                if(ee.length < 1)
                {
                    user.friends.push({userId: friend.id, isMentor: friend.isMentor});
                    user.save((err, usr) =>
                    {
                        if (err)
                        {
                            logger.error(err);
                            return res.json({code: -1, message: 'Process failed. Please try again later'})
                        }
                        else
                        {
                            return res.json({code: 5, friendId: friend.id,  message: `Process was successful`});
                        }
                    });
                }
                else{
                    return res.json({code: 5, friendId: friend.id,  message: `Process was successful`});
                }
            }
        });
    }
}

function processServiceRecommendation (req, res)
{
    if(req.body.serviceRecommendation === undefined || req.body.serviceRecommendation === null || req.body.serviceRecomendation.serviceId.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please try again later.'});
    }
    else
    {
        let serviceRecommendation = req.body.serviceRecommendation;
        let geekId = serviceRecommendation.geekId;

        User.findOne({id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                logger.error(err);
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                let ee = user.recommendedServices.filter(function(s)
                {
                    return s.serviceId === serviceRecommendation.serviceId;
                });

                if(ee.length < 1)
                {
                    user.recommendedServices.push({dateClicked: null, isClicked: false, dateRecommended: new Date(), serviceId: serviceRecommendation.serviceId, recommendedBy: serviceRecommendation.recommendedBy});
                    user.save((err, usr) =>
                    {
                        if (err)
                        {
                            logger.error(err);
                            return res.json({code: -1, message: 'Process failed. Please try again later'})
                        }
                        else
                        {
                            return res.json({code: 5, serviceId: serviceRecommendation.serviceId,  message: `Process was successful`});
                        }
                    });
                }
                else{
                    return res.json({code: 5, serviceId: serviceRecommendation.serviceId,  message: `Process was successful`});
                }
            }
        });
    }
}

function processCraftRecommendation (req, res)
{
    if(req.body.craftRecommendation === undefined || req.body.craftRecommendation === null || req.body.craftRecommendation.craftId.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please try again later.'});
    }
    else
    {
        let craftRecommendation = req.body.craftRecommendation;
        let geekId = craftRecommendation.geekId;

        User.findOne({id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                logger.error(err);
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                let ee = user.recommendedCrafts.filter(function(s)
                {
                    return s.craftId === craftRecommendation.craftId;
                });

                if(ee.length < 1)
                {
                    user.recommendedCrafts.push({dateClicked: null, isClicked: false, dateRecommended: new Date(), craftId: craftRecommendation.craftId, recommendedBy: craftRecommendation.recommendedBy});
                    user.save((err, usr) =>
                    {
                        if (err)
                        {
                            logger.error(err);
                            return res.json({code: -1, message: 'Process failed. Please try again later'})
                        }
                        else
                        {
                            return res.json({code: 5, craftId: craftRecommendation.craftId,  message: `Process was successful`});
                        }
                    });
                }
                else{
                    return res.json({code: 5, craftId: craftRecommendation.craftId,  message: `Process was successful`});
                }
            }
        });
    }
}

function updateServiceRecommendationClick (req, res)
{
    if(req.body.serviceId === undefined || req.body.serviceId === null || req.body.serviceId.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please try again later.'});
    }
    else
    {
        let serviceId = req.body.serviceId;
        let geekId = req.body.geekId;

        User.findOne({id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                logger.error(err);
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                let ee = user.recommendedServices.filter(function(s)
                {
                    return s.serviceId === serviceId;
                });

                if(ee.length < 1)
                {
                    return res.json({code: -1, message: `Process failed. Please try again later`});
                }
                else
                {
                    let service = ee[0];
                    service.dateClicked = new Date();
                    service.isClicked = true;

                    user.save((err, usr) =>
                    {
                        if (err)
                        {
                            logger.error(err);
                            return res.json({code: -1, message: 'Process failed. Please try again later'})
                        }
                        else
                        {
                            return res.json({code: 5, serviceId: serviceId,  message: `Process was successful`});
                        }
                    });
                }
            }
        });
    }
}

function updateCraftRecommendationClick (req, res)
{
    if(req.body.craftId === undefined || req.body.craftId === null || req.body.craftId.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please try again later.'});
    }
    else
    {
        let craftId = req.body.craftId;
        let geekId = req.body.geekId;

        User.findOne({id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                logger.error(err);
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                let ee = user.recommendedCrafts.filter(function(s)
                {
                    return s.craftId === craftId;
                });

                if(ee.length < 1)
                {
                    return res.json({code: -1, message: `Process failed. Please try again later`});
                }
                else
                {
                    let craft = ee[0];
                    craft.dateClicked = new Date();
                    craft.isClicked = true;

                    user.save((err, usr) =>
                    {
                        if (err)
                        {
                            logger.error(err);
                            return res.json({code: -1, message: 'Process failed. Please try again later'})
                        }
                        else
                        {
                            return res.json({code: 5, craftId: craftId,  message: `Process was successful`});
                        }
                    });
                }
            }
        });
    }
}

function processEducation (req, res)
{
    if(req.body.education === undefined || req.body.education === null || req.body.education.schoolName.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please try again later.'});
    }
    else
    {
        let school = req.body.school;
        let geekId = school.geekId;

        User.findOne({id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                logger.error(err);
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                user.education =
                {
                    schoolName: school.schoolName,
                    degree: school.degree,
                    course: school.course,
                    graduationYear: school.graduationYear,
                    country: school.country
                };

                user.save((err, usr) =>
                {
                    if (err)
                    {
                        logger.error(err);
                        return res.json({code: -1, message: 'Process failed. Please try again later'})
                    }
                    else
                    {
                        return res.json({code: 5,  message: `Process was successful`});
                    }
                });
            }
        });
    }
}

function processLocation (req, res)
{
    if(req.body.location === undefined || req.body.location === null || req.body.location.country.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please try again later.'});
    }
    else
    {
        let location = req.body.location;
        let geekId = location.geekId;

        User.findOne({id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                logger.error(err);
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                user.location =
                {
                    address1: location.address1,
                    address2: location.address2,
                    cityId: location.cityId
                };

                user.save((err, usr) =>
                {
                    if (err)
                    {
                        logger.error(err);
                        return res.json({code: -1, message: 'Process failed. Please try again later'})
                    }
                    else
                    {
                        return res.json({code: 5,  message: `Process was successful`});
                    }
                });
            }
        });
    }
}

function saveGeekNames (req, res)
{
    if(req.body === undefined || req.body.firstName.length < 1 || req.body.lastName.length < 1 || req.body.geekId === undefined || req.body.geekId === null || req.body.geekId.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please provide all required fields and try again later.'});
    }
    else
    {
        let geek = req.body;
        let geekId = geek.geekId;
        User.findOne({_id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                user.firstName = geek.firstName;
                user.lastName = geek.lastName;
                user.save((err, usr) =>
                {
                    if (err)
                    {
                        return res.json({code: 5, message: 'Process failed. Please try again later'})
                    }
                    else
                    {
                        return res.json({code: 5, message: `Process was successful`});
                    }
                });
            }
        });
    }
}

function saveProfessionalCaption (req, res)
{
    if(req.body === undefined || req.body.professionalCaption.length < 1 || req.body.geekId === undefined || req.body.geekId === null || req.body.geekId.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please provide all required field(s) and try again later.'});
    }
    else
    {
        let geek = req.body;
        let geekId = geek.geekId;
        User.findOne({_id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                user.professionalCaption = geek.professionalCaption;
                user.save((err, usr) =>
                {
                    if (err)
                    {
                        return res.json({code: 5, message: 'Process failed. Please try again later'})
                    }
                    else
                    {
                        return res.json({code: 5, message: `Process was successful`});
                    }
                });
            }
        });
    }
}

function saveLanguage (req, res)
{
    if(req.body === undefined || req.body.languageProficiency.length < 1 || req.body.languageName.length < 1 || req.body.geekId === undefined || req.body.geekId === null || req.body.geekId.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please provide all required fields and try again later.'});
    }
    else
    {
        let language = req.body;
        let geekId = language.geekId;
        User.findOne({_id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                let lns = user.languages.filter((l) =>
                {
                    return l.name.toLowerCase() === language.languageName.toLowerCase();
                });

                if(lns.length < 1)
                {
                    user.languages.push({name: language.languageName, proficiency: language.languageProficiency});
                }
                else
                {
                    for (var i = 0; i < user.languages.length; i++)
                    {
                        if(l.name.toLowerCase() === language.languageName.toLowerCase())
                        {
                            user.languages[i].proficiency = language.languageProficiency;
                        }
                    }
                }
                user.save((err, usr) =>
                {
                    if (err)
                    {
                        return res.json({code: 5, message: 'Process failed. Please try again later'})
                    }
                    else
                    {
                        return res.json({code: 5, languages: user.languages, message: `Process was successful`});
                    }
                });
            }
        });
    }
}

function saveSummary (req, res)
{
    if(req.body === undefined || req.body.summary.length < 1 || req.body.geekId === undefined || req.body.geekId === null || req.body.geekId.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please provide all required field(s) and try again later.'});
    }
    else
    {
        let geek = req.body;
        let geekId = geek.geekId;
        User.findOne({_id: geekId}).exec((err, user) =>
        {
            if (err || user === null)
            {
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                user.summary = geek.summary;
                user.save((err, usr) =>
                {
                    if (err)
                    {
                        return res.json({code: 5, message: 'Process failed. Please try again later'})
                    }
                    else
                    {
                        return res.json({code: 5, message: `Process was successful`});
                    }
                });
            }
        });
    }
}

function addEducation (req, res)
{
    if(req.body === undefined || req.body.degree.length < 1 || req.body.course.length < 1 || req.body.graduationYear.length < 1 || req.body.institution.length < 1 || req.body.country.length < 1 || req.body.geek === undefined || req.body.geek === null || req.body.geek.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please provide all required fields and try again later.'});
    }
    else
    {
        let education = req.body;
        let geekId = education.geek;
        
        User.findOne({_id: geekId}).populate({path: 'academics', populate: { path: 'country', select: ['_id', 'name']}}).exec((err, user) =>
        {
            if (err || user === null)
            {
                return res.json({code: -1, message: `Your request could not be completed at this time. <br/>Please try again later`});
            }
            else
            {
                let finder = { $and: [ {geek: geekId}, { $or: [{ degree: { "$regex": education.degree, "$options": "i" } }, { course: { "$regex": education.course, "$options": "i" }}]}]};
                Academic.findOne(finder).exec((err, academicInfo) =>
                {
                    if (err)
                    {
                        return res.json({
                            code: -1,
                            message: `Your request could not be completed at this time. <br/>Please try again later`
                        });
                    }
                    else if (academicInfo == null)
                    {
                        let academic = new Academic(education);
                        academic.save((err, ac) =>
                        {
                            if (err)
                            {
                                return res.json({code: -1, message: 'Process failed. Please try again later'})
                            }
                            else
                            {
                                user.academics.push(ac._id);
                                user.save((err, usr) =>
                                {
                                    if (err)
                                    {
                                        return res.json({code: -1, message: 'Process failed. Please try again later'})
                                    }
                                    else 
                                    {
                                        User.findOne({_id: geekId}).populate({path: 'academics', populate: { path: 'country', select: ['_id', 'name']}}).exec((err, user) =>
                                        {
                                            return res.json({code: 5, academics: user.academics, message: `Process was successful`});
                                        });
                                    }
                                });                               
                            }
                        });
                    }
                    else
                    {
                        let es = user.academics.filter(function(e) {
                            return e === academicInfo._id;
                        });
                        if(es.length < 1)
                        {
                            user.academics.push(academicInfo._id);
                            user.save((err, usr) =>
                            {
                                if (err)
                                {
                                    return res.json({code: -1, message: 'Process failed. Please try again later'})
                                }
                                else
                                {
                                    return res.json({code: 5, academics: user.academics, message: `Process was successful`});
                                }
                            });
                        }
                    }
                });
            }
        });
    }
}

function updateEducation (req, res)
{
    if(req.body === undefined || req.body.degree.length < 1 || req.body.course.length < 1 || req.body.graduationYear.length < 1 || req.body.institution.length < 1 || req.body.country.length < 1 || req.body.geek === undefined || req.body.geek === null || req.body.geek.length < 1)
    {
        return res.json({code: -1, message: 'Your request could not be completed at this time. Please provide all required fields and try again later.'});
    }
    else
    {
        let education = req.body;
        let geekId = education.geek;
        Academic.findOne({_id: education.id}).exec((err, academicInfo) =>
        {
            if (err)
            {
                logger.error(err);
                return res.json({
                    code: -1,
                    message: `Your request could not be completed at this time. <br/>Please try again later`
                });
            }
            else if (academicInfo == null)
            {
                return res.json({id: '', code: -1, message: 'Process failed. Please try again later'});
            }
            else
            {
                academicInfo.country = education.country;
                academicInfo.degree = education.degree;
                academicInfo.course = education.course;
                academicInfo.graduationYear = education.graduationYear;
                academicInfo.institution = education.institution;

                academicInfo.save((err, sS) =>
                {
                    if (err || sS === undefined || sS === null)
                    {
                        logger.error(err);
                        return res.json({id: '', code: -1, message: 'Process failed. Please try again later'})
                    }
                    else
                    {
                        User.findOne({_id: geekId}).populate({path: 'academics', populate: { path: 'country', select: ['_id', 'name']}}).exec((err, user) =>
                        {
                            return res.json({code: 5, academics: user.academics, message: `Process was successful`});
                        });
                    }
                });
            }
        });
    }
}

 function getClientIp(req, res)
 {
    let ip = (req.headers["X-Forwarded-For"] || req.headers["x-forwarded-for"] || '').split(',')[0] || req.client.remoteAddress;
     return res.json({code: (!ip || ip.length < 1)? -1 : 5, ip: ip.replace('::ffff:', '')});
 }

async function getGeekLocation (req, res) {
    let ip = req.query.ip;
    if (ip === undefined || ip.length < 1 || ip.length < 1) {
        return res.json({code: -1, message: 'User IP could not be retrieved.'});
    }
    else {
        let tp = (ip === ':ffff:127.0.0.1' || '127.0.0.1') ? '' : '&ip=' + ip;
        let url = config.ipInfoDb.api + config.ipInfoDb.apiKey + tp;
       let fg = await fetch(url,
            {
                method: "GET",
                headers:
                    {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    }
            }).then(data => data.json());
       console.log('\n');
       console.log(fg);
        return res.json({code: 5, message: data.json()});
    }
}

module.exports = init;


// let tp = (ip === ':ffff:127.0.0.1' || '127.0.0.1') ? '' : '&ip=' + ip;
// let url = config.ipInfoDb.api + config.ipInfoDb.apiKey + tp;
// let options = {
//     host: 'http://api.ipinfodb.com',
//     path: '/v3/ip-city/?key=3fd0b41eb8831956258c68830f27f6c7a751fb7df8c0a1a9b71815ecac0705ca',
//     method: 'GET'
// };
//
// http.request(options, function(res) {
//     console.log('STATUS: ' + res.statusCode);
//     console.log('HEADERS: ' + JSON.stringify(res.headers));
//     res.setEncoding('utf8');
//     res.on('data', function (chunk)
//     {
//         console.log('BODY: ' + chunk);
//         return res.json({code: 5, msg: chunk});
//     });
// }).end();