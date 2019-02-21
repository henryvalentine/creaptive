let func = function(state = '', action = {})
{
    return action.type === 'BUYER' ? action.payload : state;
};
export default func;