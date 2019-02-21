/**
 * Created by Jack V on 9/20/2017.
 */
import React from 'react';
import fetch from 'isomorphic-fetch';
import { fetchData, postQuery } from '.././utils'
import {Row, Col, Button, Icon,  Table, Input, Select, Modal, Menu, Form} from 'antd';
const {Item} = Form;
const {Option} = Select;
import Link, { NavLink } from 'redux-first-router-link'

const headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};

export default class ComplaintType extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            buttonText: 'Add',
            file: null,
            authenticated: false,
            headerHeight: 0,
            data: [],
            complaintTypeFor: [{id:1, name: 'Buyer'}, {id: 2, name: 'Seller'}, {id: 3, name: 'Both'}],
            pagination:
            {
                current: 1,
                total: 0,
                pageSize: 10,
                sorter: {
                    field: "name",
                    order: "asc"
                }
            },
            loading: false,
            confirmLoading: false,
            title: 'New Complaint Type',
            complaintType:{_id: '', name: '', complaintTypeFor: 0},
            searchText: "",
            visible: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.edit = this.edit.bind(this);
        this.Add = this.Add.bind(this);
        this.process = this.process.bind(this);
        this.exit = this.exit.bind(this);
        this.textChange = this.textChange.bind(this);
        this.getItems = this.getItems.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.handleTableChange = this.handleTableChange.bind(this);
        this.cTypeForChanged = this.cTypeForChanged.bind(this);

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

    cTypeForChanged (cTypeFor)
    {
        let complaintType = this.state.complaintType;
        complaintType.complaintTypeFor = cTypeFor;
        this.setState({complaintType: complaintType});
    }

    async componentDidMount()
    {
        const {pagination} = this.state;

        this.getItems({
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        });
    }

    handleTableChange(pagination, filters, sorter)
    {
        const pager = this.state.pagination;
        pager.current = pagination.current;

        this.setState({
            pagination: pager
        });
        this.getItems({
            results: pager.pageSize,
            searchText: this.state.searchText,
            page: pager.current,
            sortField: pager.sorter.field,
            sortOrder: pager.sorter.order
        });
    }

    async getItems (params = {})
    {
        let obj = this;
        this.setState({ loading: true });
        let searchText = params.searchText;
        let results = params.results;
        let page = params.page;
        let sortField = params.sortField;
        let sortOrder = params.sortOrder;
        let query = `itemsPerPage=${results}&searchText=${searchText}&page=${page}&sortField=${sortField}&sortOrder=${sortOrder}`;

        let res = await fetchData('/getCTypes?' + query);
        this.setState({loading: false});
        
        if(res.items.length > 0)
        {
            const {pagination} = this.state;
            pagination.total = res.totalItems;
            res.items.forEach((c, i) => {
                let d = obj.state.complaintTypeFor.find(t => t.id === c.complaintTypeFor);
                if(d !== undefined && d !== null)
                {
                    c.cTypeFor = d.name;
                }
                else{
                    c.cTypeFor = 'None';
                }
            });
            this.setState({
                data: res.items,
                pagination
            });
        }

        if(searchText && searchText.trim().length > 0)
        {
            const reg = new RegExp(searchText, 'gi');
            this.setState({
                filtered: !!searchText,
                data: this.state.data.map((record) =>
                {
                    const match = record.name.match(reg);
                    if (!match)
                    {
                        return null;
                    }
                    return {...record,
                        name: (<span> {record.name.split(reg).map((text, i) => ( i > 0 ? [<span className="highlight">{match[0]}</span>, text] : text
                        ))}
                        </span>
                    )};
                }).filter(record => !!record)
            });
        }
    }

    handleChange(value)
    {
        const {pagination} = this.state;
        pagination.pageSize = parseInt(value);

        this.setState({
            pagination: pagination
        });

        this.getItems({
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        });
    }

    onInputChange (e)
    {
        let searTerm = e.target.value.trim();
        this.setState({searchText: searTerm});
        const {pagination} = this.state;
        this.getItems({
            results: pagination.pageSize,
            searchText: searTerm,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        });
    }

    onSearch()
    {
        const {pagination} = this.state;
        this.getItems({
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        });
    }

    edit(data, row)
    {
        this.setState({visible: true, title: 'Update Complaint Type', buttonText: 'Update', complaintType:data});
    }

    Add()
    {
        this.setState({visible: true, title: 'Add Complaint Type',  buttonText: 'Add', complaintType:{name: ''}});
    }

    async process()
    {
        if(!this.state.complaintType.name)
        {
            alert('Provide all required input and try again');
            return;
        }
        if(!this.state.complaintType.complaintTypeFor)
        {
            alert('Please select a target group');
            return;
        }
        let url = '';
        let payload = {};
        if(!this.state.complaintType._id || this.state.complaintType._id.length < 1)
        {
            payload = {name: this.state.complaintType.name, complaintTypeFor: this.state.complaintType.complaintTypeFor};
            url = '/addCType';
        }
        else
        {
            payload = {_id: this.state.complaintType._id, name: this.state.complaintType.name, complaintTypeFor: this.state.complaintType.complaintTypeFor};
            url = '/editCType';
        }

        this.setState({confirmLoading: true});
        const {pagination} = this.state;
        let params = {
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        };

        let res = await postQuery(url, JSON.stringify(payload));
        this.setState({confirmLoading: false});
        if(res.code > 0)
        {
            this.getItems(params);
            this.setState({visible: false});
        }
        alert(res.message);
    }

    exit()
    {
        this.setState({
            visible: false
        });
    };

    textChange(e)
    {
        const {complaintType} = this.state;
        complaintType[e.target.name] = e.target.value;
        this.setState({complaintType});
    }

    render()
    {
        const columns = [{
            title: 'Complaint Type',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'For',
            dataIndex: 'cTypeFor',
            key: 'cTypeFor'
        },
         {
             title: 'Action',
             dataIndex: '', key: 'x',
             render: (value, row, index) => <a onClick={() => this.edit(value, row)} href="#"><i className="material-icons">mode_edit</i></a>
         }
        ];
        const {buttonText, complaintType, title, searchText, visible, confirmLoading} = this.state;
        return(
                <div  className="main-content" id="mainContent">
                    <div className="custom-filter-dropdown">
                        <Row style={{margin: '20px'}}>
                            <Col span="24">
                                <h4 style={{fontWeight: 'bold', fontSize: '18px'}}>Complaint Types</h4>
                            </Col>
                        </Row>
                        <Row  gutter={2} style={{marginTop: '10px'}}>
                            <Col xs={8} sm={8} md={8} lg={8}>
                                <Select defaultValue="10" id="pageSize" onChange={this.handleChange} style={{ width: '60%'}}>
                                    <Option value="10">10</Option>
                                    <Option value="25">25</Option>
                                    <Option value="50">50</Option>
                                    <Option value="100">100</Option>
                                </Select>
                            </Col>
                            <Col xs={8} sm={8} md={8} lg={8}>
                                <Input className="ant-input-lg-2" style={{ width: '100%'}} placeholder="Search..." value={searchText} onChange={this.onInputChange} onPressEnter={this.onSearch}/>
                            </Col>
                            <Col xs={6} sm={6} md={6} lg={6}>
                                <i className="material-icons" style={{float: 'right', marginRight: '-25px', color: '#07c', cursor: 'pointer'}} onClick={this.Add}>add</i>
                            </Col>
                        </Row>
                        <br/>
                        <Table columns={columns} rowKey={record => record.name} dataSource={this.state.data} pagination={this.state.pagination} loading={this.state.loading} onChange={this.handleTableChange} bordered/>
                    </div>
                    <div className="md-wrapper">
                        <Modal className="modal-width-330"
                               visible={visible}
                               title={title}
                               maskClosable={false}
                               onCancel={this.exit}
                               footer={[
                        <Button className="login-button" loading={confirmLoading} key="submit" type="primary" size="large"  onClick={this.process}>
                          <span id="buttonText">{buttonText}</span>
                        </Button>
                      ]}
                        >
                            <Form>
                                <div>
                                    <Item>
                                        <input onChange={this.textChange} name="name" type="text" className="ant-input ant-input-lg input-no-border" placeholder="Complaint Type *" value={complaintType.name}/>
                                    </Item>    
                                    <Item>
                                        <Select name="complaintTypeFor"
                                                showSearch
                                                style={{width: '100%'}}
                                                placeholder="-- Select * --"
                                                optionFilterProp="children"
                                                value={(complaintType.complaintTypeFor !== undefined && complaintType.complaintTypeFor !== null && complaintType.complaintTypeFor > 0)? complaintType.complaintTypeFor : '-- Target group * --'}
                                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                onChange={this.cTypeForChanged}>
                                            {this.state.complaintTypeFor.map(c => <Option value={c.id} key={c.id}>{c.name}</Option>)}
                                        </Select>
                                    </Item>                                                                    
                                </div>
                            </Form>
                        </Modal>
                    </div>
                </div>
            )
    }
}