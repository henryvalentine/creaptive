/**
 * Created by Jack V on 9/20/2017.
 */
import React from 'react';
import fetch from 'isomorphic-fetch';
import { fetchData, postQuery } from '.././utils'
import {Row, Col, Button, Icon,  Table, Input, Select, Modal, Menu, Form, Checkbox} from 'antd';
const CheckboxGroup = Checkbox.Group;
const {Item} = Form;
const {Option} = Select;
import Link, { NavLink } from 'redux-first-router-link'

const headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};

export default class Feature extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            buttonText: 'Add Package Feature',
            optionButtonText: 'Add',
            authenticated: false,
            headerHeight: 0,
            data: [],
            pagination:
            {
                current: 1,
                total: 0,
                pageSize: 10,
                sorter:
                {
                    field: "name",
                    order: "asc"
                }
            },
            loading: false,
            confirmLoading: false,
            modalConfirmLoading: false,
            title: 'New Package Feature',
            modalTitle: 'New Option',
            packageFeature: {_id: '', title: '', featureType: '', featureOptions: []},
            option:{value: 0, name: ''},
            featureOptions: [],
            searchText: "",
            visible: false,
            modalVisible: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.edit = this.edit.bind(this);
        this.Add = this.Add.bind(this);
        this.processPackageFeature = this.processPackageFeature.bind(this);
        this.exit = this.exit.bind(this);
        this.modalExit = this.modalExit.bind(this);
        this.textChange = this.textChange.bind(this);
        this.getItems = this.getItems.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.handleTableChange = this.handleTableChange.bind(this);
        this.selectionChanged = this.selectionChanged.bind(this);
        this.processOption = this.processOption.bind(this);
        this. editOption = this. editOption.bind(this);
        this.AddOption = this.AddOption.bind(this);

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
        let searchText = params.searchText;
        let results = params.results;
        let page = params.page;
        let sortField = params.sortField;
        let sortOrder = params.sortOrder;

        let query = `itemsPerPage=${results}&searchText=${searchText}&page=${page}&sortField=${sortField}&sortOrder=${sortOrder}`;

        let res = await fetchData('/getPackageFeatureList?' + query);
        this.setState({loading: false});
        if(res.items.length > 0)
        {
            const {pagination} = this.state;
            pagination.total = res.totalItems;
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

    async edit(data, row)
    {
        this.setState({visible: true, title: 'Update Package Feature', buttonText: 'Update Package Feature', packageFeature: data});
    }

     editOption(data, row)
    {
        this.setState({modalVisible: true, modalTitle: 'Edit Option',  optionButtonText: 'Update', option: data});
    }

    AddOption()
    {
        this.setState({modalVisible: true, modalTitle: 'Add New Option',  optionButtonText: 'Add', option:{value: 0, name: ''}});
    }

    Add()
    {
        this.setState({visible: true, title: 'Add Package Feature',  buttonText: 'Add Package Feature', packageFeature: {_id: '', title: '', featureType: '', featureOptions: []}});
    }

    async processPackageFeature()
    {
        if(!this.state.packageFeature.title || this.state.packageFeature.title.length < 1 || !this.state.packageFeature.featureType || this.state.packageFeature.featureType.length < 1)
        {
            alert('Provide all required fields and try again');
            return;
        }

        let url = '';
        let payload = {};

        if(!this.state.packageFeature._id || this.state.packageFeature._id.length < 1)
        {
            payload = {title: this.state.packageFeature.title, featureType: this.state.packageFeature.featureType, featureOptions: this.state.packageFeature.featureOptions};
            url = '/addFeature';
        }
        else
        {
            payload = {_id: this.state.packageFeature._id, title: this.state.packageFeature.title, featureType: this.state.packageFeature.featureType, featureOptions: this.state.packageFeature.featureOptions};
            url = '/editFeature';
        }

        const {pagination} = this.state;
        let params =
        {
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
            this.setState({packageFeature: {_id: '', title: '', featureType: '', featureOptions: []}});
        }
        alert(res.message);
    }

    async processOption()
    {
        if(!this.state.option.name)
        {
            alert('Provide Option Name');
            return;
        }

        let featureOptions = this.state.packageFeature.featureOptions;
        let option = this.state.option;
        if(featureOptions === undefined || featureOptions === null || featureOptions.length < 1)
        {
            option.value = 1;
            featureOptions.push(option);
        }
        else
         {
             //sort featureOptions by value in descending order
             let sortedValues = featureOptions.sort(function(a, b){return b-a});
             let options = featureOptions.filter((s) =>
            {
                return s.value === option.value;
            });

            if(options.length < 1)
            {
                option.value = sortedValues[0].value + 1;
                featureOptions.push(option);
            }
            else
            {
                featureOptions.find(v => v.value === option.value).name = option.name;
            }
        }

        this.setState({packageFeature: {...this.state.packageFeature, featureOptions: featureOptions}, option:{value: 0, name: ''}});
    }

    exit()
    {
        this.setState({
            visible: false
        });
    };

    modalExit()
    {
        this.setState({
            modalVisible: false
        });
    };

    textChange(e, prop, feature)
    {
        if(prop !== undefined && prop !== null && prop.length > 0 && feature !== undefined && feature !== null && feature.length > 0)
        {
            let stateObj = this.state[prop];
            stateObj[feature] = e.target.value;
            this.setState({[prop]: stateObj});
        }
        else{
            const {packageFeature} = this.state;
            packageFeature[e.target.name] = e.target.value;
            this.setState({packageFeature});
        }
    }

    selectionChanged(prop, feature, val, innerFeature)
    {
        let stateObj = this.state[prop];
        if(innerFeature !== undefined && innerFeature !== null && innerFeature.length > 0)
        {
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
        const columns = [
            {
            title: 'Title',
            dataIndex: 'title',
            key: 'title'
        },
        {
            title: 'Feature Type',
            dataIndex: 'featureType',
            key: 'featureType'
        },
         {
             title: 'Action',
             dataIndex: '', key: 'x',
             render: (value, row, index) => <a onClick={() => this.edit(value, row)} href="#"><i className="material-icons">mode_edit</i></a>
         }
        ];

        const optionColumns = [
            {
                title: 'Option Name',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: 'Action',
                dataIndex: '', key: 'x',
                render: (data, row, index) => <Row>
                    <Col span={12}><a onClick={() => this. editOption(data, row)} href="#"><i className="material-icons">mode_edit</i></a></Col>
                </Row>
            }
        ];

        const {modalVisible, modalTitle, meta, modalConfirmLoading, optionButtonText, buttonText, packageFeature, title, searchText, visible, confirmLoading, option} = this.state;
        return(
                <div  className="main-content" id="mainContent">
                    <div className="custom-filter-dropdown" style={{display: visible? 'none' : 'block'}}>
                        <Row style={{margin: '20px'}}>
                            <Col span="24">
                                <h4 style={{fontWeight: 'bold', fontSize: '18px'}}>Package Features</h4>
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
                                <i className="material-icons" title="Add New Package Feature" style={{float: 'right', marginRight: '-25px', color: '#07c', cursor: 'pointer'}} onClick={this.Add}>add</i>
                            </Col>
                        </Row>
                        <br/>
                        <Table columns={columns} rowKey={record => record._id} dataSource={this.state.data} pagination={this.state.pagination} loading={this.state.loading} onChange={this.handleTableChange} bordered/>
                    </div>
                    <div className="md-wrapper" style={{display: visible? 'block' : 'none'}}>
                        <div role="document" className="ant-modal" style={{width: '700px', marginLeft: '25%', marginRight: '25%', top: '30px !important'}}>
                            <div className="ant-modal-content">
                                <button aria-label="Close" className="ant-modal-close" onClick={this.exit}>
                                    <span className="ant-modal-close-x"></span>
                                </button>
                                <div className="ant-modal-header">
                                    <div className="ant-modal-title" id="rcDialogTitle0">
                                        {title}
                                    </div>
                                </div>
                                <div className="ant-modal-body">
                                    <Form>
                                        <div>
                                            <Item>
                                                <Col span="11">
                                                    <h3 style={{fontSize: '15px', fontWeight: '400'}}>Feature Title *</h3>
                                                    <input onChange={this.textChange} name="title" type="text" className="ant-input ant-input-lg input-no-border input-bordered" placeholder="Metadata Title *" value={packageFeature.title}/>
                                                </Col>
                                                <Col span="1"></Col>
                                                <Col span="11">
                                                    <h3 style={{fontSize: '15px', fontWeight: '400'}}>Feature Type *</h3>
                                                    <Select name="featureType"
                                                            style={{width: '100%' }}
                                                            placeholder="- Data Type * -"
                                                            optionFilterProp="children"
                                                            value={(packageFeature.featureType !== undefined && packageFeature.featureType.length > 0)? packageFeature.featureType : '- Feature Type * -'}
                                                            onChange={(val) => this.selectionChanged('packageFeature', 'featureType', val)}>
                                                        <Option value="">- Feature Type -</Option>
                                                        <Option value="Checkbox">Checkbox</Option>
                                                        <Option value="DropDown">Drop down</Option>
                                                        <Option value="Number">Number</Option>
                                                    </Select>
                                                </Col>
                                            </Item>

                                            {(packageFeature.featureType !== undefined && packageFeature.featureType.length > 0 && packageFeature.featureType.toLowerCase() === 'dropdown')?

                                                <div style={{width: '100%'}}>
                                                    <Item>
                                                        <Row style={{margin: '20px'}}>
                                                            <Col span="20">
                                                                <h4 style={{fontWeight: 'bold', fontSize: '13px'}}>Feature Option(s)</h4>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col span ='4'>
                                                                <i className="material-icons" title="Add New Option" style={{float: 'right', marginLeft: '35px', color: '#008000', marginTop: '6px', cursor: 'pointer'}} onClick={this.AddOption}>add</i>
                                                            </Col>
                                                        </Row>
                                                        <br/>
                                                        <Row>
                                                            <Col span="24">
                                                                <Item>
                                                                    <Table columns={optionColumns} rowKey={record => record.value} dataSource={this.state.packageFeature.featureOptions} bordered/>
                                                                </Item>
                                                            </Col>
                                                        </Row>
                                                    </Item>
                                                </div>
                                                : ''
                                            }
                                        </div>
                                    </Form>
                                </div>
                                <div className="ant-modal-footer">
                                    <button type="button" className={confirmLoading? "ant-btn login-button ant-btn-primary ant-btn-lg ant-btn-loading" : "ant-btn login-button ant-btn-primary ant-btn-lg"}  onClick={this.processPackageFeature}>
                                        {confirmLoading && <i className="anticon anticon-spin anticon-loading"></i>}
                                        <span id="buttonText">{buttonText}</span>
                                    </button>
                                </div>
                            </div>
                            <div tabIndex="0" style={{width: '0px', height: '0px', overflow: 'hidden'}}>sentinel</div>
                        </div>
                    </div>

                    <div className="md-wrapper">
                        <Modal className="modal-width-330"
                               visible={modalVisible}
                               title={modalTitle}
                               maskClosable={false}
                               onCancel={this.modalExit}
                               footer={[
                        <Button className="login-button" loading={modalConfirmLoading} key="submit" type="primary" size="large"  onClick={this.processOption}>
                          <span id="buttonText">{optionButtonText}</span>
                        </Button>
                      ]}
                        >
                            <Form>
                                <div id="singleEntryForm">
                                    <Item>
                                        <input onChange={(e) => this.textChange(e, 'option', 'name')} name="name" type="text" className="ant-input ant-input-lg input-no-border" placeholder="Option Name" value={option.name}/>
                                    </Item>
                                </div>
                            </Form>
                        </Modal>
                    </div>

                </div>
            )
    }
}