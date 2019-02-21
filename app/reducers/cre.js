let func = function (state = {geek: ''}, action = {})
{
   return action.type === 'CRE' ? action.payload : state;
};

export default func;