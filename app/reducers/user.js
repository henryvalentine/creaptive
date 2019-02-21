let func = function (state = { role: '', email: '', name: '', isAuthenticated: false, id:'', profileImage: '', psid: '' }, action = {})
{
    return action.type === 'USER' ? action.payload : state;
};

export default func;