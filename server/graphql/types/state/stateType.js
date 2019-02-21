import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLNonNull
} from 'graphql';

export default new GraphQLObjectType({
  name: 'state',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    countryId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  }
});
