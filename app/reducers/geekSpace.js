let func = function (state = {geekSpace: {}}, action = {})
{
   return action.type === 'GEEK_SPACE' ? action.payload : state;
};

export default func;