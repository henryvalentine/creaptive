let func = function (state = {buyer: ''}, action = {})
{
   return action.type === 'DEALS' ? action.payload : state;
};

export default func;