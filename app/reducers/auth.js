let func = function (state = '', action = {})
{
   return action.type === 'AUTH' ? action.payload : state;
};

export default func;