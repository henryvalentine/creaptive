let func = function (state = {geek: {}}, action = {})
{
   return action.type === 'GEEK_MISS' ? action.payload : state;
};

export default func;