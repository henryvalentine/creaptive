let func = function(state = '', action = {})
{
    return action.type === 'PACKAGE' ? action.payload : state
};

export default func;