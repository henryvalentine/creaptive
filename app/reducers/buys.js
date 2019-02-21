let func = function (state = {buyer: ''}, action = {})
{
   return action.type === 'BUYS' ? action.payload : state;
};

export default func;