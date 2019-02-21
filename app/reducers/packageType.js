let func = function(state = '', action = {})
{
    return action.type === 'TYP' ? action.payload : state
};

export default func;