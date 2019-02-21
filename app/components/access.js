/**
 * Created by Jack V on 9/19/2017.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {Menu, Form, Icon, Input, Button, Modal, Row, Col} from 'antd';
const {Item} = Form;
import {goToPage, setUser, dispatchAction} from '../actions';
import creLogo2 from '../../images/mobile/cre-bl-bb2.png'
import { connect } from 'react-redux';
import {crImg, logo2} from "./appImg";
import {postQuery} from "../utils";
const headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};
class Access extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            email: '',
            password: '',
            login: null,
            geekName: '',
            emailVerified: false,
            geekNameExists: false,
            msg: '',
            socket: null,
            showMsg: false,
            msgColor: '',
            regEmail: '',
            regPassword: '',
            confirmPassword: '',
            accessButtonText: '',
            forgotPasswordEmail: '',
            current: '',
            title: '',
            confirmLoading: null,
            geek: {geekName: '', firstName: '', lastName: '', languages: [], name: '', professionalCaption: '', academics:[], dateRegistered: '', summary: '', successfulDealsDelivered: 0, topSpecialties: [], onlineStatus: 0, isAuthenticated: false, location: {address1: '', address2: '', cityId: ''}},
        };
       
        if(typeof window !== 'undefined')
        {
            window.showLogin = this.showLogin.bind(this);
            window.showRegister = this.showRegister.bind(this);
        }
       
        this.login = this.login.bind(this);
        this.addEnterListener = this.addEnterListener.bind(this);
        this.register = this.register.bind(this);
        this.cloneSocial = this.cloneSocial.bind(this);
        this.exit = this.exit.bind(this);
        this.hideMessage = this.hideMessage.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.textChange = this.textChange.bind(this);
        this.checkAccessType = this.checkAccessType.bind(this);
        this.requestPasswordReset = this.requestPasswordReset.bind(this);
        this.changeAccess = this.changeAccess.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.cancelForgotPassword = this.cancelForgotPassword.bind(this);
        this.checkEmail = this.checkEmail.bind(this);
        this.checkGeekName = this.checkGeekName.bind(this);
    }

    componentDidMount()
    {
        if(typeof this.props.io === 'object' && this.props.io !== null)
        {
            this.setState({socket: this.props.io});
        }
    }

    componentWillUnmount()
    {

    }

    componentWillReceiveProps(nextProps)
    {
        if(typeof nextProps.io === 'object' && nextProps.io !== null)
        {
            this.setState({socket: nextProps.io});
        }
    }

    textChange(e)
    {
        let val = e.target.value;
        if(e.target.name === 'geekName')
        {
            val = e.target.value.replace(' ', '');
        }
        this.setState({[e.target.name] : val});
    }
    showRegister()
    {
        this.setState({
            message: ''
        });

        if(!this.state.visible)
        {
            this.setState({
                visible: true
            });
        }

        this.setState({
            login: false,
            forgotPassword: false,
            register: true,
            current: 'register',
            accessButtonText: 'continue',
            confirmLoading: false
        });

        let register = document.getElementById('register');
        if(register)
        {
            document.getElementById('forgotPassword').style.display = 'none';
            register.style.display = 'block';
            document.getElementById('login').style.display = 'none';
            document.getElementById('fbDiv').style.display = 'block';
            document.getElementById('accessMenu').style.display = 'block';
        }
        this.cloneSocial();
    };

    showLogin()
    {
        this.setState({
            message: ''
        });

        if(!this.state.visible)
        {
            this.setState({
                visible: true
            });
        }

        this.setState({
            login: true,
            current: 'login',
            forgotPassword: false,
            accessButtonText: 'log in',
            confirmLoading: false
        });

        let register = document.getElementById('register');
        let login = document.getElementById('login');
        if(login)
        {
            register.style.display = 'none';
            document.getElementById('forgotPassword').style.display = 'none';
            login.style.display = 'block';
            document.getElementById('fbDiv').style.display = 'block';
            document.getElementById('accessMenu').style.display = 'block';
        }
        this.cloneSocial();
    };

    addEnterListener(e)
    {
        e = e || window.event;
        if (e.keyCode == 13)
        {
            e.preventDefault();
            this.checkAccessType();
        }
    }

    cloneSocial()
    {
        let el = this;
        setTimeout(function()
        {
            // let div = ReactDOM.findDOMNode(el.refs.fbDiv);
            // if(!div.innerHTML || div.innerHTML.length < 1 )
            // {
            //     let fbLogin = document.getElementById('fbLoginDiv');
            //     let fbClone = fbLogin.cloneNode(true);
            //     div.append(fbClone);
            // }
            document.getElementById("accessForm").addEventListener("keypress", el.addEnterListener, false);
        }, 1000);


    };

    checkAccessType()
    {
        if(this.state.current === 'login' || this.state.login === true)
        {
            this.login();
        }

        else if(this.state.current === "register" || this.state.register === true)
        {
            if(this.state.emailVerified === false)
            {
                this.checkEmail();
            }
            else
            {
                this.register();
            }
        }
        else if(this.state.current === "forgotPassword" || this.state.forgotPassword === true)
        {
            this.requestPasswordReset();
        }
    };
    
    forgotPassword()
    {
        document.getElementById('accessMenu').style.display = 'none';
        document.getElementById('register').style.display = 'none';
        document.getElementById('login').style.display = 'none';
        document.getElementById('fbDiv').style.display = 'none';
        document.getElementById('forgotPassword').style.display = 'block';

        this.setState({
            login: false,
            register: false,
            forgotPassword: true,
            forgotPasswordEmail: this.email,
            current: 'forgotPassword',
            accessButtonText: 'continue',
            confirmLoading: false
        });
    };
     
    cancelForgotPassword()
    {
        document.getElementById('accessMenu').style.display = 'block';
        document.getElementById('register').style.display = 'none';
        document.getElementById('fbDiv').style.display = 'block';
        document.getElementById('login').style.display = 'block';
        document.getElementById('forgotPassword').style.display = 'none';
        
        this.setState({
            login: true,
            register: false,
            forgotPassword: false,
            current: 'login',
            accessButtonText: 'Log in',
            confirmLoading: false
        });
    };

    showMessage(message, code)
    {
        this.setState({msg: message, showMsg: true, msgColor: code > 0? '#21ba45': '#fb8c00'});
        this.hideMessage(msg, ms);
    }

    hideMessage(msg, ms)
    {
        let el = this;
        setTimeout(function(){
            el.setState({msg: '', showMsg: false, msgColor: ''});
        }, 6000);
    }

    changeAccess(e)
    {
        this.setState({
            current: e.key
        });
        if(typeof window !== undefined)
        {
            if(e.key === 'login')
            {
                window.showLogin();
            }
            else
            {
                window.showRegister();
            }
        }
        
    }

    login()
    {
        if(!this.state.email || this.state.email < 1 || this.state.email.trim().length < 1)
        {
            this.showMessage('Your Email is required!', -1);
            return;
        }
        if(!this.state.password || this.state.password.length < 1 || this.state.password.trim().length < 1)
        {
            this.showMessage('Password is required!', -1);
            return;
        }

        this.setState({
            confirmLoading: true
        });

        let el = this;
        fetch("/login",
            {
                method: "POST",                 
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"email": this.state.email.trim(), "password": this.state.password})                
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
                    el.setState({
                        visible: false
                    });

                    el.props.dispatchAction({ type: 'USER', payload: res});
                    el.props.io.emit('online', res.id);
                    localStorage.removeItem('psId');
                    localStorage.setItem('psId', res.userData);
                    el.exit();
                }
                else
                {
                    el.showMessage(res.message, -1);
                    if(res.code === -5)
                    {
                        el.setState({
                            visible: false
                        });

                        el.props.dispatchAction({ type: 'USER', payload: res});
                        localStorage.removeItem('psId');
                        localStorage.setItem('psId', res.userData);
                    }

                }

            });
    };

    async register()
    {
        if(!this.state.regEmail || this.state.regEmail.length < 1 || this.state.regEmail.trim().length < 1)
        {
            this.showMessage('Your Email is required', -1);
            return;
        }
        if(!this.state.geekName || this.state.geekName.length < 1 || this.state.geekName.trim().length < 1)
        {
            this.showMessage('Your Geek Name is required', -1);
            return;
        }
        if(this.state.geekNameExists === true)
        {
            this.showMessage('Your Geek Name is already taken. Please choose a different one', -1);
            return;
        }
        if(!this.state.regPassword || this.state.regPassword.length < 1 || this.state.regPassword.trim().length < 1)
        {
            this.showMessage('Password is required', -1);
            return;
        }
        if(!this.state.confirmPassword || this.state.confirmPassword.length < 1 || this.state.confirmPassword.trim().length < 1)
        {
            this.showMessage('Please confirm your Password', -1);
            return;
        }

        if(this.state.confirmPassword !== this.state.regPassword)
        {
            this.showMessage('The Passwords do not match', -1);
            return;
        }
        let el = this;
        let data = {email: this.state.regEmail.trim(), password: this.state.regPassword, confirmPassword: this.state.confirmPassword, geekName: this.state.geekName, rememberMe: false};

        this.setState({
            confirmLoading: true
        });

        let res = await postQuery('/enroll', JSON.stringify(data));
        el.setState({
            confirmLoading: false
        });

        if(res.code > 0)
        {
            el.showMessage(res.message, 5);
            el.props.setUser({id: res.id, name:  res.name, email: el.state.regEmail.trim(), role: res.role, isAuthenticated: res.isAuthenticated, profileImage: res.profileImage, geekName: el.state.geekName});
            localStorage.removeItem('psId');
            localStorage.setItem('psId', res.userData);
            setTimeout(function()
            {
                el.exit();

            }, 5000);

        }
        else
        {
            el.showMessage(res.message, -1);
        }

    };

    requestPasswordReset()
    {
        if(this.state.forgotPasswordEmail === undefined || this.state.forgotPasswordEmail === null || this.state.forgotPasswordEmail.trim().length < 1)
        {
            this.showMessage('Please provide your Email', -1);
            return;
        }
        else
        {
            this.setState({
                confirmLoading: true
            });

            let el = this;
            fetch("/forgotPassword",
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({"email": this.state.forgotPasswordEmail.trim()})
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
                        localStorage.removeItem('psId');
                        el.cancelForgotPassword();
                        setTimeout(function()
                        {
                            el.exit();

                        }, 7000);
                    }
                    else
                    {
                        el.showMessage(res.message, -1);
                    }

                });
        }
    };

    checkEmail()
    {
        if(!this.state.regEmail || this.state.regEmail.length < 1 || this.state.regEmail.trim().length < 1)
        {
            this.showMessage('Your Email is required', -1);
            return;
        }

        let el = this;
        this.setState({
            confirmLoading: true
        });
        fetch("/checkEmail?email=" + this.state.regEmail,
            {
                method: "GET",
                headers: {"Content-Type": "application/json"}
            }).then(function(response)
            {
                return response.json();
            })
            .then(function(res)
            {
                if(res.code > 0)
                {
                    if(res.userExists === true)
                    {
                        el.setState({
                            emailVerified: false,
                            confirmLoading: false
                        });

                        el.showMessage(res.message, -1);
                    }
                    else
                    {
                        el.setState({
                            emailVerified: true,
                            confirmLoading: false
                        });
                    }
                }
                else
                {
                    el.setState({
                        emailVerified: false,
                        confirmLoading: false
                    });
                    el.showMessage(res.message, -1);
                }

            });

    }

    checkGeekName()
    {
        if(this.state.current === 'register')
        {
            let el = this;
            this.setState({
                confirmLoading: true
            });

            fetch("/checkGeekName?geekName=" + this.state.geekName,
                {
                    method: "GET",
                    headers: {"Content-Type": "application/json"}
                }).then(function(response)
            {
                return response.json();
            })
                .then(function(res)
                {
                    if(res.code > 0)
                    {
                        if(res.geekNameExists === true)
                        {
                            el.setState({
                                geekNameExists: true,
                                confirmLoading: false
                            });
                            el.showMessage(res.message, -1);
                        }
                        else{
                            el.setState({
                                geekNameExists: false,
                                confirmLoading: false
                            });
                        }
                    }
                    else
                    {
                        el.setState({
                            geekNameExists: true,
                            confirmLoading: false
                        });
                        el.showMessage(res.message, -1);
                    }

                });
        }
    }

    exit()
    {

        this.setState({
            visible: false
        });
        document.getElementById("accessForm").removeEventListener("keypress", this.addEnterListener, false);
    };

    render(){
            const {visible, confirmLoading, email, password, forgotPasswordEmail, accessButtonText, regEmail, regPassword, confirmPassword, geekName, emailVerified, title} = this.state;
            return (

                <div className="md-wrapper">
                    <Modal className="access-modal-width"
                        visible={visible}
                        title={

                            <svg dangerouslySetInnerHTML={{__html: logo2}} className="logo2" onClick={() => this.props.go('HOME', 'landing')} id="svg" version="1.1" width="400" height="115.0326797385621" viewBox="0 0 400 115.0326797385621" xmlns="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink" ></svg>

                              }
                        maskClosable={false}
                        onCancel={this.exit}
                         onClose={this.exit}
                        footer={[
                        <Button className="login-button" key="submit" type="primary" size="large" loading={confirmLoading} onClick={this.checkAccessType}>
                          {accessButtonText}
                        </Button>
                      ]}
                        >

                        <div id="msg" style={{width: '100%', margin: '1px', display: (this.state.showMsg === true) ? 'block' : 'none', }}>
                            <label style={{color: this.state.msgColor}}>
                                {this.state.msg}
                            </label>
                            <br/><br/>
                        </div>
                        <Menu id="accessMenu" onClick={this.changeAccess} selectedKeys={[this.state.current]} mode="horizontal">
                            <Menu.Item key="login" className="access-menu-item">
                               Log in
                            </Menu.Item>
                            <Menu.Item key="register" className="access-menu-item">
                                Join
                            </Menu.Item>
                        </Menu>
                        <br/>
                        <form className="ant-form ant-form-horizontal" id="accessForm" autoComplete="off">
                            <div id="login">                               
                                <Item>
                                    <div className="ant-form-item-control-wrapper">
                                        <div className="ant-form-item-control ">
                                            <span className="ant-input-affix-wrapper p-pad">
                                                <span className="ant-input-prefix">
                                                    <i style={{fontSize: '19px'}} className="anticon anticon-mail"></i>
                                                </span>
                                                <input onChange={this.textChange} name="email" type="email" className="ant-input aut-input ant-input-lg input-no-border" placeholder="Email" value={email}/>
                                            </span>
                                        </div>
                                    </div>
                                </Item>
                                <Item>
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
                                </Item>
                                <Item>
                                    <div style={{float: 'left'}}><a onClick={this.forgotPassword} className="login-form-forgot">Don't remember your password?</a></div><br/>
                                </Item>
                            </div>
                            <div id="forgotPassword" style={{display: 'none', width: '100%', paddingBottom: '10px', marginTop: '-15px'}}>     
                                <div className="ant-col-23 row-no-btm" style={{marginBottom: '1px', paddingTop: '0px !important'}}>
                                    <div className="ant-row ant-form-item" style={{marginBottom: '10px !important'}}>
                                        <div className="ant-form-item-control-wrapper">
                                            <div className="ant-form-item-control ">
                                                <span className="ant-input-affix-wrapper p-pad">
                                                    <span className="ant-input-prefix">
                                                       <i style={{fontSize: '19px'}} className="anticon anticon-mail"></i>
                                                    </span>
                                                    <input onChange={this.textChange} name="forgotPasswordEmail" type="email" className="ant-input aut-input ant-input-lg input-no-border" placeholder="your email" value={forgotPasswordEmail}/>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="ant-col-1">
                                    <button title="cancel" style={{marginTop: '15px'}} aria-label="Close" className="ant-modal-close" onClick={this.cancelForgotPassword}>
                                        <i style={{fontSize: '20px', fontWeight: 'bold'}} className="anticon anticon-arrow-left"></i>
                                    </button>
                                </div>
                            </div>
                           <div id="register" style={{display: 'none'}}>
                               <Item style={{display: emailVerified === false? 'block' : 'none'}}>
                                   <div className="ant-form-item-control-wrapper">
                                       <div className="ant-form-item-control ">
                                            <span className="ant-input-affix-wrapper p-pad">
                                                <span className="ant-input-prefix">
                                                   <i style={{fontSize: '19px'}} className="anticon anticon-mail"></i>
                                                </span>
                                                <input onChange={this.textChange} name="regEmail" type="email" className="ant-input aut-input ant-input-lg input-no-border" placeholder="Email" value={regEmail}/>
                                            </span>
                                       </div>
                                   </div>
                               </Item>
                               <Item style={{display: emailVerified === false? 'none' : 'block'}}>
                                   <div className="ant-form-item-control-wrapper">
                                       <div className="ant-form-item-control ">
                                            <span className="ant-input-affix-wrapper p-pad">
                                                <span className="ant-input-prefix">
                                                   <i style={{fontSize: '19px'}} className="anticon anticon-user"></i>
                                                </span>
                                                <input onBlur={this.checkGeekName} onChange={this.textChange} name="geekName" type="text" required className="ant-input aut-input ant-input-lg input-no-border" placeholder="Your Geek Name" value={geekName}/>
                                            </span>
                                       </div>
                                   </div>
                               </Item>
                               <Item style={{display: emailVerified === false? 'none' : 'block'}}>
                                   <div className="ant-form-item-control-wrapper">
                                       <div className="ant-form-item-control ">
                                            <span className="ant-input-affix-wrapper p-pad">
                                                <span className="ant-input-prefix">
                                                    <i style={{fontSize: '19px'}} className="anticon anticon-lock"></i>
                                                </span>
                                                <input onChange={this.textChange} name="regPassword" required type="password" className="ant-input aut-input ant-input-lg input-no-border" placeholder="password" value={regPassword}/>
                                            </span>
                                       </div>
                                   </div>
                               </Item>
                               <Item style={{display: emailVerified === false? 'none' : 'block'}}>
                                   <div className="ant-form-item-control-wrapper">
                                       <div className="ant-form-item-control ">
                                            <span className="ant-input-affix-wrapper p-pad">
                                                <span className="ant-input-prefix">
                                                    <i style={{fontSize: '19px'}} className="anticon anticon-lock"></i>
                                                </span>
                                                <input onChange={this.textChange} name="confirmPassword" required type="password" className="ant-input aut-input ant-input-lg input-no-border" placeholder="Confirm password" value={confirmPassword}/>
                                            </span>
                                       </div>
                                   </div>
                               </Item>
                           </div>
                           <div id="fbDiv" ref="fbDiv" className="modal-top-footer">
                               <div className="fb-login-button" className="fb-login-button" data-size="medium" data-button-type="continue_with" data-show-faces="false" data-auto-logout-link="false" data-use-continue-as="true"></div>
                            </div>
                        </form>
                    </Modal>
                </div>
            );
        }
}

const mapDispatch = {setUser, go: goToPage, dispatchAction};
const mapState = ({ user, io, location, geek }) => ({user, io, path: location.pathname, geek});

export default connect(mapState, mapDispatch)(Access);

