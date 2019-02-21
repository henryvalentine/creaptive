export default (state = 'next', action = {}) => {
  if (!action.meta || !action.meta.location) {
    return state
  }

  const type = action.type
  const prevType = action.meta.location.prev.type;
  console.log('Nav Action\n\n\n');
  console.log(action);
  // if (type === prevType) 
  // {
  //   return state
  // }
  // if (type === 'HOME') 
  // {
  //   return 'back'
  // }
  // else if (type === 'SERVICES' && prevType === 'HOME') {
  //   return 'next'
  // }
  // else if (type === 'CRAFTS' && prevType === 'HOME') {
  //   return 'next'
  // }
  // else if (type === 'SERVICES' && prevType === 'CRAFTS') {
  //   return 'back'
  // }
  // else if (type === 'CRAFTS' && prevType === 'SERVICES') {
  //   return 'back'
  // }
  // else if (type === 'LOGIN') {
  //   return 'back'
  // }
  // else if (type === 'ADMIN') {
  //   return 'next'
  // }

  return state
}

// this is an example of some fun stuff you can do easily trigger animations
// from state. Look into <TransitionGroup /> within components/Switcher.js
