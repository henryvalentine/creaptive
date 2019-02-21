import {
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull
} from 'graphql';

export default new GraphQLInputObjectType({
  name: 'genericQueryType',
  fields: {
    geekId:
    {
      type: GraphQLString
    },
    searchText:
    {
      type: GraphQLString
    },
    itemsPerPage:
    {
      type: GraphQLInt
    },
    page:
    {
      type: GraphQLInt
    },
    sortField: {
      type: GraphQLString
    },
    sortOrder: {
      type: GraphQLString
    }
  }
});