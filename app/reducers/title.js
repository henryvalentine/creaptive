export default (state = 'creaptive', action = {}) =>
{
  switch (action.type)
  {
    case 'HOME':
      return 'creaptive';
    case 'SERVICES':
      return `creaptive: Services`;
    case 'CRAFTS':
      return `creaptive: Handcrafts`;
    case 'COUNTRY':
      return 'creaptive: Country';
    case 'STATE':
      return 'creaptive: State';
    default:
      return state
  }
}

const capitalize = str =>
  str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// RFR automatically changes the document.title for you :)
