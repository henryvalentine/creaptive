import {
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLList,
    GraphQLNonNull,
    GraphQLFloat
} from 'graphql';
import GraphQLDate from 'graphql-date';

var details = new GraphQLObjectType({
  name: 'details',
  fields: {
    label: { type: GraphQLString },
    description: { type: GraphQLString },
    priceTag: { type: GraphQLFloat }
  }
});

export default new GraphQLObjectType({
  name: 'craft',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    label: {
      type: new GraphQLNonNull(GraphQLString)
    },
    bannerImage: {
      type: GraphQLString
    },
    creativeTypeId: {
      type: GraphQLString
    },
    description: {
      type: new GraphQLNonNull(GraphQLString)
    },
    addedBy: {
      type: GraphQLString
    },
    craftRegionId: {
      type: GraphQLString
    },
    dateProfiled:
    {
      type: GraphQLString
    },
    priceTag: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    frontViewImagePath:
    {
      type:  GraphQLString
    },
    leftViewImage:
    {
      type:  GraphQLString
    },
    rightViewImagePath:
    {
      type:  GraphQLString
    },
    rearViewImagePath:
    {
      type:  GraphQLString
    },
    topViewImagePath:
    {
      type:  GraphQLString
    },
    bottomViewImagePath:
    {
      type:  GraphQLString
    },
    details: {
      type: new GraphQLList(details)
    }
  }
});