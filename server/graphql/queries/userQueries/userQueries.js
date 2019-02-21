import {
  GraphQLList,
  GraphQLNonNull,
GraphQLString,
  GraphQLID
} from 'graphql';

import UserType from '../../types/user/userType';
import userInputType from '../../types/user/userInputType';
import UserAccessType from '../../types/user/userAccessInputType';
import logger from '../../../logger';

// let User = {};
//
// module.exports = function(mongoose)
// {
//     User = mongoose.model('User');
//     return{
//         getUsers: getUsers,
//         getUserById: getUserById,
//         getStateById: getStateById
//     }
// };

// const getUsers =
// {
//   type: new GraphQLList(UserType),
//   args: {},
//   resolve (root, params, options)
//   {
//     return User.find();
//   }
// };

// const getUserById =
// {
//   type: UserType,
//   args: {
//     userId: {
//       name: 'userId',
//       type: new GraphQLNonNull(GraphQLID)
//     }
//   },
//   resolve (root, params, options)
//   {
//     return User.findOne({_id: params.userId});
//   }
// };
