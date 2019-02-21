import {
  GraphQLNonNull,
    GraphQLList
} from 'graphql';

import async from 'async';
import bcrypt from 'bcrypt';
import UserType from '../../types/user/userType';
import userInputType from '../../types/user/userInputType';
import UserAccessType from '../../types/user/userAccessInputType';
import feedback from '../../types/feedbackType';
import config from '../../../common/config';
import logger from '../../../logger';
import common from '../../../common/common';
import Jwt from 'jsonWebToken';
import uuidv4 from 'uuid/v4';
let User = '';

module.exports = function(mongoose)
{
  User = mongoose.model('User');
  return{
    addUser: addUser,
    updateUser: updateUser
  }
};

const addUser =
{
  type: feedback,
  args:
  {
    data:
    {
      name: 'data',
      type: new GraphQLNonNull(UserAccessType)
    }
  },
  async resolve (root, params, options)
  {
    return new Promise((resolve, reject) =>
    {
      if (!params.data.email || !params.data.password || !params.data.confirmPassword) {
          resolve({ id: '', code: -1, message: 'Please provide all required fields' });
      }
      else
      {
        if (params.data.password !== params.data.confirmPassword) {
            resolve({ id: '', code: -1, message: 'The passwords do not match' });
        }
        else
        {

          User.findOne({email: params.data.email}).exec((err, existingUser) =>
          {

            if (!existingUser)
            {
              let geekName = params.data.geekName.replace(' ', '');
              let geekNameUpper = geekName.toUpperCase();
              const user = new User({
                email: params.data.email,
                geekName: geekName,
                geekNameUpper: geekNameUpper,
                password: params.data.password,
                dateRegistered: new Date(),
                securityStamp: uuidv4(),
                role: 'user'
              });

              bcrypt.hash(params.data.password, 10, function (err, hash)
              {
                if (err)
                {
                  resolve({id: '', code: -1, message: 'Your account could not be created at this time. Please try again later'})
                }
                else
                {
                  user.password = hash;
                  user.save((err, savedUser) =>
                  {
                    if (!savedUser)
                    {
                      logger.error(err);
                      resolve({id: '', code: -1, message: 'Your account could not be created at this time. Please try again later'})
                    }
                    else
                    {
                      //Send confirmation Email
                      let tokenData =
                      {
                        email: user.email,
                        id: savedUser._id
                      };

                      common.sendVerificationMail(user.email, Jwt.sign(tokenData, config.key.privateKey)).then((res) =>
                      {
                        if(!res.success || !res.success.messageId || res.success.messageId.length < 1)
                        {
                          logger.error(res.error);
                          resolve({id: savedUser._id, role: savedUser.role, geekName: user.geekName, isAuthenticated: true, code: -3, message: 'Your account was successfully created but a verification email could not be sent to you at this time. Please do request for a verification link at your convenience.'})
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
                          resolve({id: savedUser._id, role: savedUser.role, isAuthenticated: true, name: name, userData: userData, code: 5, message: message, geekName: savedUser.geekName});
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
                  email: params.data.email,
                  id: existingUser._id
                };

                common.sendVerificationMail(params.data.email, Jwt.sign(tokenDataz, config.key.privateKey)).then((res) =>
                {
                  let name = existingUser.geekName? existingUser.geekName : existingUser.firstName? existingUser.firstName + ' ' + existingUser.lastName : existingUser.email;
                  if(!res.success || !res.success.messageId || res.success.messageId.length < 1)
                  {
                    logger.error(res.error);

                    let tokenData =
                    {
                      id: existingUser._id, email: existingUser.email, role: existingUser.role, isAuthenticated: true, name: name, dateIn: new Date()
                    };
                    resolve({id: existingUser._id, role: existingUser.role, geekName: existingUser.geekName, isAuthenticated: true, name: name, userData: Jwt.sign(tokenData, config.key.privateKey), code: 3, message: 'Your account has not been activated. A new verification email could not be sent to you at this time. Please do request for a verification link at your convenience.'})
                  }
                  else
                  {
                    const message = 'Your account has not been activated. A new confirmation email has been sent to you.';
                    let tokenData =
                    {
                      id: existingUser._id, email: existingUser.email, role: existingUser.role, isAuthenticated: true, name: name, dateIn: new Date()
                    };
                    let userData = Jwt.sign(tokenData, config.key.privateKey);
                    resolve({id: existingUser._id, role: existingUser.role, geekName: existingUser.geekName, name: name, userData: userData, code: 5, message: message});
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
                resolve({id: existingUser._id, role: existingUser.role, geekName: existingUser.geekName, name: name, userData: userData, isAuthenticated: true, code: 5, message: 'You already have a creaptive account'});
              }
            }
          });
        }
      }
    });

  }
};

const updateUser =
{
  type: UserType,
  args:
  {
    data:
    {
      name: 'data',
      type: new GraphQLNonNull(userInputType)
    }
  },
  async resolve (root, params, options)
  {
    return new Promise((resolve, reject) =>
    {
      try {
        if (!params.data.email || !params.data.id)
        {
          resolve({id: '', code: -1, message: 'An error was encountered and the process was halted. <br/>Please try again later'})
        }
        else
        {
          if (params.data.password !== params.data.confirmPassword)
          {
            resolve({id: '', code: -1, message: 'The passwords do not match'})
          }
          else
          {
            User.findOne({_id: params.data.id}).exec((err, userToUpdate) =>
            {
              if (err)
              {
                resolve({id: '', code: -1, message: 'The passwords do not match'});
              }
              else if (!userToUpdate)
              {
                resolve({id: '', code: -1, message: 'The passwords do not match'});
              }
              else
              {
                userToUpdate.firstName = params.data.firstName;
                userToUpdate.middleName = params.data.middleName;
                userToUpdate.lastName = params.data.lastName;
                userToUpdate.phoneNumber = params.data.phoneNumber;
                userToUpdate.gender = params.params.data.gender;
                userToUpdate.dob = params.params.data.dob;
                userToUpdate.profileImagePath = params.data.profileImagePath;
                userToUpdate.topSpecialties = params.data.topSpecialties;
                userToUpdate.displayName = params.data.displayName;
                userToUpdate.location = params.data.location;

                userToUpdate.save((err, savedUser) =>
                {
                  if (!savedUser)
                  {
                    resolve({id: '', code: -1, message: 'Process could not be completed at this time. Please try again later'})
                  }
                  else
                  {
                    const message = 'Process was successfully completed.';
                    resolve({id: savedUser._id, code: 5, message: message});
                  }
                });
              }
            });
          }
        }
      }
      catch(e)
      {
        console.log(e);
        resolve({id: '', code: -1, message: 'Process could not be completed at this time. Please try again later'})
      }
    });

  }
};