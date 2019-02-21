import {
  GraphQLObjectType,
  GraphQLSchema
} from 'graphql';
import {makeExecutableSchema} from 'graphql-tools';
import mutations from './mutations';
import queries from './queries';

module.exports = function(mongoose)
{
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queries(mongoose)
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: mutations(mongoose)
    })
  });
};




