let func = function (state = '', action = {})
{
   return action.type === 'GEEKS' ? action.payload : state;
};

export default func;