import {
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLNonNull
} from 'graphql';

export default new GraphQLInputObjectType({
  name: 'countryInput',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    currency: {
      type: new GraphQLNonNull(GraphQLString)
    },
    currencyCode: {
      type: new GraphQLNonNull(GraphQLString)
    },
    countryCode: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }
});
