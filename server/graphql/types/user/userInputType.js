import {
  GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLNonNull
} from 'graphql';

import GraphQLDate from 'graphql-date';

export default new GraphQLInputObjectType({
  name: 'userInput',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    firstName: {
      type: new GraphQLNonNull(GraphQLString)
    },
    middleName: {
      type: GraphQLString
    },
    lastName: {
      type: new GraphQLNonNull(GraphQLString)
    },
    email: {
      type: new GraphQLNonNull(GraphQLString)
    },
    phoneNumber: {
      type: GraphQLString
    },
    role: {
      type: GraphQLString
    },
    gender: {
      type: GraphQLString
    },
    dob: {
      type: GraphQLDate
    },
    topSpecialties: {type: new GraphQLList(GraphQLString)},
    displayName: {
      type: new GraphQLNonNull(GraphQLString)
    },
    address1:
    {
      type: new GraphQLNonNull(GraphQLString)
    },
    address2:
    {
      type: GraphQLString
    },
    cityId:
    {
      type: new GraphQLNonNull(GraphQLID)
    }
  }
});


