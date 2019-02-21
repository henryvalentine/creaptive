let func = function (state = '', action = {})
{
   return action.type === 'SCO' ? action.payload : state;
};

export default func;