/**
 * Created by Jack V on 9/20/2017.
 */
import React from 'react';
import {Row, Col, Button, Card, Icon} from 'antd';
import sample from '../../images/sample.png';
import * as qs from 'query-string';
import {goToPage, setUser} from "../actions";
import {connect} from "react-redux";
class Auth extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            authStatus: {code: -1, message: 'waiting for action...'},
            email: '',
            password: '',
            confirmPassword: '',
            confirmLoading: false,
            sci: ''
        };

        this.exit = this.exit.bind(this);
        this.textChange = this.textChange.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.hideMessage = this.hideMessage.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.addEnterListener = this.addEnterListener.bind(this);

        if(typeof document !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }
    }

    componentWillReceiveProps(nextProps)
    {

    }

    componentWillUnmount()
    {
        this.exit();
    }

    addEnterListener(e)
    {
        e = e || window.event;
        if (e.keyCode == 13)
        {
            e.preventDefault();
            this.checkAccessType();
        }
    }

    componentDidMount()
    {
        const search = qs.parse(location.search);
        let el = this;
        if(!search || !search.tkn || search.tkn.length < 1)
        {
            this.setState({
                authStatus: {code: -1, message: 'An unknown error was encountered. Please try again later'}
            });
            el.showMessage('An unknown error was encountered. Please try again later', -1);
        }
        else
        {
            fetch("/resetPassword",
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({auth: search.tkn})
                }).then(function(response)
                {
                    return response.json();
                })
                .then(function(res)
                {
                    el.setState({
                        authStatus: {code: res.code, message: res.message},
                        sci: res.sci,
                        email: res.email
                    });

                    if(res.code > 0)
                    {
                        el.showMessage(res.message, 5);
                        setTimeout(function()
                        {
                            document.getElementById("pssReset").addEventListener("keypress", el.addEnterListener, false);
                        }, 1000);
                    }
                    else
                    {
                        el.showMessage(res.message, -1);
                    }

                });
        }
    }

    textChange(e)
    {
        this.setState({[e.target.name] : e.target.value});
    }

    showMessage(message, code)
    {
        let msg = document.getElementById('msg');
        let ms = document.getElementById('ms');
        if(code > 0)
        {
            ms.style.color = '#21ba45'
        }
        else{
            ms.style.color = '#fb8c00';
        }

        ms.innerHTML = message;
        msg.style.display = 'block';
        this.hideMessage();
    }

    hideMessage()
    {
        let msg = document.getElementById('msg');
        let ms = document.getElementById('ms');
        setTimeout(function(){
            msg.style.display = 'none';
            ms.innerHTML = '';
        }, 6000);
    }

    changePassword()
    {
        if(!this.state.password || this.state.password.length < 1)
        {
            this.showMessage('Your password is required!', -1);
            return;
        }
        if(!this.state.confirmPassword || this.state.confirmPassword.length < 1 || this.state.confirmPassword.trim().length < 1)
        {
            this.showMessage('Please confirm your Password', -1);
            return;
        }

        if(this.state.confirmPassword !== this.state.password)
        {
            this.showMessage('The Passwords do not match', -1);
            return;
        }

        this.setState({
            confirmLoading: true
        });

        let el = this;
        fetch("/changePassword",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"email": this.state.email,"password": this.state.password, "confirmPassword": this.state.confirmPassword, "sci": el.state.sci})
            }).then(function(response)
            {
                return response.json();
            })
            .then(function(res)
            {
                el.setState({
                    confirmLoading: false
                });

                if(res.code > 0)
                {
                    el.showMessage(res.message, 5);
                    document.getElementById('pssReset').display = 'none';
                    document.getElementById('mbFooter').display = 'none';
                    el.setState({password: '', confirmPassword: ''});
                    el.exit();
                    el.props.go('HOME', '');
                }
                else
                {
                    el.showMessage(res.message, -1);
                }

            });
    };

    exit()
    {
        document.getElementById("pssReset").removeEventListener("keypress", this.addEnterListener, false);
    };

    render()
    {
        const {confirmLoading, password, confirmPassword} = this.state;
        return(

            <div className="ant-modal" style={{width: "35%", top: '20%', right: '50%', marginBottom: '30%'}}>
                <div className="ant-modal-content" style={{boxShadow: "none"}}>
                    <div className="ant-modal-header">
                        <div className="ant-modal-title">
                            <h4 style={{color: '#000'}}>Reset your password</h4>
                        </div>
                    </div>
                    <div className="ant-modal-body">
                        <div id="msg" style={{width: "100%", margin: "1px", display: "none"}}>
                            <label id="ms"></label><br/><br/>
                        </div>
                        <form className="ant-form ant-form-horizontal" id="pssReset" autoComplete="off">
                            <div className="ant-row ant-form-item">
                                <div className="ant-form-item-control-wrapper">
                                    <div className="ant-form-item-control ">
                                        <div className="ant-form-item-control-wrapper">
                                            <div className="ant-form-item-control ">
                                                <span className="ant-input-affix-wrapper p-pad">
                                                    <span className="ant-input-prefix">
                                                        <i style={{fontSize: '19px'}} className="anticon anticon-lock"></i>
                                                    </span>
                                                    <input onChange={this.textChange} name="password" type="password" className="ant-input aut-input ant-input-lg input-no-border" placeholder="password" value={password}/>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="ant-row ant-form-item">
                                <div className="ant-form-item-control-wrapper">
                                    <div className="ant-form-item-control ">
                                        <div className="ant-form-item-control-wrapper">
                                            <div className="ant-form-item-control ">
                                                <span className="ant-input-affix-wrapper p-pad">
                                                    <span className="ant-input-prefix">
                                                        <i style={{fontSize: '19px'}} className="anticon anticon-lock"></i>
                                                    </span>
                                                    <input onChange={this.textChange} name="confirmPassword" type="password" className="ant-input aut-input ant-input-lg input-no-border" placeholder="Confirm password" value={confirmPassword}/>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="ant-modal-footer" id="mbFooter">
                        <Button className="login-button" key="submit" type="primary" size="large" loading={confirmLoading} onClick={this.changePassword}>
                            continue
                        </Button>
                    </div>
                </div>
            </div>

        );
    }
}

const mapDispatch = {go: goToPage, setUser};
const mapState = ({ location, user }) => ({ path: location.pathname, user});

export default connect(mapState, mapDispatch)(Auth);