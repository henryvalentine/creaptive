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
import defaultImage from '../../images/defaultImage.png';

const headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};

export default class SubCategory extends React.Component
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
            title: 'New Creative Type',
            creativeCategories: [],
            creativeSubCategory:{_id: '', name: '', defaultImg: defaultImage, creativeCategory: {_id: '', name: ''}},
            searchText: "",
            visible: false,
            file: null
            
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
        this.triggerFileSelect = this.triggerFileSelect.bind(this);
        this.processFile = this.processFile.bind(this);
        this.uploadImg = this.uploadImg.bind(this);

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

        let categories = await fetchData('/getAllCreativeCategories');
        if(categories.length > 0)
        {
            this.setState({creativeCategories: categories});
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

        var query = `itemsPerPage=${results}&searchText=${searchText}&page=${page}&sortField=${sortField}&sortOrder=${sortOrder}`;

        let res = await fetchData('/getCreativeSubCategories?' + query);
        this.setState({loading: false});
        let items = [];
        if(res.items.length > 0)
        {
            const {pagination} = this.state;
            pagination.total = res.totalItems;
            res.items.forEach((c, i) =>{
                c.creativeCategoryName = c.creativeCategory.name;
                c.creativeSectionName =  c.creativeCategory.creativeSection.name;
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
        if(!data.defaultImg || data.defaultImg === null || data.defaultImg.length < 1)
        {
            data.defaultImg = defaultImage;
        }
        this.setState({visible: true, title: 'Update Creative Type', buttonText: 'Update', creativeSubCategory: data});
    }

    Add()
    {
        this.setState({visible: true, title: 'Add Creative Type',  buttonText: 'Add', defaultImg: defaultImage, creativeSubCategory:{_id: '', name: '', creativeCategory: {_id: '', name: ''}}});
    }

    async process()
    {
        if(!this.state.creativeSubCategory.name || !this.state.creativeSubCategory.creativeCategory)
        {
            alert('Provide all required fields and try again');
            return;
        }
        let url = '';
        let payload = {};
        if(!this.state.creativeSubCategory._id || this.state.creativeSubCategory._id.length < 1)
        {
            payload = {name: this.state.creativeSubCategory.name, creativeCategory: this.state.creativeSubCategory.creativeCategory._id, defaultImg: this.state.creativeSubCategory.defaultImg};
            url = '/addCreativeSubCategory';
        }
        else
        {
            payload = {_id: this.state.creativeSubCategory._id, name: this.state.creativeSubCategory.name, creativeCategory: this.state.creativeSubCategory.creativeCategory._id, defaultImg: this.state.creativeSubCategory.defaultImg};
            url = '/editCreativeSubCategory';
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
            let crcat = this.state.creativeSubCategory;
            crcat._id = res.creativeSubCategoryId;
            this.setState({visible: false, creativeSubCategory: crcat});
            
            if(this.state.file && this.state.file !== null && this.state.file.size > 0)
            {
                this.uploadImg(this.state.file);
            }
            this.getItems(params);     
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
        const {creativeSubCategory} = this.state;
        creativeSubCategory[e.target.name] = e.target.value;
        this.setState({creativeSubCategory});
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

   triggerFileSelect()
    {
        document.getElementById('selectFile').click();
    };

    processFile(e)
    {
        e.preventDefault();
        let file = e.target.files[0];
        if (file && file.size > 0)
        {
            let el = this;
            let reader = new FileReader();
            let file = e.target.files[0];
            let img = new Image();
            let _URL = window.URL || window.webkitURL;
            img.src = _URL.createObjectURL(file);            
            img.onload = function ()
            {
                reader.onloadend = () =>
                {
                    let subcategory = el.state.creativeSubCategory;
                    subcategory.defaultImg = reader.result;
                    el.setState({creativeSubCategory: subcategory});
                };
                reader.readAsDataURL(file);
            };

            if(this.state.creativeSubCategory._id !== undefined && this.state.creativeSubCategory._id.length > 0)
            {
                this.uploadImg(file);
            }
            else
            {
                this.setState({file: file});
            }            
        }
        else
        {
            alert('No files selected');
        }
    };

    uploadImg(file)
    {
        if (file && file.size > 0)
        {
            let el = this;
            let xhr = new XMLHttpRequest();
            let formData = new FormData();
            xhr.open("POST", '/uploadFile?model=subcategory&prop=defaultImg&uploadPath=subcategory&itemId=' + el.state.creativeSubCategory._id, true);
            xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
            xhr.onerror = function(e)
            {
                console.log(e);
            };
            xhr.onload = function()
            {
                el.setState({confirmLoading: false});
                let res = (JSON.parse(xhr.response));
                if(res.code > 0)
                {
                    let subcategory = el.state.creativeSubCategory;
                    subcategory.defaultImg = res.filePath;
                    el.setState({creativeSubCategory: subcategory, file: null});
                }
                else
                {
                    el.setState({disabled: false});
                    alert(res.message);
                }
            };
            formData.append('file', file);
            el.setState({confirmLoading: true});
            xhr.send(formData);
        }
        else
        {
            alert('No files selected');
        }
    };

    render()
    {
        const columns = [{
            title: 'Creative Subcategory',
            dataIndex: 'name',
            key: 'name'
            // sorter: true
        },
        {
            title: 'Creative Category',
            dataIndex: 'creativeCategoryName',
            key: 'creativeCategoryName'
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
        const {buttonText, creativeSubCategory, title, searchText, visible, confirmLoading} = this.state;
        return(
                <div  className="main-content" id="mainContent">
                    <div className="custom-filter-dropdown">
                        <Row style={{margin: '20px'}}>
                            <Col span="24">
                                <h4 style={{fontWeight: 'bold', fontSize: '18px'}}>Creative Subcategories</h4>
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
                        <Modal className="modal-width-580"
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
                               <div className='ant-row'>
                                    <div className='ant-col-9'>
                                        <img style={{width : "100%", verticalAlign: 'center'}} src={creativeSubCategory.defaultImg} />
                                    </div>
                                    <div className='ant-col-15 padding-md'>
                                        <Item>
                                            <input onChange={this.textChange} name="name" type="text" className="ant-input ant-input-lg input-no-border" placeholder="Subcategory Name" value={creativeSubCategory.name}/>
                                        </Item>
                                        <Item>
                                            <Select name="creativeCategory"
                                                    style={{  width: '100%' }}
                                                    placeholder="- Creative Category -"
                                                    optionFilterProp="children"
                                                    value={(creativeSubCategory.creativeCategory || creativeSubCategory.creativeCategory._id.length > 0)? creativeSubCategory.creativeCategory._id : '-- Creative Category --'}
                                                    onChange={(val) => this.selectionChanged('creativeSubCategory', 'creativeCategory', val, '_id')}>
                                                <Option value="">- Creative Category -</Option>
                                                {this.state.creativeCategories.map(category => <Option value={category._id} key={category._id}>{category.name}</Option>)}
                                            </Select>
                                        </Item>
                                        <Item>
                                            <input id="selectFile" className="ant-input ant-input-lg input-no-border" type="file" onChange={this.processFile} accept=".png, .jpeg, .jpg" placeholder='Default image'/>
                                        </Item>
                                    </div>
                               </div>
                            </Form>
                        </Modal>
                    </div>
                </div>
            )
    }
}