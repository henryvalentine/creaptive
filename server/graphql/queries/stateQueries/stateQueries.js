import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';

import StateType from '../../types/state/stateType';

let State = {};

module.exports = function(mongoose)
{
  State = mongoose.model('State');
  return{
    getStatesByCountry: getStatesByCountry,
    getStates: getStates,
    getStateById: getStateById
  }
};

const getStatesByCountry =
{
  type: new GraphQLList(StateType),
  args: {
    countryId: {
      name: 'countryId',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve (root, params, options)
  {
    return State.find({countryId: params.countryId});
  }
};

const getStates =
{
  type: new GraphQLList(StateType),
  args: {
    countryId: {
      name: 'countryId',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve (root, params, options)
  {
    return State.find({countryId: params.countryId});
  }
};

const getStateById =
{
  type: StateType,
  args: {
    stateId: {
      name: 'stateId',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve (root, params, options)
  {
    return State.findOne({_id: params.stateId});
  }
};