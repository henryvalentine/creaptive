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

class Cre extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            headerHeight: 0,
            loading: false,
            geekName: '',
            page: 1,
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
        let peers = this.props.peers;
        let geeks = this.state.geeks;
        let el = this;
        let isAuth = (el.props.user !== undefined && el.props.user.id.length > 0);

        console.log('\nPEERS\n');
        console.log(peers);
        if(peers.length > 0)
        {
            geeks.forEach((g, i) =>
            {
                if(g._id === el.props.user.id && isAuth === true)
                {
                    g.socketId = (el.props.socket !== undefined && el.props.socket !== null)? el.props.socket.id : '';
                    g.isConnected = true;  
                }
                else
                {
                    console.log('\nELSE\n');
                    console.log(g._id + ' : ' + g.socketId);
                    let o = peers.find(p => (g.socketId !== undefined && g.socketId !== null && g.socketId.length > 0 && g.socketId === p.peer) || (p.auth !== undefined && p.auth !== null && p.auth.length > 0 && p.auth === g._id));        
                    if(o !== undefined && o !== null)
                    {
                        g.socketId = o.peer;
                        g.isConnected = (o.auth !== undefined && o.auth !== null && o.auth.length > 0 && o.auth === g._id);               

                        console.log('\nELSE PEER FOUND\n');
                        console.log(g._id + ' : ' + g.isConnected);
                    }
                    else
                    {
                        g.socketId = (el.props.socket !== undefined && el.props.socket !== null)? el.props.socket.id : '';
                        g.isConnected = false; 
                    }
                }
            });
            el.setState({geeks: geeks});
        }
        else
         {      
            geeks.forEach((g, j) =>
            {
                if(isAuth === true && g._id === el.state.user.id)
                {
                    g.socketId = (el.props.socket !== undefined && el.props.socket !== null)? el.props.socket.id : '';
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

    componentWillMount()
    {
        
    }

    async getGeeks()
    {
        let el = this;
        let body = JSON.stringify({itemsPerPage: 10, searchText:"", page: this.state.page});
        let res = await postQuery('/getGeeks', body);
        if(res !== undefined && res.length > 0)
        {
            // res.forEach(function(user, i)
            // {

            //     if(user.location === undefined || user.location === null || user.location.city === undefined)
            //     {
            //         user.location = {country: 'N/A', ip: '', city: ''};
            //     }
            // });

            const geeks = [].concat(this.state.geeks, res);
            let page = this.state.page + 1;
            this.setState({geeks: geeks, page: page});
            this.getGeeks();
        }
        // else
        // {
        //     this.checkConnections();
        // }
    }

    componentDidMount()
    {
        // if(this.props.io !== undefined && this.props.io !== null)
        // {
        //     this.setState({socket: this.props.io});
        // } 
        // if(this.props.peers !== undefined && this.props.peers !== null && this.props.peers.length > 0)
        // {
        //     this.setState({peers: this.props.peers});
        //     // this.checkConnections(); 
        // }
        // if(this.props.user === 'object' && this.props.user === 'object')
        // {
        //     this.setState({user: this.props.user});    
        //     // this.checkConnections(); 
        // }
        this.getGeeks();
    }

    componentWillReceiveProps(nextProps)
    { 
       
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
                                <div className="ant-card-body pfs list-it" style={{ padding: '2px !important'}}>
                                    <div className="ant-row" style={{textAlign: 'center'}}>
                                        {/*<img alt='banner' width="100%" src={s.profileImagePath} />*/}
                                        <span className="ant-avatar dfs divTera ant-avatar-circle" style={{textAlign: 'center'}}>
                                            <img alt="Profile image" src={s.profileImagePath}/>
                                        </span>
                                        {/* <div style={{float: 'right', overflow: 'hidden', marginRight: '60px'}}>
                                            <label style={{float: 'right', zIndex: '3', position: 'absolute', marginTop : '5px'}}>
                                                {s.isConnected === true? <span className="status-indicator"><i className="fa fa-circle"></i>Online</span> :
                                                        <span style={{color: '#FF9800', fontSize: '16px'}}>Offline</span>}</label>
                                        </div> */}
                                    </div>
                                    <div className="ant-row" style={{textAlign: 'center', marginTop: '10px'}}>
                                        <NavLink style={{textAlign: 'center',cursor: "pointer", fontSize: '15px !important'}} className="appAnchor" to={`/cr/${s.geekName}`}>
                                            {s.geekName}
                                        </NavLink>
                                    </div>
                                    <div className="ant-row caption-border">
                                    {s.professionalCaption && s.professionalCaption && <div className='ant-col-24 crecolor-f'>
                                            <label style={{fontSize: '13px'}}>{s.professionalCaption}</label>
                                        </div>}
                                    </div>
                                    <div className="ant-row" style={{textAlign: 'center', marginTop: '10px'}}>
                                        <div className='ant-col-24 crecolor' style={{marginTop: '1px',}}>
                                            Joined on:  <label style={{float: 'right', fontWeight: 'bold'}}>{getMonthYear(s.dateRegistered)}</label>
                                        </div>
                                    </div>
                                    <div className="ant-row">
                                        <div className='ant-col-24 crecolor'>
                                            Deals completed:  <label style={{float: 'right', fontWeight: 'bold'}}>{(s.successfulDealsDelivered === undefined || s.successfulDealsDelivered === null)? 0 : s.successfulDealsDelivered}</label>
                                        </div>
                                    </div>
                                    {/*<div style={{width: '100%', maxHeight:'40px !important', minHeight: '40px !important'}}>*/}
                                        {/*<span> {s.skills.map(k => {*/}
                                            {/*return k.name += ',';*/}
                                        {/*})}</span>*/}
                                    {/*</div>*/}
                                </div>
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

export default connect(mapState, mapDispatch)(Cre);