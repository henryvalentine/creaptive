let func = function(state = '', action = {})
{
    return action.type === 'ONLINE' ? action.payload : state;
};
export default func;