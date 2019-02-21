let func = function (state = '', action = {})
{
   return action.type === 'GEEK' ? action.payload : state;
};

export default func;