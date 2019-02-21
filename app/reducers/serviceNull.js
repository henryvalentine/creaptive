let func = function (state = {service: {}}, action = {})
{
   return action.type === 'SERVICE_NULL' ? action.payload : state;
};

export default func;