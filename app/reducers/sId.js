let func = function(state = '', action = {})
{
    return action.type === 'SID' ? action.payload : state;
};
export default func;