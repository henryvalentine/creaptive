/**
 * Created by Jack V on 9/11/2017.
 */
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import App from './components/appFrame'
import { hydrate } from 'react-dom';
import React from 'react';

import { Provider } from 'react-redux'
import createHistory from 'history/createBrowserHistory'
import AppContainer from 'react-hot-loader/lib/AppContainer'
import configureStore from './configureStore'

const history = createHistory();
const { store } = configureStore(history, window.REDUX_STATE);
// console.log(window.REDUX_STATE);
let renderer = () => {hydrate((
    <AppContainer>
        <Provider store={store}>
            <LocaleProvider locale={enUS}>
              <App/>
            </LocaleProvider>
        </Provider>
  </AppContainer>    
), document.getElementById('app'))};

if(process.env.NODE_ENV == 'development' && module.hot) 
{
    if(module.hot)
    {
        if (module.hot) 
        {
            module.hot.accept('./components/appFrame', renderer);
        }
    }
}

renderer();

//for focus-within
(function(window, document){
    'use strict';
    let slice = [].slice;
    let removeClass = function(elem){
        elem.classList.remove('focus-within');
    };
    let update = (function(){
        let running, last;
        let action = function(){
            let element = document.activeElement;
            running = false;
            if(last !== element){
                last = element;
                slice.call(document.getElementsByClassName('focus-within')).forEach(removeClass);
                while(element && element.classList){
                    element.classList.add('focus-within');
                    element = element.parentNode;
                }
            }
        };
        return function(){
            if(!running){
                requestAnimationFrame(action);
                running = true;
            }
        };
    })();
    document.addEventListener('focus', update, true);
    document.addEventListener('blur', update, true);
    update();
})(window, document);

// destination.flg_src = 'img/flags/' + destination.code.toLowerCase() + '.svg';
// (function (){
    // let xhr = new XMLHttpRequest();
    // xhr.open("GET", "//freegeoip.net/json/", true);
    // xhr.withCredentials = true;
    // xhr.onload = function (res)
    // {
    //     let data = JSON.parse(xhr.responseText);
    //     angular.forEach($rootScope.countries, function(c, i)
    //     {
    //         if(c.code === res.country_code)
    //         {
    //             $rootScope.defaultLocation = {country : c, dialCode : c.dial_code, defaultFlag : 'img/flags/' + c.code.toLowerCase() + '.svg' , ip : res.ip };
    //             c.flg_src = 'img/flags/' + c.code.toLowerCase() + '.svg';
    //             $rootScope.lInfo = c;

    //         }
    //     });
    // };
    // xhr.send();
// })();