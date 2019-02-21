let func = function (state = {geek: ''}, action = {})
{
   return action.type === 'SERVICE' ? action.payload : state;
};

export default func;