/**
 * Created by Jack V on 9/11/2017.
 */
import React from 'react';
import {Button, Icon, Row, Col, Avatar, Menu, Dropdown, message } from 'antd';
import {goToPage, setUser, seeGeek, dispatchAction} from '../actions';
import { connect } from 'react-redux';
import {logo} from './appImg';
const {SubMenu} = Menu;
import Link, { NavLink } from 'redux-first-router-link';
// import logo from '../../images/mobile/cre-wh-bb2.png';
class welcomeBar extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
            {
                user: {email: '', firstName: '' ,lastName:  '', id: '', role: '', isAuthenticated: false, name: '', userData: '', geekName: '', geekNameUpper: '', professionalCaption: '', location: {country: 'Not available', ip: '', city: ''}, languages: [], dateRegistered: '', academics: [], onlineStatus: 0, successfulDealsDelivered: 0, phoneNumberConfirmed: false }
            };
        this.showLogin = this.showLogin.bind(this);
        this.logOut = this.logOut.bind(this);
        this.setAuth = this.setAuth.bind(this);
        this.switchGeek = this.switchGeek.bind(this);
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState({user: nextProps.user});
        this.setAuth(nextProps.user);
        if(typeof nextProps.io === 'object' && nextProps.io !== null)
        {
            this.setState({socket: nextProps.io});
        }
    }

    componentDidMount()
    {
        this.setAuth(this.props.user);
        if(typeof this.props.io === 'object' && this.props.io !== null)
        {
            this.setState({socket: this.props.io});
        }
    }

    componentWillMount()
    {

    }

    switchGeek(geek)
    {
        if(!geek || geek.length < 1)
        {
           return;
        }
        this.props.seeGeek(geek);
    }

    showLogin()
    {
        if(typeof window !== undefined)
        {
            window.showLogin();
        }
    };

    setAuth(user)
    {
        let profMenu = document.getElementById('lndProfMenu');
        let appLogin = document.getElementById('lndAppLogin');
         this.setState({user: user});
        if(user !== undefined && user !== null && user.isAuthenticated === true)
        {
            appLogin.classList.remove("show");
            appLogin.classList.add("hide");
            profMenu.classList.remove("hide");
            profMenu.classList.add("show");
        }
        else
        {
            appLogin.classList.remove("hide");
            appLogin.classList.add("show");
            profMenu.classList.remove("show");
            profMenu.classList.add("hide");
        }
    }

    logOut()
    {
        let el = this;

        let userData = localStorage.getItem('psId');

        if(userData && userData.length > 0)
        {
            this.setState({
                confirmLoading: true
            });
            fetch("/logout",
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json", "psid": userData}
                }).then(function(response)
            {
                return response.json();
            })
                .then(function(res)
                {
                    if(res.code > 0)
                    {
                        let user = {email: '', firstName: '' ,lastName:  '', id: '', role: '', isAuthenticated: false, name: '', userData: '', geekName: '', geekNameUpper: '', professionalCaption: '', location: {country: 'Not available', ip: '', city: ''}, languages: [], dateRegistered: '', academics: [], onlineStatus: 0, successfulDealsDelivered: 0 };
                        el.setState({
                            confirmLoading: false
                        });
                        el.setAuth(user);
                        el.props.io.emit('offline');
                        el.props.dispatchAction({ type: 'USER', payload: user});
                        localStorage.removeItem('psId');
                        el.props.go('HOME', 'landing');
                    }

                });
        }
        else{

            let usr = {email: '', firstName: '' ,lastName:  '', id: '', role: '', isAuthenticated: false, name: '', userData: '', geekName: '', geekNameUpper: '', professionalCaption: '', location: {country: 'Not available', ip: '', city: ''}, languages: [], dateRegistered: '', academics: [], onlineStatus: 0, successfulDealsDelivered: 0 };

            el.setAuth(usr);
            el.props.io.emit('offline');
            el.props.dispatchAction({ type: 'USER', payload: usr});
            el.props.go('HOME', 'landing');
        }
    };

    render()
    {
        const menu = (
            <Menu className='it-mn'>
                <Menu.Item key="pr:pr">
                    <NavLink className="appAnchor" to={`/cr/${this.props.user !== undefined && this.props.user !== undefined && this.props.user.geekName !== undefined && this.props.user.geekName.length > 0 ? this.props.user.geekName : ""}`}>Profile</NavLink>
                </Menu.Item>
                <Menu.Item key="pr:sales">
                    <NavLink className="appAnchor" exact to= '/sales'>My Sales</NavLink>
                </Menu.Item>
                <Menu.Item key="pr:orders">
                    <NavLink className="appAnchor" exact to = '/buys'>My Buys</NavLink>
                </Menu.Item>
                <Menu.Item key="pr:signout">
                    <a className="appAnchor" style={{cursor: 'pointer'}} onClick={this.logOut}>Sign out</a>
                </Menu.Item>
            </Menu>
        );

        //to={`/buys/${this.state.user !== undefined && this.state.user !== null && this.props.user.id.length > 0 ? this.state.user.id : ""}`}

        return(
            <div className="landing-top-header" id="welcomeBar" className="welcomeHeader">
                <Row type="flex" justify="space-around" align="middle">
                    <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                        <svg  dangerouslySetInnerHTML={{__html: logo}} className="logo" onClick={() => this.props.go('HOME', 'landing')} id="svg" version="1.1" width="400" height="110.82251082251082" viewBox="0 0 400 110.82251082251082" xmlns="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink" ></svg>
                    </Col>
                    <Col xs={21} sm={21} md={21} lg={21} xl={21}>
                        <i className= "wlLogin hide" id="lndAppLogin" style={{borderRadius: '2px', float: 'right', cursor: 'pointer', padding: '3px 15px', fontStyle: 'normal'}} onClick={this.showLogin}>login</i>
                        <div id="lndProfMenu" className="profMenu hide">
                            <Dropdown overlay={menu} style={{width: '100%'}}>
                                <Button className="profileStyle">
                                    {(!this.props.user.profileImagePath || this.props.user.profileImagePath.length < 1)?
                                        <Avatar id="userIcon" className="userIcon" icon="user"/>
                                        :
                                        <span id="userIcon" className="ant-avatar userIcon dfs sTera ant-avatar-circle ant-avatar-icon">
                                            <img alt="Profile image" src={this.props.user.profileImagePath}/>
                                        </span>
                                    }
                                </Button>
                            </Dropdown>
                        </div>
                   </Col>
                </Row>
            </div>
        );
    }
}

const mapDispatch = {go: goToPage, setUser, seeGeek, dispatchAction};
const mapState = ({ location, io, user }) => ({ path: location.pathname, io, user });

export default connect(mapState, mapDispatch)(welcomeBar);