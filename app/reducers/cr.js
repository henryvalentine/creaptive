let func = function (state = {geek: ''}, action = {})
{
   return action.type === 'CR' ? action.payload : state;
};

export default func;