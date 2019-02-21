let func = function(state = '', action = {})
{
    return action.type === 'PEERS' ? action.payload : state;
};
export default func;