let func = function (state = '', action = {})
{
   return action.type === 'COMPLAINT_TYPE' ? action.payload : state;
};

export default func;