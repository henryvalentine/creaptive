/**
 * Created by Jack V on 9/20/2017.
 */
import React from 'react';
import {Row, Col, Spin, Modal, Card, Icon, Avatar, Menu, message} from 'antd';
import {goToPage, setUser, dispatchAction} from '../actions';
import { connect } from 'react-redux';
import { fetchData, postQuery, fetchExternal } from '../utils'
import Link, { NavLink } from 'redux-first-router-link';
// import Crep from './crep';

class Geeks extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            headerHeight: 0,
            loading: false,
            screen: {},
            geekName: '',
            page: 0,
            peers: [],
            geeks: [],
            user: {email: '', firstName: '' ,lastName:  '', id: '', role: '', iAmTheGeek: false, name: '', userData: '', geekName: '', geekNameUpper: '', professionalCaption: '', location: {country: 'Not available', ip: '', city: ''}, languages: [], dateRegistered: '', academics: [], onlineStatus: 0, successfulDealsDelivered: 0, phoneNumberConfirmed: false},
        };

        this.getGeeks = this.getGeeks.bind(this);
        this.checkConnections = this.checkConnections.bind(this);

        if(typeof document !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }
    }

    checkConnections()
    {
        let peers = this.state.peers;
        let geeks = this.state.geeks;
        let el = this;
        let isAuth = (el.state.user !== undefined && el.state.user !== null && el.state.user.id.length > 0);
       
        if(peers !== undefined && peers.length > 0 && geeks.length > 0)
        {
            geeks.forEach((g, i) =>
            {
                let peerFound = peers.filter((p) =>
                {
                    return p.au !== undefined && p.au !== null && p.au === g._id
                });       
        
                console.log('\npeerFound\n');
                console.log(peerFound);

                if(peerFound.length > 0)
                {
                    g.socketId = peerFound[0].peer;
                    g.isConnected = true;          
                    
                    console.log('\nNew Peer Info connected\n');
                    console.log(g.geekName + ' is connected: ' + g.isConnected);
                }
                else
                {
                    if(isAuth === true && g._id === el.state.user.id)
                    {
                        g.socketId = (el.state.socket !== undefined && el.state.socket !== null)? el.state.socket.id : '';
                        g.isConnected = true;  
                    }
                    else
                    {
                        if(isAuth === false)
                        {
                            g.socketId = (el.state.socket !== undefined && el.state.socket !== null)? el.state.socket.id : '';
                            g.isConnected = false;  
                        }
                        else
                        {
                            g.socketId = '';
                            g.isConnected = false; 
                        }
                    }
                             
                }
            });
            el.setState({geeks: geeks});
        }
        else
         {
             if(peers.length <  1 && geeks.length > 0)
             {
                 geeks.forEach((g, j) =>
                 {
                    if(isAuth === true && g._id === el.state.user.id)
                    {
                        g.socketId = (el.state.socket !== undefined && el.state.socket !== null)? el.state.socket.id : '';
                        g.isConnected = true;  
                    }
                    else
                    {
                        g.socketId = '';
                        g.isConnected = false; 
                    }
                 });

                 el.setState({geeks: geeks});
             }
        }
    }

    // componentWillMount(){
    //     this.getGeeks();
    // }

    async getGeeks()
    {
        let el = this;
        let body = JSON.stringify({itemsPerPage: 10, searchText:"", page: this.state.page});
        let res = await postQuery('/getGeeks', body);
        if(res !== undefined && res.length > 0)
        {
            let isAuth = (el.state.user !== undefined && el.state.user.id.length > 0);
            res.forEach(function(user, i)
            {
                // user.skills = [];
                user.dateRegistered = getMonthYear(user.dateRegistered);
                user.isConnected = false;
                user.socketId = '';            
                if(isAuth)
                {
                    if(el.state.user.id === user._id)
                    {
                        user.isConnected = true;
                        // if(el.state.socket !== undefined && el.state.socket !== null && el.state.socket.id.length > 0)
                        // {
                        //     user.socketId = el.state.socket.id;
                        // }
                    }
                }
                
                // if(user.topSpecialties !== undefined && user.topSpecialties !== null && user.topSpecialties.length > 0)
                // {
                //     user.topSpecialties.forEach((s, i) =>
                //     {
                //         user.skills.push({skill: s.skill._id, name: s.skill.name, level: s.level});
                //     });
                // }

                if(user.location === undefined || user.location === null || user.location.city === undefined)
                {
                    user.location = {country: 'N/A', ip: '', city: ''};
                }
            });

            const geeks = [].concat(this.state.geeks, res);
            let page = this.state.page + 1;
            this.setState({geeks: geeks, page: page});
            // this.getGeeks();
        }
        else
        {
            this.checkConnections();
        }
    }

    componentDidMount()
    {
        let el = this;
        if(el.props.peers !== undefined && el.props.peers !== null && el.props.peers.length > 0)
        {
            el.setState({peers: el.props.peers});
        }
        // el.getGeeks();
    }

    componentWillReceiveProps(nextProps)
    {
        if(nextProps.io !== undefined && nextProps.io !== null)
        {
            this.setState({socket: nextProps.io});
            console.log('\nSocket received\n');
            console.log(nextProps.io.id);
        }       

        if(typeof nextProps.user === 'object' && typeof nextProps.user === 'object')
        {
            this.setState({
                user: nextProps.user
            });
            // this.checkConnections();
        }

        if(nextProps.peers !== undefined && nextProps.peers !== null)
        {
            this.setState({
                peers: nextProps.peers
            });
            // this.checkConnections();
        }

        if(nextProps.screen !== undefined && nextProps.screen !== null && nextProps.screen.mql !== undefined)
        {
            this.setState({
                screen: nextProps.screen
            });
        }
    }

    render()
    {
        // let isAuth = this.state.user !== undefined && this.state.user.id !== undefined && this.state.user.id.length > 0;
        let hasPrevLocation = this.props.location.prev !== undefined && this.props.location.prev !== null && this.props.location.prev.pathname.length > 0;
        let prev = this.props.location.routesMap[this.props.location.prev.type];
        let ff = this.props.location.routesMap[this.props.location.type];

        return(
            <Row>
                {this.state.geeks !== undefined  && this.state.geeks !== null && this.state.geeks.length > 0
                && <div className="main-content" id="mainContent">

                    <Row id="msg" style={{width: '100%', margin: '1px', display: 'none'}}>
                        <label id="ms">
                            {this.state.message}
                        </label>
                        <br/><br/>
                    </Row>
                    <Row style={{paddingLeft: '15px', paddingRight: '8px', marginBottom: '5px'}}>
                        <Col span={24}>
                        <span style={{color: 'rgba(0, 0, 0, 0.65)', paddingLeft: '8px'}}>
                            { hasPrevLocation && <NavLink className="appAnchor" to={this.props.location.prev.pathname}>{prev.display}</NavLink>}
                            { hasPrevLocation && <span>&nbsp;>&nbsp;</span>}
                            <NavLink className="appAnchor" exact to={this.props.location.pathname}>{ff.display}</NavLink>
                        </span>
                        </Col>
                    </Row>
                    <Row gutter={2} className="s-list">
                        {this.state.geeks.map(s =>
                            <Col key={s._id} xs={24} sm={12} md={8} lg={6} style={{ paddingLeft: '8px', paddingRight: '8px', paddingBottom: '8px'}}>
                                <Card className="ant-card-body pfs list-it" style={{ padding: '2px !important'}}>
                                    <div className="ant-row" style={{textAlign: 'center'}}>
                                        {/*<img alt='banner' width="100%" src={s.profileImagePath} />*/}
                                        <span className="ant-avatar dfs divTera ant-avatar-circle" style={{textAlign: 'center'}}>
                                            <img alt="Profile image" src={s.profileImagePath}/>
                                        </span>
                                        <div style={{float: 'right', overflow: 'hidden', marginRight: '60px'}}>
                                            <label style={{float: 'right', zIndex: '3', position: 'absolute', marginTop : '5px'}}>
                                                {s.isConnected === true? <span className="status-indicator"><i className="fa fa-circle"></i>Online</span> :
                                                        <span style={{color: '#FF9800', fontSize: '16px'}}>Offline</span>}</label>
                                        </div>
                                    </div>
                                    <div className="ant-row" style={{textAlign: 'center', marginTop: '10px'}}>
                                        <NavLink style={{textAlign: 'center',cursor: "pointer", fontSize: '15px !important'}} className="appAnchor" to={`/cre/${s.geekName}`}>
                                            {s.geekName}
                                        </NavLink>
                                    </div>
                                    <Row style={{textAlign: 'center', marginTop: '2px', borderBottom: '1px dotted #e0e0e0', paddingBottom: '5px'}}>
                                        {s.professionalCaption && s.professionalCaption && <Col span={24}>
                                            <label style={{fontSize: '13px'}}>{s.professionalCaption}</label>
                                        </Col>}
                                    </Row>
                                    <Row>
                                        <Col span={24} style={{marginTop: '1px'}}>
                                            Joined on:  <label style={{float: 'right', fontWeight: 'bold'}}>{s.dateRegistered}</label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={24}>
                                            Deals completed:  <label style={{float: 'right', fontWeight: 'bold'}}>{(s.successfulDealsDelivered === undefined || s.successfulDealsDelivered === null)? 0 : s.successfulDealsDelivered}</label>
                                        </Col>
                                    </Row>
                                    {/*<div style={{width: '100%', maxHeight:'40px !important', minHeight: '40px !important'}}>*/}
                                        {/*<span> {s.skills.map(k => {*/}
                                            {/*return k.name += ',';*/}
                                        {/*})}</span>*/}
                                    {/*</div>*/}
                                </Card>
                            </Col>)}
                    </Row>
                </div>}

                {/* {this.state.geekName !== undefined  && this.state.geekName !== null && this.state.geekName.length > 0 && this.state.crep === true
                && <Crep go ={this.props.go} sections = {this.props.sections} user = {this.state.user}
                         location = {this.props.location} screen = {this.props.screen} cre = {this.props.cre}
                         dispatchAction = {this.props.dispatchAction} geekName = {this.state.geekName}
                   />
                } */}

                <Spin size="large" spinning={this.state.loading} />
            </Row>
        );
    }
}

