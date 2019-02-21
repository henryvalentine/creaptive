/**
 * Created by Jack V on 9/20/2017.
 */

import React from 'react';
import {Row, Col, Card, Button, Icon} from 'antd';
import sample from '../../images/sample.png';
export default class Crafts extends React.Component
{
    constructor(props)
    {
        super(props);

        if(typeof document !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }
    }

    componentWillMount()
    {
        
    }

    componentWillUnmount()
    {

    }

    componentDidMount()
    {
        
    }

    render()
    {
        return(
            <div className="main-content" id="mainContent">
                <Row gutter={2}>
                    <Col xs={24} sm={12} md={6} lg={6} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                        <Card bodyStyle={{ padding: 0 }}>
                            <div className="custom-image">
                                <img alt="example" width="100%" src={sample} />
                            </div>
                            <div className="custom-card">
                                <h3>Europe Street beat</h3>
                                <p>www.instagram.com</p>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                        <Card bodyStyle={{ padding: 0 }}>
                            <div className="custom-image">
                                <img alt="example" width="100%" src={sample} />
                            </div>
                            <div className="custom-card">
                                <h3>Europe Street beat</h3>
                                <p>www.instagram.com</p>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                        <Card bodyStyle={{ padding: 0 }}>
                            <div className="custom-image">
                                <img alt="example" width="100%" src={sample} />
                            </div>
                            <div className="custom-card">
                                <h3>Europe Street beat</h3>
                                <p>www.instagram.com</p>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                        <Card bodyStyle={{ padding: 0 }}>
                            <div className="custom-image">
                                <img alt="example" width="100%" src={sample} />
                            </div>
                            <div className="custom-card">
                                <h3>Europe Street beat</h3>
                                <p>www.instagram.com</p>
                            </div>
                        </Card>
                    </Col>                     
                </Row>              
        </div>
        );
    }
}