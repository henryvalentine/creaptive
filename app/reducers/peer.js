let func = function(state = '', action = {})
{
    return action.type === 'PEER' ? action.payload : state;
};
export default func;