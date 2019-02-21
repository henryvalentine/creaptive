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

export default class CreativeCategory extends React.Component
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
            creativeSections: [],
            title: 'New Creative Category',
            creativeCategory:{_id: '', name: '', iconType: '', creativeSection: {_id: '', name: ''}},
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
        this.selectionChanged = this.selectionChanged.bind(this);

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
        let creativeSections = await fetchData('/getAllCreativeSections');
        if(creativeSections.length > 0)
        {
            this.setState({creativeSections: creativeSections});
        }
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
        this.setState({ loading: true });
        var searchText = params.searchText;
        var results = params.results;
        var page = params.page;
        var sortField = params.sortField;
        var sortOrder = params.sortOrder;
        let el = this;
        var query = `itemsPerPage=${results}&searchText=${searchText}&page=${page}&sortField=${sortField}&sortOrder=${sortOrder}`;

        let res = await fetchData('/getCreativeCategories?' + query);
        el.setState({loading: false});

        if(res.items.length > 0)
        {
            const {pagination} = el.state;
            pagination.total = res.totalItems;
            let items = [];
            res.items.forEach((c, i) =>
            {
                c.creativeSectionName = c.creativeSection.name;
                items.push(c);
            });
            el.setState({
                data: items,
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
        this.setState({visible: true, title: 'Update Creative Category', buttonText: 'Update', creativeCategory: data});
    }

    Add()
    {
        this.setState({visible: true, title: 'Add Creative Category',  buttonText: 'Add', creativeCategory:{name: '', iconType: '', creativeSection: {_id: '', name: ''}}});
    }

    async process()
    {
        if(!this.state.creativeCategory.name || !this.state.creativeCategory.creativeSection)
        {
            alert('Provide all required input and try again');
            return;
        }
        let url = '';
        let payload = {};
        if(!this.state.creativeCategory._id || this.state.creativeCategory._id.length < 1)
        {
            url = '/addCreativeCategory';
            payload = {iconType: this.state.creativeCategory.iconType, name: this.state.creativeCategory.name, creativeSection: this.state.creativeCategory.creativeSection._id};
        }
        else
        {
            url = '/editCreativeCategory';
            payload = {_id: this.state.creativeCategory._id, iconType: this.state.creativeCategory.iconType, name: this.state.creativeCategory.name, creativeSection: this.state.creativeCategory.creativeSection._id};
        }

        const {pagination} = this.state;
        let params = {
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        };

        this.setState({confirmLoading: true});
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
        const {creativeCategory} = this.state;
        creativeCategory[e.target.name] = e.target.value;
        this.setState({creativeCategory});
    }

    selectionChanged(prop, feature, val, innerFeature)
    {
        if(innerFeature !== undefined && innerFeature !== null && innerFeature.length > 0)
        {
            let stateObj = this.state[prop];
            stateObj[feature][innerFeature] = val;
            this.setState({[prop]: stateObj});
        }
        else
        {
            this.setState({[prop]: {...this.state[prop], [feature]: val}});
        }
    }

    render()
    {
        const columns = [{
            title: 'Creative Category',
            dataIndex: 'name',
            key: 'name',
            // sorter: true
        },
        {
            title: 'Icon Type',
            dataIndex: 'iconType',
            key: 'iconType',
            // sorter: true
        },
        {
            title: 'Creative Section',
            dataIndex: 'creativeSectionName',
            key: 'creativeSectionName'
            // sorter: true
        },
         {
             title: 'Action',
             dataIndex: '', key: 'x',
             render: (value, row, index) => <a onClick={() => this.edit(value, row)} href="#"><i className="material-icons">mode_edit</i></a>
         }
        ];
        const {buttonText, creativeCategory, title, searchText, visible, confirmLoading} = this.state;
        return(
                <div  className="main-content" id="mainContent">
                    <div className="custom-filter-dropdown">
                        <Row style={{margin: '20px'}}>
                            <Col span="24">
                                <h4 style={{fontWeight: 'bold', fontSize: '18px'}}>Creative Categories</h4>
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
                                <div id="singleEntryForm">
                                    <Item>
                                        <input onChange={this.textChange} name="name" type="text" className="ant-input ant-input-lg input-no-border" placeholder="Creative Category Name" value={creativeCategory.name}/>
                                    </Item>
                                    <Item>
                                        <input onChange={this.textChange} name="iconType" type="text" className="ant-input ant-input-lg input-no-border" placeholder="Icon Type" value={creativeCategory.iconType}/>
                                    </Item>
                                    <Item>
                                        <Select name="creativeSection"
                                                style={{  width: '100%' }}
                                                placeholder="Creative Section"
                                                optionFilterProp="children"
                                                value={(creativeCategory.creativeSection || creativeCategory.creativeSection._id.length > 0)? creativeCategory.creativeSection._id : ''}
                                                onChange={(val) => this.selectionChanged('creativeCategory', 'creativeSection', val, '_id')}>
                                            <Option value="">- Creative Section -</Option>
                                            {this.state.creativeSections.map(section => <Option value={section._id} key={section._id}>{section.name}</Option>)}
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