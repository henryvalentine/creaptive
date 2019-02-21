/**
 * Created by Jack V on 9/11/2017.
 */

import React from 'react';
import {Row, Col, Carousel, Button, Icon} from 'antd';
import { connect } from 'react-redux'

import {goToPage} from '../actions'

class Landing extends React.Component
{
    constructor(props)
    {
        super(props);
        this.showRegister = this.showRegister.bind(this);     
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
        window.removeListener("scroll");
    }

    componentDidMount()
    {
        if(typeof window !== 'undefined')
        {        
            let carousel = document.getElementById('carousel');
            let landingHeader = document.getElementById('welcomeBar');
            let carouselHeight = carousel.offsetHeight - 110; //80px is the height of welcomeBar 

            window.addEventListener("scroll", function ()
            {          
                let scrollTop = (document.documentElement || document.body.parentNode || document.body).scrollTop;

                if (scrollTop > carouselHeight)
                {   
                    landingHeader.classList.add("landing-top-header_dark");
                }
                else if (scrollTop <= carouselHeight)
                {
                    landingHeader.classList.remove("landing-top-header_dark");
                }
            });
        }
    }

    showRegister()
    {
        if(typeof window !== 'undefined')
        { 
            window.showRegister();
        }
    };

    selectSection(type, location)
    {
        if(typeof window !== 'undefined')
        { 
            document.getElementById('welcomeBar').style.display = 'none';
            document.getElementById('appBar').style.display = '';
            this.props.go(type, location)
        }
    }

    render()
    {
        const settings = {
            dots: true,
            autoplay: true,
            autoplaySpeed: 10,
            swipe: true,
            fade: true
        };
        return(
            <div style={{top: "-65px"}}>
                <Row>
                    <Col  xs={24} sm={24} md={24} lg={24} xl={24} id="carousel">
                        <Carousel  {...settings}>
                            <div className="cr1">
                                <Row type="flex" justify="space-around" align="middle" style={{ minHeight:'100%', height:'100%',backgroundColor: 'rgba(0, 0, 0, 0.3)', textAlign: 'center'}}>
                                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                        <p style={{color:'#fff', fontSize:'1.8em', fontWeight:'bold', textAlign: 'left', padding: '60px'}}>
                                            Make money without a job<br/>
                                            Let the world feel the geek in you<br/>
                                        </p>
                                        <Row className="section-nav">
                                            <div className="ui buttons">
                                                <button className="ui button" role="button" onClick={this.selectSection('SERVICES', 'services')}>
                                                    Services
                                                </button>
                                                <div className="or"></div>
                                                <button className="ui positive button" role="button" onClick={this.selectSection('CRAFTS', 'crafts')}>
                                                    Handcrafts
                                                </button>
                                            </div>
                                        </Row>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{textAlign: 'center'}}>
                                        <Button onClick={this.showRegister} style={{borderRadius: '2px'}} className="unleash"><span><Icon type="left" /> &nbsp;&nbsp;unleash you &nbsp;&nbsp;<Icon type="right" /></span></Button>
                                    </Col>
                                </Row>
                            </div>
                            <div className="cr3">
                                <Row type="flex" justify="space-around" align="middle" style={{minHeight:'100%', height:'100%', backgroundColor: 'rgba(0, 0, 0, 0.3)', textAlign: 'center'}}>
                                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                        <p style={{color:'#fff', fontSize:'1.8em', fontWeight:'bold', textAlign: 'left', padding: '60px'}}>
                                            Break barriers with your capabilities<br/>
                                            The world awaits what you can do
                                        </p>
                                        <Row className="section-nav">
                                        <div className="ui buttons">
                                            <button className="ui button" role="button" onClick={() => this.selectSection('SERVICES', 'services')}>
                                                Services
                                            </button>
                                            <div className="or"></div>
                                            <button className="ui positive button" role="button" onClick={this.selectSection('CRAFTS', 'crafts')}>
                                                Handcrafts
                                            </button>
                                        </div>
                                    </Row>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{textAlign: 'center'}}>
                                        <Button onClick={this.showRegister} style={{borderRadius: '2px'}} className="unleash"><span><Icon type="left" /> &nbsp;&nbsp;unleash you &nbsp;&nbsp;<Icon type="right" /></span></Button>
                                    </Col>
                                </Row>
                            </div>
                        </Carousel>
                    </Col>
                </Row>
                <Row className="page image1">
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
                            <Button onClick={this.showRegister} style={{borderRadius: '2px'}} className="learn-more"><span><Icon type="left" /> &nbsp;&nbsp;unleash you &nbsp;&nbsp;<Icon type="right" /></span></Button>
                        </div><br/> <br/>
                    </Col>
                </Row>
                <Row className="page image2">
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
                                <Button onClick={this.showRegister} style={{borderRadius: '2px'}} className="learn-more"><span><Icon type="left" /> &nbsp;&nbsp;unleash you &nbsp;&nbsp;<Icon type="right" /></span></Button>
                            </label>
                        </p>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} className="page-note-content">
                    </Col>
                </Row>
                <Row className="page" style={{backgroundColor: '#fff', textAlign: 'center'}}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <br/>
                        <Button onClick={this.showRegister} className="unleash-bottom"><span><Icon type="left" /> &nbsp;&nbsp; get started for free &nbsp;&nbsp;<Icon type="right" /></span></Button>
                        <br/> <br/><br/>
                    </Col>
                </Row>
            </div>
        );
    }
}


const mapDispatch = {go: goToPage};
const mapState = ({ location }) => ({ path: location.pathname });

export default connect(mapState, mapDispatch)(Landing);
