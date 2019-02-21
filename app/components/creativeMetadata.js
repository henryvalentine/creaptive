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

export default class CreativeMetadata extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            buttonText: 'Add Metadata',
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
            title: 'New Creative Metadata',
            modalTitle: 'New Option',
            creativeSubCategories: [],
            creativeMetadata: {_id: '', title: '', questionCaption: '', dataType: '', options: [], hasOptions: '', numberOfOptionLevels: '', minimumNumberOfOptionsToChoose: '',creativeSubCategory: {_id: '', name: ''}},
            option:{_id: '', name: ''},
            meta: {_id: '', level: 0, levelLabel: '', option: {_id: '', name: ''}},
            options: [],
            searchText: "",
            visible: false,
            modalVisible: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.edit = this.edit.bind(this);
        this.Add = this.Add.bind(this);
        this.processMetadata = this.processMetadata.bind(this);
        this.exit = this.exit.bind(this);
        this.modalExit = this.modalExit.bind(this);
        this.textChange = this.textChange.bind(this);
        this.getItems = this.getItems.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.handleTableChange = this.handleTableChange.bind(this);
        this.selectionChanged = this.selectionChanged.bind(this);
        this.processOption = this.processOption.bind(this);
        this.processMetadataOption = this.processMetadataOption.bind(this);
        this.editMetadataOption = this.editMetadataOption.bind(this);
        this.AddOption = this.AddOption.bind(this);
        this.checkOptionLevel = this.checkOptionLevel.bind(this);
        this.toggleMetadataOption = this.toggleMetadataOption.bind(this);

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

        let subCategories = await fetchData('/getAllCreativeSubCategories');
        let options = await fetchData('/getAllOptions');

        if(subCategories.length > 0)
        {
            this.setState({creativeSubCategories: subCategories});
        }
        if(options.length > 0)
        {
            this.setState({options: options});
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
        let searchText = params.searchText;
        let results = params.results;
        let page = params.page;
        let sortField = params.sortField;
        let sortOrder = params.sortOrder;

        let query = `itemsPerPage=${results}&searchText=${searchText}&page=${page}&sortField=${sortField}&sortOrder=${sortOrder}`;

        let res = await fetchData('/getCreativeMetadataList?' + query);
        this.setState({loading: false});
        let items = [];
        if(res.items.length > 0)
        {
            const {pagination} = this.state;
            pagination.total = res.totalItems;
            res.items.forEach((c, i) =>{
                // c.creativeCategoryName = c.creativeSubCategory.creativeCategory.name;
                c.creativeSubCategoryName = c.creativeSubCategory.name;
                items.push(c);
            });
            this.setState({
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

    checkOptionLevel(meta, level, val)
    {
        if(parseInt(val) > parseInt(this.state.creativeMetadata.numberOfOptionLevels))
        {
            alert('The selected Metadata option Level should not exceed the selected Number of Option levels');
            return;
        }
        this.setState({[meta]: {...this.state[meta], [level]: val}});
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
        this.setState({visible: true, title: 'Update Creative Metadata', buttonText: 'Update Metadata', creativeMetadata: data});
        let res = await fetchData('/getMetadataOptions?metadataId=' + data._id);
        if(res.code > 0)
        {
            let items = [];
            res.options.forEach((c, i) =>{
                c.optionName = c.option.name;
                items.push(c);
            });
            this.setState({creativeMetadata: {...this.state.creativeMetadata, options: items}});
        }

    }

    async toggleMetadataOption(e, data)
    {
        let options = this.state.creativeMetadata.options;
        let status = e.target.checked === true;
        let res = await postQuery('/toggleMetadataOption?id=' + data._id + '&status=' + status);
        if(res.code > 0)
        {
            options.forEach( r =>
            {
                if(r._id === data._id)
                {
                    r.status = status;
                    this.setState({creativeMetadata: {...this.state.creativeMetadata, options: options}});
                }
            });
        }
    }

    editMetadataOption(data, row)
    {
        this.setState({meta: data});
    }

    AddOption()
    {
        this.setState({modalVisible: true, title: 'Add New Option',  optionButtonText: 'Add', option:{_id: '', name: ''}});
    }

    Add()
    {
        this.setState({visible: true, title: 'Add Creative Metadata',  buttonText: 'Add Metadata', creativeMetadata: {_id: '', title: '', questionCaption: '', dataType: '', options: [], hasOptions: '', numberOfOptionLevels: 0, creativeSubCategory: {_id: '', name: ''}}, meta: {_id: '', creativeMetadata: this.state.creativeMetadata._id, level: '', levelLabel: '', option: {_id: '', name: ''}}});
    }

    async processMetadata()
    {
        if(!this.state.creativeMetadata.title || !this.state.creativeMetadata.questionCaption || !this.state.creativeMetadata.dataType || !this.state.creativeMetadata.creativeSubCategory || this.state.creativeMetadata.creativeSubCategory._id.length < 1)
        {
            alert('Provide all required fields and try again');
            return;
        }

        let url = '';
        let payload = {};

        if(!this.state.creativeMetadata._id || this.state.creativeMetadata._id.length < 1)
        {
            payload = {title: this.state.creativeMetadata.title, questionCaption: this.state.creativeMetadata.questionCaption, dataType: this.state.creativeMetadata.dataType, hasOptions: this.state.creativeMetadata.hasOptions, numberOfOptionLevels: this.state.creativeMetadata.numberOfOptionLevels, creativeSubCategory: this.state.creativeMetadata.creativeSubCategory._id, minimumNumberOfOptionsToChoose: this.state.creativeMetadata.minimumNumberOfOptionsToChoose};
            url = '/addCreativeMetadata';
        }
        else
        {
            payload = {_id: this.state.creativeMetadata._id, title: this.state.creativeMetadata.title, questionCaption: this.state.creativeMetadata.questionCaption, dataType: this.state.creativeMetadata.dataType, hasOptions: this.state.creativeMetadata.hasOptions, numberOfOptionLevels: this.state.creativeMetadata.numberOfOptionLevels, creativeSubCategory: this.state.creativeMetadata.creativeSubCategory._id, minimumNumberOfOptionsToChoose: this.state.creativeMetadata.minimumNumberOfOptionsToChoose};
            url = '/editCreativeMetadata';
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
            this.setState({creativeMetadata: {...this.state.creativeMetadata, _id: res.creativeMetadataId}});
            // this.setState({creativeMetadata: {_id: '', title: '', questionCaption: '', dataType: '', hasOptions: '', numberOfOptionLevels: '', creativeSubCategory: {_id: '', name: ''}}});
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
        let url = '';
        let payload = {};

        if(!this.state.option._id || this.state.option._id.length < 1)
        {
            payload = {name: this.state.option.name};
            url = '/addOption';
        }
        else
        {
            payload = {_id: this.state.option._id, name: this.state.option.name};
            url = '/editOption';
        }

        this.setState({modalConfirmLoading: true});
        let res = await postQuery(url, JSON.stringify(payload));
        this.setState({modalConfirmLoading: false});
        if(res.code > 0)
        {
            this.setState({options: res.options, option: {_id: '', name: ''}});
        }
        // alert(res.message);
    }

    async processMetadataOption(val)
    {
        if(!val || val.length < 1)
        {
            alert('Please Select an Existing Option or profile a new one');
            return;
        }

        if(!this.state.creativeMetadata._id || this.state.creativeMetadata._id.length < 1)
        {
            alert('Please profile the metadata first before adding Metadata options (s)');
            return;
        }

        let meta = this.state.meta;
        meta.option._id = val;
        this.setState({meta: meta});

        let url = '';
        let payload = {};

        if(!this.state.meta._id || this.state.meta._id.length < 1)
        {
            payload = {creativeMetadata: this.state.creativeMetadata._id, level: (this.state.meta.level === undefined || this.state.meta.level === null) ? 0 : this.state.meta.level, levelLabel: this.state.meta.levelLabel, option: this.state.meta.option._id};
            url = '/addMetadataOption';
        }
        else
        {
            payload = {_id: this.state.meta._id, creativeMetadata: this.state.creativeMetadata._id, level: (this.state.meta.level === undefined || this.state.meta.level === null) ? 0 : this.state.meta.level, levelLabel: this.state.meta.levelLabel, option: this.state.meta.option._id};
            url = '/editMetadataOption';
        }

        this.setState({confirmLoading: true});
        let res = await postQuery(url, JSON.stringify(payload));
        this.setState({confirmLoading: false});
        if(res.code > 0)
        {
            let items = [];
            res.metadataOptions.forEach((c, i) =>
            {
                c.optionName = c.option.name;
                items.push(c);
            });

            this.setState({creativeMetadata: {...this.state.creativeMetadata, options: items}, meta: {_id: '', option: {_id: '', name: ''}}, confirmLoading: false});
        }
        // alert(res.message);
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
            const {creativeMetadata} = this.state;
            creativeMetadata[e.target.name] = e.target.value;
            this.setState({creativeMetadata});
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

        // if(this.state.creativeMetadata.dataType !== '' && this.state.creativeMetadata.dataType.toLowerCase() !== 'text' && this.state.creativeMetadata.dataType.toLowerCase() !== 'dateRange')
        // {
        //     this.setState({creativeMetadata: {...this.state.creativeMetadata, hasOptions: 'Yes'}});
        // }
        // else
        // {
        //     stateObj.hasOptions = 'No';
        //     this.setState({creativeMetadata: stateObj});
        // }

    }

    render()
    {
        const columns = [
            {
            title: 'Title',
            dataIndex: 'title',
            key: 'title'
            // sorter: true
        },
        {
            title: 'Question Caption',
            dataIndex: 'questionCaption',
            key: 'questionCaption'
            // sorter: true
        }
         ,
        {
            title: 'Data Type',
            dataIndex: 'dataType',
            key: 'dataType'
            // sorter: true
        },
        {
            title: 'SubCategory',
            dataIndex: 'creativeSubCategoryName',
            key: 'creativeSubCategoryName'
            // sorter: true
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
                dataIndex: 'optionName',
                key: 'optionName'
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (data, row, index) =>
                 <Row>
                    <Col span={24}>
                        <Checkbox key={row._id} checked={row.status} value={row._id} onClick={(e) => this.toggleMetadataOption(e, row)}/>
                    </Col>
                </Row>
            },
            {
                title: 'Action',
                dataIndex: '', key: 'x',
                render: (data, row, index) => <Row>
                    <Col span={12}><a onClick={() => this.editMetadataOption(data, row)} href="#"><i className="material-icons">mode_edit</i></a></Col>
                </Row>
            }
        ];
        // <Col span={12}><a onClick={() => this.toggleMetadataOption(value, row)} href="#"><i className="material-icons">delete</i></a></Col>

       // <a onClick={() => this.editMetadataOption(value, row)} href="#"><i className="material-icons">delete</i></a>
        const {modalVisible, modalTitle, meta, modalConfirmLoading, optionButtonText, buttonText, creativeMetadata, title, searchText, visible, confirmLoading, option} = this.state;
        return(
                <div  className="main-content" id="mainContent">
                    <div className="custom-filter-dropdown" style={{display: visible? 'none' : 'block'}}>
                        <Row style={{margin: '20px'}}>
                            <Col span="24">
                                <h4 style={{fontWeight: 'bold', fontSize: '18px'}}>Creative Metadata</h4>
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
                                <i className="material-icons" title="Add New Metadata" style={{float: 'right', marginRight: '-25px', color: '#07c', cursor: 'pointer'}} onClick={this.Add}>add</i>
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
                                                    <h3 style={{fontSize: '15px', fontWeight: '400'}}>Metadata Title *</h3>
                                                    <input onChange={this.textChange} name="title" type="text" className="ant-input ant-input-lg input-no-border input-bordered" placeholder="Metadata Title *" value={creativeMetadata.title}/>
                                                </Col>
                                                <Col span="1"></Col>
                                                <Col span="11">
                                                    <h3 style={{fontSize: '15px', fontWeight: '400'}}>Question Caption *</h3>
                                                    <input onChange={this.textChange} name="questionCaption" type="text" className="ant-input ant-input-lg input-no-border input-bordered" placeholder="Question Caption *" value={creativeMetadata.questionCaption}/>
                                                </Col>
                                            </Item>
                                            <Item>
                                                <Col span="11">
                                                    <h3 style={{fontSize: '15px', fontWeight: '400'}}>Creative SubCategory *</h3>
                                                    <Select name="creativeSubCategory"
                                                            style={{  width: '100%' }}
                                                            placeholder="- Creative SubCategory * -"
                                                            optionFilterProp="children"
                                                            value={(creativeMetadata.creativeSubCategory !== undefined && creativeMetadata.creativeSubCategory._id.length > 0)? creativeMetadata.creativeSubCategory._id : '- Creative SubCategory * -'}
                                                            onChange={(val) => this.selectionChanged('creativeMetadata', 'creativeSubCategory', val, '_id')}>
                                                        <Option value="">- Creative SubCategory * -</Option>
                                                        {this.state.creativeSubCategories.map(subCategory => <Option value={subCategory._id} key={subCategory._id}>{subCategory.name}</Option>)}
                                                    </Select>
                                                </Col>
                                                <Col span="1"></Col>
                                                <Col span="11">
                                                    <h3 style={{fontSize: '15px', fontWeight: '400'}}>Data Type *</h3>
                                                    <Select name="dataType"
                                                            style={{width: '100%' }}
                                                            placeholder="- Data Type * -"
                                                            optionFilterProp="children"
                                                            value={(creativeMetadata.dataType !== undefined && creativeMetadata.dataType.length > 0)? creativeMetadata.dataType : '- Data Type * -'}
                                                            onChange={(val) => this.selectionChanged('creativeMetadata', 'dataType', val)}>
                                                        <Option value="">- Data Type -</Option>
                                                        <Option value="Text">Text</Option>
                                                        <Option value="Radio">Radio</Option>
                                                        <Option value="Checkbox">Checkbox</Option>
                                                        <Option value="DropDown">Drop down</Option>
                                                        <Option value="DropDownRange">Drop down Range</Option>
                                                        <Option value="Date">Date</Option>
                                                        <Option value="DateRange">Date Range</Option>
                                                    </Select>
                                                </Col>
                                            </Item>

                                            {(creativeMetadata._id !== undefined && creativeMetadata._id.length > 0 && creativeMetadata.dataType !== undefined && creativeMetadata.dataType.length > 0 && creativeMetadata.dataType.toLowerCase() !== 'text' && creativeMetadata.dataType.toLowerCase() !== 'daterange' && creativeMetadata.dataType.toLowerCase() !== 'date')?

                                                <div style={{width: '100%'}}>
                                                    {creativeMetadata.dataType.toLowerCase() === 'checkbox'?  <Item>
                                                        <Col span="24">
                                                            <h3 style={{fontSize: '15px', fontWeight: '400'}}>Max. number of options to Choose</h3>
                                                            <input onChange={this.textChange} name="minimumNumberOfOptionsToChoose" type="text" className="ant-input ant-input-lg input-no-border input-bordered" placeholder="Min. number of options to Choose" value={creativeMetadata.minimumNumberOfOptionsToChoose}/>
                                                        </Col>
                                                    </Item> : ''
                                                    }
                                                    <Item>
                                                        <Row style={{margin: '20px'}}>
                                                            <Col span="20">
                                                                <h4 style={{fontWeight: 'bold', fontSize: '13px'}}>Metadata Option(s)</h4>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col span="20">
                                                                <Select name="option" disabled={confirmLoading === true}
                                                                        style={{  width: '100%' }}
                                                                        placeholder="- Select existing option * -"
                                                                        optionFilterProp="children"
                                                                        value={(meta.option !== undefined && meta.option._id.length > 0)? meta.option._id : '- Select existing option * -'}
                                                                        onChange={(val) => this.processMetadataOption(val)}>
                                                                    <Option value="">- Select an option * -</Option>
                                                                    {this.state.options.map(option => <Option value={option._id} key={option._id}>{option.name}</Option>)}
                                                                </Select>
                                                            </Col>
                                                            <Col span ='4'>
                                                                <i className="material-icons" title="Add New Option" style={{float: 'right', marginLeft: '35px', color: '#008000', marginTop: '6px', cursor: 'pointer'}} onClick={this.AddOption}>add</i>
                                                            </Col>
                                                        </Row>
                                                        <br/>
                                                        <Row>
                                                            <Col span="24">
                                                                <Item>
                                                                    <Table columns={optionColumns} rowKey={record => record._id} dataSource={this.state.creativeMetadata.options} bordered/>
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
                                    <button type="button" className={confirmLoading? "ant-btn login-button ant-btn-primary ant-btn-lg ant-btn-loading" : "ant-btn login-button ant-btn-primary ant-btn-lg"}  onClick={this.processMetadata}>
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