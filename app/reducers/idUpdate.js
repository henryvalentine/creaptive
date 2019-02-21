let func = function(state = '', action = {})
{
    return action.type === 'ID_UPDATE' ? action.payload : state;
};
export default func;