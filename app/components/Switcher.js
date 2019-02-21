import React from 'react';
import { connect } from 'react-redux';
import { TransitionGroup, Transition } from 'transition-group';
import universal from 'react-universal-component';
// import Loading from './Loading';
import Err from './Error';
// import isLoading from '../selectors/isLoading';

const UniversalComponent = universal(({ page }) => import(`./${page}`), {
  minDelay: 500,
  error: Err
});

const Switcher = ({ page}) =>
  <TransitionGroup
    className="switcher"
    duration={500}
    prefix='fade'
  >
    <Transition key={page}>
      <UniversalComponent page={page} />
    </Transition>
  </TransitionGroup>

const mapState = ({ page, ...state }) => ({
  page
});

export default connect(mapState)(Switcher);