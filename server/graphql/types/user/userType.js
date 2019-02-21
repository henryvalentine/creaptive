import {
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLList,
    GraphQLNonNull
} from 'graphql';
import GraphQLDate from 'graphql-date';

export default new GraphQLObjectType({
  name: 'user',
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
    emailConfirmed: {
      type: GraphQLBoolean
    },
    phoneNumberConfirmed: {
      type: GraphQLBoolean
    },
    phoneNumber: {
      type: GraphQLString
    },
    role: {
      type: GraphQLString
    },
    password: {
      type: new GraphQLNonNull(GraphQLString)
    },
    issueCount: {
      type: GraphQLInt
    },
    gender: {
      type: GraphQLString
    },
    onlineStatus: {
      type: GraphQLBoolean
    },
    securityStamp: {
      type: new GraphQLNonNull(GraphQLString)
    },
    dob: {
      type: GraphQLDate
    },
    lastSeen: {
      type: GraphQLDate
    },
    dateRegistered: {
      type: new GraphQLNonNull(GraphQLDate)
    },
    profileLastUpdated: {
      type: new GraphQLNonNull(GraphQLDate)
    },
    rating: {
      type: GraphQLInt
    },
    status: {
      type: GraphQLInt
    },
    successfulDealsDelivered: {
      type: GraphQLInt
    },
    numberOfRequestsPosted: {
      type: GraphQLInt
    },
    numberOfJobsPosted: {
      type: GraphQLInt
    },
    profileImagePath: {
      type: GraphQLString
    },
    topSpecialties: {type: new GraphQLList(GraphQLString)},
    displayName:
    {
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
    },
    code: {
      type: GraphQLInt
    },
    message: {
      type: GraphQLString
    }
  }
});