import {
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLNonNull
} from 'graphql';


export default new GraphQLInputObjectType({
  name: 'userAccess',
  fields: {
    id: {
    type: GraphQLID
  },
    email: {
      type: new GraphQLNonNull(GraphQLString)
    },
    password: {
      type: new GraphQLNonNull(GraphQLString)
    },
    geekName: {
      type: new GraphQLNonNull(GraphQLString)
    },
    confirmPassword: {
      type: GraphQLString
    },
    rememberMe: {
      type: GraphQLBoolean
    }
  }
});
