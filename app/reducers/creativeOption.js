let func = function(state = '', action = {})
{
    return action.type === 'OPTION' ? action.payload : state
};

export default func;