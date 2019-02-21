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

var requirementQuery = new GraphQLObjectType({
  name: 'requirementQuery',
  fields: {
    label: { type: GraphQLString },
    description: { type: GraphQLString },
    sampleResource: { type: GraphQLString },
    sampleResourcePath: { type: GraphQLString }
  }
});

var detailsQuery = new GraphQLObjectType({
  name: 'detailsQuery',
  fields: {
    label: { type: GraphQLString },
    description: { type: GraphQLString },
    priceTag: { type: GraphQLFloat }
  }
});

export default new GraphQLObjectType({
  name: 'service',
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
    description: {
      type: new GraphQLNonNull(GraphQLString)
    },
    addedBy: {
      type: GraphQLString
    },
    dateProfiled:
    {
      type: GraphQLString
    },
    mainAskingPrice: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    creativeTypeId: {
      type: GraphQLString
    },
    mainDeliveryPeriod: {
      type: GraphQLInt
    },
    numberOfTimesViewed: {
      type: GraphQLInt
    },
    lastModified:
    {
      type: GraphQLDate
    },
    lastViewed: {
      type: GraphQLDate
    },
    hasPackages:
    {
      type: GraphQLBoolean
    },
    customDeliveryPeriod:
    {
      type: GraphQLInt
    },
    customAskingPrice:
    {
      type: GraphQLFloat
    },
    techStacks:
    {
      type: new GraphQLList(GraphQLString)
    },
    requirements:
    {
      type: new GraphQLList(requirementQuery)
    },
    details:
    {
      type: new GraphQLList(detailsQuery)
    }
  }
});