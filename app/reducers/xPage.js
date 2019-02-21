let func = function(state = '', action = {})
{
    return action.type === 'XPAGE' ? action.payload : state;
};
export default func;