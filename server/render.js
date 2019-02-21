import React from 'react'
import ReactDOM from 'react-dom/server'
import { Provider } from 'react-redux'
import { flushChunkNames } from 'react-universal-component/server'
import flushChunks from 'webpack-flush-chunks'
import configureStore from './configureStore'
import App from '../app/components/appFrame'
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';

export default ({ clientStats }) => async (req, res, next) => 
{
    // console.log('req.path');
    // console.log(req.path);
  const store = await configureStore(req, res);
  if (!store) return; // no store means redirect was already served

  const app = createApp(App, store);
  const appString = ReactDOM.renderToString(app);
  const stateJson = JSON.stringify(store.getState());
  const chunkNames = flushChunkNames();
  const { js, styles, cssHash } = flushChunks(clientStats, { chunkNames });

  // console.log('REQUESTED PATH:', req.path)
  // console.log('CHUNK NAMES', chunkNames)

  return res.send(
    `<!doctype html>
      <html>
        <head>
        <title>The Skilled and The Creative in Africa</title>
        <meta charset="utf-8">
        <meta content="author" description="creaptive.com">
        <meta name="description" content="A bridge for the gap between skilled and creative hands in Africa and people that need their output.">
        <meta name="author" content="React Toolbox team">
        <meta name="viewport" content="initial-scale=1.0,user-scalable=no,maximum-scale=1,width=device-width">
        <meta name="viewport" content="initial-scale=1.0,user-scalable=no,maximum-scale=1" media="(device-height: 568px)">
        <meta name="apple-mobile-web-app-title" content="Material Console">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="format-detection" content="telephone=no">
        <meta name="HandheldFriendly" content="True">
        <meta http-equiv="cleartype" content="on">  
        ${styles}      
        </head>
        <div id="fb-root"></div>
        <script>window.REDUX_STATE = ${stateJson}</script>
        <script>(function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.10&appId=1124034024355991";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));</script>
        <div id="app">${appString}</div>
        ${cssHash}
        <script type='text/javascript' src='/ui/vendor.js'></script>        
        ${js}
        </body>
      </html>`
  )
}

const createApp = (App, store) =>  
    <LocaleProvider locale={enUS}>
      <Provider store={store}>
        <App/>
      </Provider>
    </LocaleProvider>;
  
  