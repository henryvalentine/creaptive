let func = function(state = '', action = {})
{
    return action.type === 'COUNTRY' ? action.payload : state
};

export default func;