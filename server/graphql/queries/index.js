import countryQueries from './countryQueries/countryQueries';
import stateQueries from './stateQueries/stateQueries';
// import userQueries from './userQueries/userQueries';
import CraftAndServiceQueries from './craftAndServiceQueries/craftAndServiceQueries';

const init = function(mongoose)
{
  return {
     ...countryQueries(mongoose),
     ...stateQueries(mongoose),
     //...userQueries(mongoose),
     ...CraftAndServiceQueries(mongoose)
  }
};

module.exports = init;