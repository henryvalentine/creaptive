/**
 * Created by Jack V on 9/11/2017.
 */

import React from 'react';
import {Layout} from 'antd';
const {Footer} = Layout;

export default class AppFooter extends React.Component{

    constructor(props){super(props)}

    render(){
        return(<Footer style={{ textAlign: 'center' }}>
        creaptive ©2017
    </Footer>)}

}