/**
 * Created by Jack V on 9/11/2017.
 */

import React from 'react';
import {Row, Col, Carousel, Button, Icon, message, Avatar, Menu} from 'antd';
const {SubMenu} = Menu;
import { connect } from 'react-redux';
import {goToPage, navigateLink, setUser, dispatchAction} from '../actions';
import Link, { NavLink } from 'redux-first-router-link';
class Landing extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = 
        {
            landingHeader: 0,
            unleashButtonPosition: 0,
            authenticated: false
        };

        this.showRegister = this.showRegister.bind(this);
        this.logOut = this.logOut.bind(this);
        this.selectSection = this.selectSection.bind(this);
        this.toggleHeaderBackgroundColor = this.toggleHeaderBackgroundColor.bind(this);
    }

    componentWillMount()
    {
        if(typeof document !== 'undefined')
        {
            document.getElementById('appBar').style.display = 'none';
            document.getElementById('welcomeBar').style.display = '';
        }      
               
    }   

    componentWillUnmount()
    {
        window.removeEventListener("scroll", this.toggleHeaderBackgroundColor, false);
        if(typeof document !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }
    }  

    componentDidMount()
    {
        message.config({
            top: 100,
            duration: 5
        });

        if(typeof window !== 'undefined')
        {        
            let unleashButton = document.getElementById('unleash');
            let landingHeader = document.getElementById('welcomeBar');
            let unleashButtonPosition = 90;
            if(unleashButton !== undefined && unleashButton !== null)
            {
                unleashButtonPosition = unleashButton.offsetTop + 90;
            }
            this.setState({
                landingHeader: landingHeader,
                unleashButtonPosition: unleashButtonPosition
            });

            window.addEventListener("scroll", this.toggleHeaderBackgroundColor, false);
        }        
    }

    componentWillReceiveProps(nextProps)
    {
        if(typeof window !== 'undefined')
        {
            let unleashButton = document.getElementById('unleash');
            let unleashButtonPosition = 90;
            if(unleashButton !== undefined && unleashButton !== null)
            {
                unleashButtonPosition = unleashButton.offsetTop + 90;
            }
            this.setState({
                unleashButtonPosition: unleashButtonPosition
            });
        }
    }

    toggleHeaderBackgroundColor()
    {          
        let scrollTop = (document.documentElement || document.body.parentNode || document.body).scrollTop;

        if (scrollTop > this.state.unleashButtonPosition)
        {   
          this.state.landingHeader.classList.add("landing-top-header_dark");
        }
        else if (scrollTop <= this.state.unleashButtonPosition)
        {
            this.state.landingHeader.classList.remove("landing-top-header_dark");
        }
    }

    showRegister()
    {
        if(typeof window !== 'undefined')
        { 
            window.showRegister();
        }
    };

    selectSection(type, location, payload)
    {
        let obj = this;
        if(typeof window !== 'undefined')
        { 
            document.getElementById('welcomeBar').style.display = 'none';
            document.getElementById('appBar').style.display = '';
        }
        
        obj.props.dispatchAction({ type: 'SECTION', payload: payload});
        setTimeout(function()
        {         
            navigateLink(type, { recx: payload._id});
        }, 300);                   
    }

    logOut()
    {
        let el = this;
        this.setState({
            confirmLoading: true
        });
        fetch("/logout",
            {
                method: "POST",
                headers: headers
            }).then(function(response)
            {
                return response.json();
            })
            .then(function(res)
            {
                this.setState({
                    confirmLoading: false
                });
                if(res.code > 0)
                {
                    window.isAuthenticated = false;        
                    el.props.setUser('USER', {id: res.id, email: el.state.email.trim(), name:  res.name, role: res.role, isAuthenticated: res.isAuthenticated, profileImage: response.profileImage}) 
                }

            });        
    };

    render()
    {
        const settings = {
            dots: true,
            autoplay: true,
            swipe: true,
            fade: false
        };

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

        return(
            <div style={{top: "-65px"}}>
                <Row id="carousel">
                    <Col className="lnd-Carousel" span={24}>
                        <Carousel  {...settings}>
                            <div className="cr1">
                                <Row type="flex" justify="space-around" align="middle" style={{ minHeight:'100%', height:'100%',backgroundColor: 'rgba(0, 0, 0, 0.3)', textAlign: 'center'}}>
                                    <Col span={24}>
                                        <p className='adv'>
                                            Want the world to feel the geek in you?<br/>
                                            Want to make money without a job?<br/>
                                            Need a solution about something?<br/><br/>
                                            just come in...
                                        </p>
                                        {this.props.sections && <Row className="section-nav">
                                            <div className="ui buttons">
                                                <button className="ui button" role="button" onClick={() => this.props.dispatchAction({type: 'SERVICES', payload: { recx: service._id}})}>
                                                    Services
                                                </button> 
                                                <div className="or"></div> 
                                                <button className="ui positive button" onClick={() => this.props.dispatchAction({type: 'CRAFTS', payload: { recx: craft._id}})} role="button">
                                                    Handcrafts
                                                </button>
                                            </div>
                                        </Row>}
                                    </Col>
                                </Row>
                            </div>
                            <div className="cr2">
                                <Row type="flex" justify="space-around" align="middle" style={{minHeight:'100%', height:'100%', backgroundColor: 'rgba(0, 0, 0, 0.3)', textAlign: 'center'}}>
                                    <Col span={24}>
                                        <p  className='adv'>
                                            It doesn't matter where you are or who you are...<br/>
                                            What can you do?<br/>
                                            What do you want to achieve?
                                        </p>
                                        {this.props.sections && <Row className="section-nav">
                                            <div className="ui buttons">
                                                <button className="ui button" role="button" onClick={() => this.props.dispatchAction({type: 'SERVICES', payload: { recx: service._id}})}>
                                                    Services
                                                </button> 
                                                <div className="or"></div> 
                                                <button className="ui positive button" onClick={() => this.props.dispatchAction({type: 'CRAFTS', payload: { recx: craft._id}})} role="button">
                                                    Handcrafts
                                                </button>
                                            </div>
                                        </Row>}
                                    </Col>
                                </Row>
                            </div>
                            <div className="cr3">
                                <Row type="flex" justify="space-around" align="middle" style={{minHeight:'100%', height:'100%', backgroundColor: 'rgba(0, 0, 0, 0.3)', textAlign: 'center'}}>
                                    <Col span={24}>
                                        <p  className='adv'>
                                            Break barriers with your capabilities<br/>
                                            Creativity doesn't recognise borders!
                                        </p>
                                        {this.props.sections && <Row className="section-nav">
                                            <div className="ui buttons">
                                                <button className="ui button" role="button" onClick={() => this.props.dispatchAction({type: 'SERVICES', payload: { recx: service._id, display: service.name}})}>
                                                    Services
                                                </button> 
                                                <div className="or"></div> 
                                                <button className="ui positive button" onClick={() => this.props.dispatchAction({type: 'CRAFTS', payload: { recx: craft._id, display: craft.name}})} role="button">
                                                    Handcrafts
                                                </button>
                                            </div>
                                        </Row>}
                                    </Col>
                                </Row>
                            </div>
                        </Carousel>
                    </Col>
                </Row>
                <Row className="page image1 s-wrapper" style={{backgroundColor: '#fff'}}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} className="page-note-content">
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} className="page-note page-note-content">
                        <br/><br/><br/>
                        <h2>
                            What can you do?
                        </h2>
                        <p style={{opacity: '1', transform: 'translate(0px, 0px)', fontWeight: 'bold'}}>
                            Can you produce irresistible graphic designs?<br/><br/>
                            Are you a fine artist who can also sculpt?<br/><br/>
                            Are you good in weaving, embroidery, pottery, and stuffs like that?<br/><br/>
                            Are you a business mogul, an entrepreneur, or a legal practitioner?<br/><br/>
                            Are you a software geek who can do apps for any platform even wearables?<br/><br/>
                            Then welcome to the home for the skilled and Creatives Actively doing Apt stuffs for MO&#8358;EY.
                        </p><br/>
                        <div>

                            {(!this.props.user || !this.props.user.isAuthenticated)?
                                <Button onClick={this.showRegister} style={{borderRadius: '2px'}} className={`learn-more ${this.props.user.isAuthenticated === false? 'show' : 'hide'}`}><span><Icon type="left" /> &nbsp;&nbsp;unleash you &nbsp;&nbsp;<Icon type="right" /></span></Button>
                                :
                                ''
                            }
                        </div><br/> <br/>
                    </Col>
                </Row>
                <Row className="page image2 s-wrapper" style={{backgroundColor: '#fff'}}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} className="page-note page-note-content-2">
                        <br/><br/>
                        <p style={{opacity: '1', transform: 'translate(0px, 0px)', fontWeight: 'bold', float:'right'}}>
                            <label style={{fontSize:'1.5em', fontWeight:'bold'}}>
                                Are you in Africa or beyond?
                            </label>
                            <br/> <br/>
                            <label style={{fontWeight:'bold'}}>
                                Are you in Nigeria, Kenya, South Africa or Ghana?<br/><br/>
                                Buy and sell services & crafted stuffs in your local currency<br/><br/>
                                Wherever you are, let your creativity and skills take you to the ends of the world<br/><br/>
                                Whatever be your skill or business in craft, come onboard<br/>
                            </label><br/> <br/>
                            <label style={{opacity: '1', transform: 'translate(0px, 0px)'}}>
                                <Button onClick={this.showRegister} style={{borderRadius: '2px'}} className={`learn-more ${this.props.user.isAuthenticated === false? 'show' : 'hide'}`}><span><Icon type="left" /> &nbsp;&nbsp;unleash you &nbsp;&nbsp;<Icon type="right" /></span></Button>
                            </label>
                        </p>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} className="page-note-content">
                    </Col>
                </Row>
                <Row className="page s-wrapper" style={{backgroundColor: '#fff', textAlign: 'center'}}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <br/>
                        {(!this.props.user || !this.props.user.isAuthenticated)?
                            <Button onClick={this.showRegister} className={`unleash-bottom ${this.props.user.isAuthenticated === false? 'show' : 'hide'}`}><span><Icon type="left" /> &nbsp;&nbsp; get started for free &nbsp;&nbsp;<Icon type="right" /></span></Button>
                            :
                            ''
                        }

                        <br/> <br/><br/>
                    </Col>
                </Row>
            </div>

        );
    }
}


const mapDispatch = {go: goToPage, setUser, dispatchAction};
const mapState = ({sections, location, user }) => ({ sections, location, user });

export default connect(mapState, mapDispatch)(Landing);
