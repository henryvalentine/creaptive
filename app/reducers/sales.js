let func = function (state = {buyer: ''}, action = {})
{
   return action.type === 'SALES' ? action.payload : state;
};

export default func;