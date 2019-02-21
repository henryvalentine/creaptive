let func = function(state = '', action = {})
{
    return action.type === 'FEATURE' ? action.payload : state
};

export default func;