function getMonthYear(d = null)
{
    if (d === undefined || d === null)
    {
        d = new Date();
    }
    else
    {
        d = new Date(d);
    }
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let monthYear = '';
    let monthNames = months.filter(function(m){
        return m.id === parseInt(month);
    });
    if(monthNames.length > 0)
    {
        monthYear = monthNames[0].name + ', ' + year;
    }
    else{
        monthYear = month + ', ' + year;
    }
    return monthYear;
}

let months = [{id: 1, name: 'January'}, {id: 2, name: 'February'}, {id: 3, name: 'March'}, {id: 4, name: 'April'}, {id: 5, name: 'May'}, {id: 6, name: 'June'}, {id: 7, name: 'July'}, {id: 8, name: 'August'}, {id: 9, name: 'September'}, {id: 10, name: 'October'}, {id: 11, name: 'November'}, {id: 12, name: 'December'}]

const mapDispatch = {go: goToPage, setUser, dispatchAction};
const mapState = ({sections, peers, location, user, screen}) => ({sections, peers, location, user, screen});

export default connect(mapState, mapDispatch)(Geeks);

// const mapDispatch = {go: goToPage, setUser, dispatchAction};
// const mapState = ({sections, location, user, geek, geekSpace, geekMiss, geekSpaceMiss, cre, screen}) => ({sections, location, user, geek, geekSpace, geekMiss, geekSpaceMiss, cre, screen});
//
// export default connect(mapState, mapDispatch)(Crep);