import {
  GraphQLNonNull,
    GraphQLList
} from 'graphql';

import StateType from '../../types/state/stateType';
import stateInputType from '../../types/state/stateInputType';

import State from '../../../models/state';
module.exports = function(mongoose)
{
  // State = mongoose.model('State');
  return{
    addState: addState,
    addStates: addStates,
    updateState: updateState
  }
};

const addState =
{
  type: StateType,
  args:
  {
    data:
    {
      name: 'data',
      type: new GraphQLNonNull(stateInputType)
    }
  },
  async resolve (root, params, options)
  {
    return new Promise((resolve, reject) => {
      State.findOne({name: params.data.name, countryId: params.data.countryId}, (err, existingState) =>
      {
        if (!existingState)
        {
          const state = new State(params.data);
          state.save((err, savedState) =>
          {
            if (!savedState)
            {
              reject({})
            }
            else
            {
              resolve(savedState);
            }
          });

        }
        else
        {
          resolve(existingState);
        }
      });
    });

  }
};

const addStates =
{
  type: new GraphQLList(StateType),
  args:
  {
    data:
    {
      name: 'data',
      type: new GraphQLList(stateInputType)
    }
  },
  async resolve (root, params, options)
  {
    return new Promise((resolve, reject) =>
    {
      if(params.data.length < 1)
      {
        reject([{}]);
      }
      else
      {
        let processed = [];
        async.each(params.data, (state, callback) =>
        {
          State.findOne({name: state.name, countryId: state.countryId}, (err, existingState) =>
          {
            if (!existingState)
            {
              state.save((err, savedState) =>
              {
                if (!savedState)
                {
                  callback();
                }
                else
                {
                  processed.push(savedState);
                  callback();
                }
              });

            }
            else
            {
              processed.push(existingState);
              callback();
            }
          });
        }, (err)=>
        {
          if( err )
          {
            reject([{}]);
          }
          else
          {
            resolve(processed)
          }
        });

      }
    });
  }
};

const updateState =
{
  type: StateType,
  args:
  {
    data:
    {
      name: 'data',
      type: new GraphQLNonNull(stateInputType)
    }
  },
  async resolve (root, params, options)
  {
    return new Promise((resolve, reject) => {
      State.findOne({_id: params.data.id}, (err, state) =>
      {
        if (!state)
        {
          reject({});
        }
        else
        {
          state.name = params.data.name;
          state.save((err, stateInfo) =>
          {
            if (err)
            {
              reject({});
            }
            else
            {
              resolve(stateInfo);
            }
          });
        }
      });
    });
  }
};
