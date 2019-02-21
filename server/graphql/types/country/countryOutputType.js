import {
    GraphQLObjectType,
    GraphQLList,
    GraphQLInt,
} from 'graphql';
import CountryType from '../../types/country/countryType';
export default new GraphQLObjectType({
  name: 'countryOutputType',
  fields:
  {
    totalItems:
    {
      type: GraphQLInt
    },
    items:
    {
      type: new GraphQLList(CountryType)
    }
  }
});