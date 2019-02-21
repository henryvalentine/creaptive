let func = function(state = '', action = {})
{
    return action.type === 'CATEGORY' ? action.payload : state
};

export default func;