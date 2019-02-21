import {
    GraphQLObjectType,
    GraphQLList,
    GraphQLInt,
} from 'graphql';
import ServiceType from './service/serviceType';
import CraftType from './craft/craftType';

var serviceOutPut = new GraphQLObjectType({
  name: 'serviceOutPut',
  fields:
  {
    items:
    {
      type: new GraphQLList(ServiceType)
    },
    totalItems:
    {
      type: GraphQLInt
    }
  }
});

var craftOutPut = new GraphQLObjectType({
  name: 'craftOutPut',
  fields:
  {
    items:
    {
      type: new GraphQLList(CraftType)
    },
    totalItems:
    {
      type: GraphQLInt
    }
  }
});


export default new GraphQLObjectType({
  name: 'craftAndServiceType',
  fields:
  {
    services: {type: serviceOutPut},
    crafts: {type: craftOutPut}
  }
});


// export default new GraphQLObjectType({
//   name: 'craftAndServiceType',
//   fields:
//   {
//     services: {type: new GraphQLList(ServiceType)},
//     serviceTotalItems:{ type: GraphQLInt},
//     crafts: {type: new GraphQLList(CraftType)},
//     craftTotalItems: {type: GraphQLInt}
//   }
// });