
let func = function (state = '', action = {})
{
  return action.type === 'SECTIONS' ? action.payload : state;
};

export default func;