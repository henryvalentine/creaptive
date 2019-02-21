/**
 * Created by Jack V on 9/11/2017.
 */
import React from 'react';
import {Button, Icon, Row, Col, Avatar, Menu, Dropdown, message } from 'antd';
const {SubMenu} = Menu;
import SearchNav from './navSearch';
import {dispatchAction, goToPage, setUser} from '../actions';
import { connect } from 'react-redux';
import {crImg, crIcon} from './appImg';
import Link, { NavLink } from 'redux-first-router-link';
import {fetchData} from "../utils";

class AppBar extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            current: 'services',
            searchClicked: false,
            menuClasses: ['show', 'hide'],
            user: {email: '', firstName: '' ,lastName:  '', id: '', role: '', isAuthenticated: false, name: '', userData: '', geekName: '', geekNameUpper: '', professionalCaption: '', location: {country: 'Not available', ip: '', city: ''}, languages: [], dateRegistered: '', academics: [], onlineStatus: 0, successfulDealsDelivered: 0, phoneNumberConfirmed: false },
            categories: {services: [], crafts: []},
            sCategories: [],
            section: {_id: '', name: ''}
        };

        if(typeof window !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }

        this.searchBoxClicked = this.searchBoxClicked.bind(this);
        this.searchBoxExited = this.searchBoxExited.bind(this);
        this.toggleOpen = this.toggleOpen.bind(this); 
        this.showLogin = this.showLogin.bind(this);
        this.logOut = this.logOut.bind(this);
        this.setAuth = this.setAuth.bind(this);
        this.seeGeek = this.seeGeek.bind(this);
        this.goToLink = this.goToLink.bind(this);
        this.toggleProfMenu = this.toggleProfMenu.bind(this);
        this.selectSection = this.selectSection.bind(this);        
        this.dispatchActivitySubcategory = this.dispatchActivitySubcategory.bind(this);
        this.dispatchActivityCategory = this.dispatchActivityCategory.bind(this);
    }

    dispatchActivitySubcategory(subcategory, category)
    {
        let location = this.props.location.pathname.replace('/', '');               
        if(location && location.length > 0)
        {
            subcategory.creativeCategory = category;
            this.props.dispatchAction({ type: 'XPAGE', payload: subcategory})   
            if(!this.state.section.name.toLowerCase().includes(location.toLowerCase()))
            {
                this.props.go(location.toUpperCase(), location.toLowerCase());
            } 
        }         
    }

    dispatchActivityCategory(category)
    {
        let location = this.props.location.pathname.replace('/', '');               
        if(location && location.length > 0)
        {
            this.props.dispatchAction({ type: 'CPAGE', payload: category})   
            if(!this.state.section.name.toLowerCase().includes(location.toLowerCase()))
            {
                this.props.go(location.toUpperCase(), location.toLowerCase());
            } 
        }         
    }

    async getSectionCategories(section)
    {
        if(section !== undefined && section !== null && section._id !== this.state.section._id)
        {
            let sectionCategories = await fetchData(`/getCatrBySection?section=` + section._id);
            if(sectionCategories !== undefined && sectionCategories !== null && sectionCategories.length > 0)
            {     

                this.setState({sCategories: sectionCategories});
                this.props.dispatchAction({ type: 'CATEGORIES', payload: sectionCategories});
            }
            else{
               
                this.setState({sCategories: []});
                this.props.dispatchAction({ type: 'CATEGORIES', payload: []});
            }
        }
    }

    async selectSection(type, location)
    {
        let obj = this;
        if(typeof window !== 'undefined')
        { 
            document.getElementById('welcomeBar').style.display = 'none';
            document.getElementById('appBar').style.display = '';
        }
        
        let section = obj.props.sections.find(s => s.name.toLowerCase().includes(location.toLowerCase()) || s.name.toLowerCase() === location.toLowerCase());
        if(section && section._id.length > 0)
        {
            if(obj.state.section._id !== section._id)
            {
                obj.setState({section: section});
                obj.props.dispatchAction({ type: 'SECTION', payload: section});   
                obj.getSectionCategories(section);
            } 
        }                    
    }

    async componentWillMount()
    {
    }

    componentWillUnmount()
    {
       
    }

    seeGeek()
    {
        if(this.props.user && this.props.user && this.props.user.geekName.length > 0)
        {
            this.props.dispatchAction({ type: 'ID', payload: this.props.user.geekName});
            this.props.go('CRE', this.props.user.geekName);
        }
       else
        {
            alert('An error was encountered. Please try again later');
        }
    }

    toggleProfMenu(className)
    {
        let submenu = document.getElementById('submenu');
        let notClass = this.state.menuClasses.find(c => c !== className);
        submenu.classList.remove(notClass);
        submenu.classList.add(className);
    }

    componentWillReceiveProps(nextProps)
    {
        if(typeof nextProps.user === 'object' && typeof nextProps.user === 'object' && nextProps.user.hasOwnProperty('id'))
        {
            this.setState({user: nextProps.user});
            this.setAuth(nextProps.user);
        }

        if(nextProps.section !== undefined && nextProps.section !== null && nextProps.section.hasOwnProperty('_id') && nextProps.section._id.length > 0)
        {
            if(this.state.section._id.length < 1)
            {
                this.setState({section: nextProps.section});
                this.getSectionCategories(nextProps.section);
            }
            else
            {
                if(nextProps.section._id !== this.state.section._id)
                {
                    this.setState({section: nextProps.section});
                    this.getSectionCategories(nextProps.section);
                }
            }
        }

        //Necessary to help determine default section from SEO navigation
        if(nextProps.location.pathname !== undefined && nextProps.location.pathname !== null  &&  nextProps.location.pathname !== this.props.location.pathname)
        {
            let section = this.props.sections.find(s => s.name.toLowerCase().includes('services'));
            if(nextProps.location.pathname.includes('crafts'))
            {
                section = this.props.sections.find(s => s.name.toLowerCase().includes('crafts') || s.name.toLowerCase().includes('handcrafts'));
            }            

            if(!this.state.section || this.state.section._id.length < 1)
            {
                this.setState({section: section});
                this.getSectionCategories(section);
            }
            else
            {
                if(section._id !== this.state.section._id)
                {
                    this.setState({section: section});
                    this.getSectionCategories(section);
                }
            }
        }
    }

    componentDidMount()
    {
        let obj = this;
        if(typeof this.props.user === 'object' && this.props.user.hasOwnProperty('id'))
        {
            this.setAuth(this.props.user);
        }         
    }

    setAuth(user)
    {
        this.setState({user: user});
        let mLogin = document.getElementById('mLogin');
        let profMenu = document.getElementById('profMenu');
        let mProfMenu = document.getElementById('mProfMenu');
        let appLogin = document.getElementById('brLogin');

        if(user !== undefined && user !== null && user.isAuthenticated === true)
        {
            mLogin.classList.remove("show");
            mLogin.classList.add("hide");
            appLogin.classList.remove("show");
            appLogin.classList.add("hide");
            profMenu.classList.remove("hide");
            profMenu.classList.add("show");
            mProfMenu.classList.remove("hide");
            mProfMenu.classList.add("show");
        }
        else
        {
            mLogin.classList.remove("hide");
            mLogin.classList.add("show");
            appLogin.classList.remove("hide");
            appLogin.classList.add("show");
            profMenu.classList.remove("show");
            profMenu.classList.add("hide");
            mProfMenu.classList.remove("show");
            mProfMenu.classList.add("hide");
        }
    }

    toggleOpen()
    {
        document.getElementById('navOverLay').style.opacity = 1;
        document.getElementById('navOverLay').style.visibility = 'visible';
        document.getElementById('sideNav').style.left = '0';
    }  

    searchBoxClicked()
    {        
        this.setState({
            searchClicked: true
        });

        let searchAlts = document.getElementsByClassName('search-alt');     
        for (let i = 0; i < searchAlts.length; i++)
        {
            searchAlts[i].style.display = 'none';
        }     
        document.getElementById('searchDiv').style.display = '';  
        document.getElementById("mbSearch").focus();
    }

    searchBoxExited()
    {
        this.setState({
            searchClicked: false
        });

        document.getElementById('searchDiv').style.display = 'none'; 
        let searchAlts = document.getElementsByClassName('search-alt');
        for (let i = 0; i < searchAlts.length; i++)
        {
            searchAlts[i].style.display = '';
        }   
    }  

    showLogin()
    {
        if(typeof window !== 'undefined')
        {
            window.showLogin();
        }
    };

    goToLink(type, location)
    {
        this.props.go(type, location);
        this.props.dispatchAction({ type: 'USER', payload: this.state.user});
    };

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
        let props ={searchBoxExited: this.searchBoxExited, id: 'mbSearch'};
        let {sCategories} = this.state;

        let service = {};
        let craft = {};
        if(this.props.sections && this.props.sections.length > 0)
        {
            this.props.sections.forEach(s => 
            {
                if(s.name.toLowerCase() === 'services')
                {
                    service = s;
                }
                if(s.name.toLowerCase() === 'handcrafts')
                {
                    craft = s;
                }
            });            
        }

        const menu = (
            <Menu className='it-mn'>
                <Menu.Item key="pr:pr">
                    <NavLink className="appAnchor" to={`/cr/${this.props.user !== undefined && this.props.user !== undefined && this.props.user.geekName !== undefined && this.props.user.geekName.length > 0 ? this.props.user.geekName : ""}`}>Profile</NavLink>
                </Menu.Item>
                <Menu.Item key="pr:sales">
                    <a  onClick={() => this.goToLink('SALES', 'sales')} className="appAnchor" style={{cursor: 'pointer'}}>
                        My sales
                    </a>
                </Menu.Item>
                <Menu.Item key="pr:orders">
                    <a  onClick={() => this.goToLink('BUYS', 'buys')} className="appAnchor" style={{cursor: 'pointer'}}>
                        My buys
                    </a>
                </Menu.Item>
                <Menu.Item key="pr:signout">
                    <a className="appAnchor" style={{cursor: 'pointer'}} onClick={this.logOut}>Sign out</a>
                </Menu.Item>
            </Menu>
        );
        return(
            <div className="headerContainer" style={{display: 'none'}} id="appBar">
                <Row type="flex" justify="space-around" style={{display: 'none'}} align="middle" id="wdHeader" className="topHeader">
                    <Col xs={4} sm={4} md={4} lg={4} xl={4}>
                        <a  onClick={() => this.goToLink('HOME', 'landing')} className="appAnchor" style={{cursor: 'pointer'}}>
                            <svg dangerouslySetInnerHTML={{__html: crImg}} className="logo" id="svg" version="1.1" width="400" height="110.82251082251082" viewBox="0 0 400 110.82251082251082" xmlns="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink"></svg>
                        </a>
                    </Col>
                    <Col xs={17} sm={17} md={10} lg={10} xl={10}>
                        <SearchNav/>
                    </Col>
                    <Col xs={2} sm={2} md={2} lg={2} xl={2}>
                        <i className= "join-us hide" id="brLogin" style={{borderRadius: '2px', float: 'right', cursor: 'pointer', padding: '10px 25px', fontStyle: 'normal'}} onClick={this.showLogin}>login</i>
                        <div id="profMenu" className="profMenu hide">
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
                <Row type="flex" justify="space-around" align="middle" style={{display: 'none'}} id="mobileHeader" className="topHeader">
                    <Col span={2} className="search-alt">
                        <button onClick={this.toggleOpen} className="md-btn md-btn--icon md-pointer--hover md-inline-block md-btn--toolbar md-toolbar--action-left" style={{float: 'left', marginLeft: '-2px', color: "rgb(255, 255, 255)", marginTop: '10px'}}>
                            <i className="anticon anticon-menu-fold"></i>
                        </button>
                    </Col>
                    <Col span={1} className="search-alt"></Col>
                    <Col span={1} className="search-alt">
                        <Menu mode="horizontal" style={{color: '#fff', backgroundColor: 'transparent', float: 'left', borderBottom: 'none !important'}}>               
                            <SubMenu title={<span> <i style={{color: '#fff'}} className="anticon anticon-appstore-o"></i></span>}>
                                <Menu.Item key="app:Services">     
                                    <Link className="appAnchor" to={{ type: 'SERVICES', payload: { recx: service._id}}}>Services</Link>
                                </Menu.Item>
                                <Menu.Item key="app:crafts">
                                    <Link className="appAnchor" to={{ type: 'CRAFTS', payload: { recx: craft._id}}}>Hand crafts</Link>
                                </Menu.Item>
                                <Menu.Item key="mb:cr">
                                    <NavLink className="appAnchor" to={`/cre`}>Geeks</NavLink>
                                </Menu.Item>
                            </SubMenu>
                        </Menu>
                    </Col>
                    <Col span={2} className="search-alt"></Col>
                    <Col style={{textAlign: 'center', paddingLeft: '50px', paddingRight: '60px'}} span={6} className="search-alt">
                        <a  onClick={() => this.goToLink('HOME', 'landing')} className="appAnchor" style={{cursor: 'pointer'}}>
                            <svg dangerouslySetInnerHTML={{__html: crIcon}} className="cre-logo" id="svg" version="1.1" width="400" height="189.04109589041096" viewBox="0 0 400 189.04109589041096" xmlns="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink" ></svg>
                        </a>
                    </Col>
                    <Col span={3} className="search-alt">
                        <i style={{color: '#fff', cursor: 'pointer', float: 'right'}} type="search" onClick={this.searchBoxClicked} className="anticon anticon-search"></i>
                    </Col>
                    <Col id="searchDiv" span={24} style={{display: 'none', paddingBottom: '8px', paddingTop: '8px'}}>
                        <SearchNav {...props}/>
                    </Col>
                    <Col span={5} className="search-alt">
                        <i className="anticon anticon-poweroff hide" id="mLogin" style={{borderRadius: '2px', float: 'right', cursor: 'pointer'}} onClick={this.showLogin}></i>
                        <div id="mProfMenu" className="profileDrp hide">
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
                <Menu className="subHeader" id="subMenu" mode="horizontal">               
                    <SubMenu title={<span><Icon type="appstore" />App</span>}>
                        <Menu.Item key="app:Services">     
                            <Link className="appAnchor" to={{ type: 'SERVICES', payload: { recx: service._id, display: service.name}}}>Services</Link>
                        </Menu.Item>
                        <Menu.Item key="app:crafts">
                            <Link className="appAnchor" to={{ type: 'CRAFTS', payload: { recx: craft._id, display: craft.name}}}>Hand crafts</Link>
                       </Menu.Item>
                       <Menu.Item key="mb:cr">
                            <NavLink className="appAnchor" to={`/cre`}>Geeks</NavLink>
                        </Menu.Item>
                    </SubMenu>      
                   {sCategories.map(c => 
                    <SubMenu key={c._id} title={<Link to={{ type: this.props.section.name.toUpperCase().replace('HAND', ''), payload: { recx1: c.name.replace(' ', '-'), recx: c._id, display: c.name}}}><Icon type= {c.iconType} theme="outlined"/>{c.name}</Link>}>
                        {c.subCategories.map(s => 
                            <Menu.Item key={s._id} onClick={() => this.dispatchActivitySubcategory(s, c)}>                            
                                <Link to={{ type: this.props.section.name.toUpperCase().replace('HAND', ''), payload: { recx1: c.name.replace(' ', '-'), recx2: s.name.replace(' ', '-'), recx: s._id, display: s.name}}}>
                                    {s.name}
                                </Link>
                            </Menu.Item>
                        )}
                    </SubMenu>
                   )}                    
                </Menu>
            </div>
        );
    }
}

const mapDispatch = {go: goToPage, setUser, dispatchAction};
const mapState = ({sections, section, location, io, user, id }) => ({sections, section, location, io, user, id});

export default connect(mapState, mapDispatch)(AppBar);
