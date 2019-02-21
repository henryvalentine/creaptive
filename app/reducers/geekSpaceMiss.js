let func = function (state = '', action = {})
{
   return action.type === 'GEEK_SPACE_MISS' ? action.payload : state;
};

export default func;