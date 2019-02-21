import { NOT_FOUND } from 'redux-first-router'

export const setUser = (slug) => ({
  type: 'USER',
  payload: slug
});

export const seeGeek = (slug) => ({
  type: 'CRE',
  payload: {slug}
});

export const dispatchAction = (action) => ({
  type: action.type,
  payload: action.payload
});

export const goToPage = (type, location) => ({
  type: type,
  payload: {location}
});

export const navigateLink = (type, payload) => ({
  type: type,
  payload: payload
});