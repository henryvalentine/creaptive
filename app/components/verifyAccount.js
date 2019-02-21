/**
 * Created by Jack V on 9/11/2017.
 */
import React from 'react';
import {Button, Icon, Row, Col, Avatar, Menu} from 'antd';
const {SubMenu} = Menu;
import * as qs from 'query-string';
export default class VerifyAccount extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            verificationStatus: {code: -1, message: 'waiting to verify account...'}
        };
        if(typeof document !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }
    }

    componentWillReceiveProps(nextProps)
    {

    }

    componentDidMount()
    {
        document.getElementById('vMessage').innerHTML = 'waiting to verify account...';
        const search = qs.parse(location.search);
        if(!search || !search.auth || search.auth.length < 1)
        {
            this.setState({
                verificationStatus: {code: -1, message: 'An unknown error was encountered. Please try again later'}
            });
            document.getElementById('vMessage').innerHTML = 'An unknown error was encountered. Please try again later';
        }
        else
        {
            let el = this;
            fetch("/verifyAccount",
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(search)
                }).then(function(response)
                {
                    return response.json();
                })
                .then(function(res)
                {
                    if(res.code > 0)
                    {
                        res.message = res.message + '<br/> You can now sign in to start doing cool stuffs for money.<br/>Welcome on board!'
                    }
                    document.getElementById('vMessage').innerHTML = res.message;
                    el.setState({
                        verificationStatus: res
                    });

                });
        }
    }

    componentWillMount()
    {

    }

    render()
    {
        return(
            <div className="main-content ant-spin-nested-loading" id="mainContent" style={{backgroundColor: '#fff'}}>
                <Row>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <h4 id="vMessage" style={{marginLeft: '30%', marginRight: '30%', marginTop: '18%',color: this.state.verificationStatus.code > 0? 'green': 'orange'}}>

                        </h4>
                    </Col>
                </Row>
            </div>
        );
    }
}
