let func = function(state = '', action = {})
{
    return action.type === 'CATEGORIES' ? action.payload : state
};

export default func;