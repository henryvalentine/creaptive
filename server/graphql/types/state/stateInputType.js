import {
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLNonNull
} from 'graphql';

export default new GraphQLInputObjectType({
  name: 'stateInput',
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
