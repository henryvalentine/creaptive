let func = function (state = '', action = {})
{
   return action.type === 'SERVICES' ? action.payload : state;
};

export default func;