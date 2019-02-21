import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt
} from 'graphql';


export default new GraphQLObjectType({
  name: 'feedback',
  fields: {
    id: {
    type: GraphQLID
  },
    code:
    {
      type: GraphQLInt
    },
    message: {
      type: GraphQLString
    }
  }
});
