/**
 * Created by Jack V on 9/11/2017.
 */

import React from 'react';
import {Layout} from 'antd';
const {Content} = Layout;
import 'antd/dist/antd.css';
import '../styles/app.css';
import SideMenu from './sideMenu';
import Footer from './footer';
import AppBar from './appBar';
import Access from './access';
// import '@fortawesome/fontawesome-free/js/all.js'
import Switcher from './Switcher';
import { connect } from 'react-redux';
import WelcomeBar from './welcomeBar';
import {setUser, dispatchAction} from '../actions';
import { fetchData, postQuery } from '../utils'
import io from "socket.io-client";
import '../accounting.min';


let mql = typeof window !== 'undefined' ? window.matchMedia("screen and (min-width: 800px)") : {};
let mqlSmall = typeof window !== 'undefined' ? window.matchMedia('screen and (max-width : 320px)') || window.matchMedia('screen and (max-width : 360px)') : {};

class AppFrame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            authenticated: false,
            mql: mql,
            socket: null,
            peers: [],
            mqlSmall: mqlSmall,
            verySmallDevice: false,
            smallDevice: false,
            current: 'services',
            searchClicked: false,
            creativeSections: [],
            user: {email: '', firstName: '' ,lastName:  '', id: '', role: '', isAuthenticated: false, name: '', userData: '', geekName: '', geekNameUpper: '', professionalCaption: '', location: {country: 'Not available', ip: '', city: ''}, languages: [], dateRegistered: '', academics: [], onlineStatus: 0, successfulDealsDelivered: 0 },
            categories: {services: [], crafts: []}
        };
  
        this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
        this.toggleHeaderClass = this.toggleHeaderClass.bind(this);
        this.closeSideNav = this.closeSideNav.bind(this);
        this.connect = this.connect.bind(this);

        this.setPeer = this.setPeer.bind(this);
        this.msgRead = this.msgRead.bind(this);
        this.setPeers = this.setPeers.bind(this);
        this.receiveMsg = this.receiveMsg.bind(this);
        this.updateId = this.updateId.bind(this);
        this.checkAuth = this.checkAuth.bind(this);
    }   
    
    closeSideNav()
    {
        document.getElementById('sideNav').style.left = '-256px';
        document.getElementById('navOverLay').style.visibility = 'hidden';
        document.getElementById('navOverLay').style.opacity = 0;
    }

    toggleHeaderClass()
    {
        let scrollTop = (document.documentElement || document.body.parentNode || document.body).scrollTop;
               
        if (!this.state.mql.matches)
        {
            if (scrollTop > this.state.wdHeaderHeight)
            {
                document.getElementById('appBar').classList.add("fixed-header");
            }
            else if (scrollTop <= this.state.wdHeaderHeight)
            {
                document.getElementById('appBar').classList.remove("fixed-header");
            }
        }
        else
        {
            let totalHeight = this.state.wdHeaderHeight + this.state.subMenuHeight;
            if (scrollTop > totalHeight)
            {
                document.getElementById('appBar').classList.add("fixed-header");
            }
            else if (scrollTop <= totalHeight)
            {
                document.getElementById('appBar').classList.remove("fixed-header");
            }
        }
        
    }

    componentWillMount()
    {
        this.checkAuth();
     
    }
 
    checkAuth()
    {
        let el = this;
       
        if(typeof window !== 'undefined')
        {
            let userData = localStorage.getItem('psId');
            if(userData && userData.length > 0)
            {
                fetch("/getUserSession",
                    {
                        method: "GET",
                        headers: {"Content-Type": "application/json", "psid": userData}
                    }).then(function(response)
                {
                    return response.json();
                })
                .then(async function(res)
                {
                    let auth = null;
                    if(res.code > 0)
                    {
                        auth = res;
                        localStorage.removeItem('psId');
                        localStorage.setItem('psId', res.userData);
                    }
                    else
                    {
                        auth = {email: '', firstName: '' , lastName:  '', id: '', role: '', isAuthenticated: false, name: '', userData: '', geekName: '', geekNameUpper: '', professionalCaption: '', location: {address1: '', address2: '', cityId: '', ll: 'Not available'}, languages: [], dateRegistered: '', academics: [], onlineStatus: 0, successfulDealsDelivered: 0 };                                                
                    }

                    el.setState({user: auth});
                    el.props.dispatchAction({ type: 'USER', payload: auth});
                    el.connect(auth);
            
                });
            }
            else{
                el.connect({id: ''});
            }

        }
    }

    componentWillUnmount()
    {
        this.state.mql.removeListener(this.mediaQueryChanged);
        window.removeEventListener("scroll", this.toggleHeaderClass, false);
    }

    async componentWillReceiveProps(nextProps)
    {             
        
    }

    mediaQueryChanged()
    {
        this.setState({
            mql: mql,
            mqlSmall: mqlSmall,
            smallDevice: mql.matches,
            verySmallDevice: mqlSmall.matches
        });

        this.props.dispatchAction({type: 'SCREEN', payload: {
                mql: mql,
                mqlSmall: mqlSmall,
                smallDevice: this.state.mql.matches,
                verySmallDevice: this.state.mqlSmall.matches
            }}) ;

        if (!this.state.mql.matches)
        {
            document.getElementById('mobileHeader').style.display = 'flex';
            document.getElementById('wdHeader').style.display = 'none';
            document.getElementById('subMenu').style.display = 'none';
        }
        else
        {
            document.getElementById('wdHeader').style.display = 'flex';
            document.getElementById('mobileHeader').style.display = 'none';
            document.getElementById('subMenu').style.display = '';
        }
    }

    connect(auth)
    {
        let el = this;
        let endPoint = window.location.origin;
        let socket = io(endPoint);
        socket.on('connect', () =>
        {
            socket.on('online', el.setPeer);
            socket.on('offline', el.setPeer);
            socket.on('disconnected', el.setPeer);
            socket.on('receive', el.receiveMsg);
            socket.on('msgRead', el.msgRead);
            socket.on('idUpdate', el.updateId);
            socket.on('peers', el.setPeers);
            socket.on('error', (e) =>
            {
                alert('WebSocket Error occured. Realtime messaging may not work for now.');
                console.log(e)
            });           
            
            socket.emit('online', auth.id);
            el.setState({socket: socket});     
            el.props.dispatchAction({type: 'IO', payload: socket});      
        });
    }

    setPeer(payload)
    {
        this.props.dispatchAction({type: 'PEER', payload: payload}) ;
    }

    setPeers(peers)
    {
        this.props.dispatchAction({type: 'PEERS', payload: peers}) ;
    }

    receiveMsg(msg)
    {
        if(msg.to === this.props.user.id || msg.receiverSid === this.state.socket.id)
        {
            this.props.dispatchAction({type: 'RECEIVE', payload: msg});
        }
    }

    msgRead(msg)
    {
        if(msg.to === this.props.user.id || msg.receiverSid === this.state.socket.id)
        {
            this.props.dispatchAction({type: 'MSG_READ', payload: msg});
        }
    }

    updateId(msg)
    {
        if(msg.sender === this.props.user.id || msg.senderSid === this.state.socket.id)
        {
            this.props.dispatchAction({type: 'ID_UPDATE', payload: msg});
        }
    }

    async componentDidMount()
    {        
        if(typeof window !== 'undefined')
        {
            this.state.mql.addListener(this.mediaQueryChanged) ;
            this.setState({ mql: mql, smallDevice: mql.matches, mqlSmall: mqlSmall, verySmallDevice: this.state.mqlSmall.matches});
            
            window.addEventListener("scroll", this.toggleHeaderClass, false);

            let wdHeader = document.getElementById('wdHeader');
            let subMenu = document.getElementById('subMenu');
            let wdHeaderHeight = wdHeader.offsetHeight;
            let subMenuHeight = subMenu.offsetHeight;

            this.setState({
                wdHeaderHeight: wdHeaderHeight,
                subMenuHeight: subMenuHeight
            });
        }

        this.setState({
            mql: mql,
            mqlSmall: mqlSmall,
            smallDevice: this.state.mql.matches,
            verySmallDevice: this.state.mqlSmall.matches
        });

        this.props.dispatchAction({type: 'SCREEN', payload: {
                mql: mql,
                mqlSmall: mqlSmall,
                smallDevice: this.state.mql.matches,
                verySmallDevice: this.state.mqlSmall.matches
            }}) ;

        if (!this.state.mql.matches)
        {
            document.getElementById('mobileHeader').style.display = 'flex';
            document.getElementById('wdHeader').style.display = 'none';
            document.getElementById('subMenu').style.display = 'none';
        }
        else
        {
            document.getElementById('wdHeader').style.display = 'flex';
            document.getElementById('mobileHeader').style.display = 'none';
            document.getElementById('subMenu').style.display = '';
        }

        //determine default section from SEO navigation
        let location = window.location.pathname;  
        let paths = location.split('/').filter(entry => /\S/.test(entry)); //split url and remove empty elemnts from array
       
        let creativeSections = await fetchData('/getAllCreativeSections');
        if(creativeSections.length > 0)
        {
            this.props.dispatchAction({type: 'SECTIONS', payload: creativeSections}) ;
            
            //Set default section
            let section = creativeSections.find(s => s.name.toLowerCase().includes('services'));
            
            //OR get current section from the url
            if(location !== '/' && paths[0].includes('crafts'))
            {
                section = creativeSections.find(s => s.name.toLowerCase().includes('crafts') || s.name.toLowerCase().includes('handcrafts'));
            }            
            
            if(section && section._id.length > 0)
            {
                this.props.dispatchAction({ type: 'SECTION', payload: section});
            } 
        }
    }

    render()
    {
        return(
            <div>
                <SideMenu/>
                <div id="main">
                    <div id="navOverLay" className="navOverLay" onClick={this.closeSideNav}></div>
                    <AppBar/>
                    <WelcomeBar/>
                    <Layout className='layout'>                        
                        <Content id="content" className="app-content">
                           <Switcher />
                        </Content>
                        <Footer/>
                    </Layout>
                </div>
                <div id="access" style={{display: 'none'}}>
                    <Access/>
                </div>
                <script src="https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/flwpbf-inline.js"></script>
            </div>
        );
    }
}

const mapDispatch = {setUser, dispatchAction};
const mapState = ({ user, sections, location }) => ({user, sections, location });

export default connect(mapState, mapDispatch)(AppFrame);