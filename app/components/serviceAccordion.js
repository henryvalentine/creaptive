/**
 * Created by Jack V on 1/31/2018.
 */
import React from 'react';
import { fetchData, postQuery } from '.././utils'
import {Row, Col, Select, Form, Radio, Checkbox, DatePicker, Input, Switch, Modal, Upload, Icon, AutoComplete} from 'antd';
const { TextArea, Group} = Input;
import moment from 'moment-timezone';
const {Item} = Form;
const {Option} = Select;
import Link, { NavLink } from 'redux-first-router-link';
import ReactTags from 'react-tag-autocomplete';
import Section from './section';
import { Value } from 'slate';

// import pdfjsLib from 'pdfjs-dist/build/pdf';
// import y from 'pdfjs-dist/build/pdf.worker.js';
// pdfjsLib.GlobalWorkerOptions.workerSrc = y;


export default class ServiceAccordion extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            phone: '',
            creativeCategories: [],
            creativeSubCategories: [],
            creativeTypes: [],
            allPackageSelected: false,
            packageTypes: [],
            keywords: [],
            confirmationCode: '',
            confirmationCodeSent: false,
            pricePackages: [],
            starterPack: {},
            creativeMetadataList: [],
            loading: false,
            imageToPreview: 0,
            pdfSource: '',
            countdown: 0,
            currentFile: {},
            packagesUsed: [],
            activeTarget: 'srv_primary',
            activeLevel: '1',
            maxFileSize: 500 * 1024, // 1MB -> 1000 * 1024
            maxPicSize: 1500 * 1024, // 1MB -> 1000 * 1024
            minWidth: 600,
            minHeight: 450,
            listStyle:
                {
                    display: 'block',
                    height: '30px',
                    lineHeight: '30px',
                    listStyle: 'none'
                },
            metadata:
            {
                textValue: '',
                metadata: '',
                service: '',
                metadataOption: '',
                metadataOptionRange: [],
                providedDate: '',
                providedDateRange: []
            },
            requirementResponseType:
            [
                'Single_Answer',
                'Multi-choice_Answer',
                'Text_input',
                'File_Attachment'
            ],
            previewVisible: false,
            previewImage: '',
            resourceList: []

        };

        this.triggerClose = this.triggerClose.bind(this);
        this.setBorder = this.setBorder.bind(this);
        this.toggleBottomBorder = this.toggleBottomBorder.bind(this);
        this.categoryChanged = this.categoryChanged.bind(this);
        this.renderMetadata = this.renderMetadata.bind(this);
        this.subCategoryChanged = this.subCategoryChanged.bind(this);
        this.serviceTypeChanged = this.serviceTypeChanged.bind(this);
        this.metadataRadioChanged = this.metadataRadioChanged.bind(this);
        this.optionChanged = this.optionChanged.bind(this);
        this.updateMetadataList = this.updateMetadataList.bind(this);
        this.metadataOptionRangeChanged = this.metadataOptionRangeChanged.bind(this);
        this.metadataTextChanged = this.metadataTextChanged.bind(this);
        this.metadataDateChanged = this.metadataDateChanged.bind(this);
        this.disableEarlierDate = this.disableEarlierDate.bind(this);
        this.metadataCheckOptionChanged = this.metadataCheckOptionChanged.bind(this);
        this.processServiceBasics = this.processServiceBasics.bind(this);
        this.processCategorisation = this.processCategorisation.bind(this);
        this.processRequirements = this.processRequirements.bind(this);
        this.disableFutureDate = this.disableFutureDate.bind(this);
        this.onToggleFileSelection = this.onToggleFileSelection.bind(this);
        this.previewPhoto = this.previewPhoto.bind(this);
        this.uploadPhoto = this.uploadPhoto.bind(this);
        this.onTogglePdfSelection = this.onTogglePdfSelection.bind(this);
        this.processAssets = this.processAssets.bind(this);
        this.publish = this.publish.bind(this);
        this.processPackages = this.processPackages.bind(this);
        this.selectPdf = this.selectPdf.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.allPackageTypeChanged = this.allPackageTypeChanged.bind(this);
        this.featureOptionChanged = this.featureOptionChanged.bind(this);
        this.packageFeatureInputChanged = this.packageFeatureInputChanged.bind(this);
        this.packageFeatureCheckChanged = this.packageFeatureCheckChanged.bind(this);
        this.packageInputChanged = this.packageInputChanged.bind(this);
        this.inputClicked = this.inputClicked.bind(this);
        this.verifyPhone = this.verifyPhone.bind(this);
        this.inputBlur = this.inputBlur.bind(this);
        this.setPhone = this.setPhone.bind(this);
        this.resendCode = this.resendCode.bind(this);
        this.verifyCode = this.verifyCode.bind(this);
        this.setCode = this.setCode.bind(this);
        this.handlePreview = this.handlePreview.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.toggleFocus = this.toggleFocus.bind(this);
        this.closeAction = this.closeAction.bind(this);
    }

    packageFeatureCheckChanged(e, f, r)
    {
        let packagesUsed = this.state.packagesUsed;
        if(e.target.checked)
        {
            packagesUsed.forEach(p =>
            {
                if(p.packageType._id === r)
                {
                    p.features.forEach(o =>
                    {
                        if(o._id === f)
                        {
                            o.feature = f;
                        }
                    });
                }
            });
        }
        else
         {
             packagesUsed.find(p => p.packageType._id === r).features.find(o => o._id === f).feature = '';
        }
        this.setState({packagesUsed: packagesUsed});
    }

    featureOptionChanged(val, r, f)
    {
        let packagesUsed = this.state.packagesUsed;
        if(val !== '0' && val !== 0 && parseInt(val) > 0)
        {
            packagesUsed.forEach(p =>
            {
                if(p.packageType._id === r.packageType._id)
                {
                    p.features.forEach(o =>
                    {
                        if(o._id === f._id)
                        {
                            o.feature = f._id;
                            o.value = val;
                        }
                    });
                }
            });
            this.setState({packagesUsed: packagesUsed});
        }
    }

    packageFeatureInputChanged(e, r, f)
    {
        let packagesUsed = this.state.packagesUsed;
        packagesUsed.forEach(p =>
        {
            if(p.packageType._id === r.packageType._id)
            {
                p.features.forEach(o =>
                {
                    if(o._id === f._id)
                    {
                        o.feature = f._id;
                        o.value = e.target.value;
                    }
                });
            }
        });
        this.setState({packagesUsed: packagesUsed});
    }

    packageInputChanged(e, pack)
    {
        let packagesUsed = this.state.packagesUsed;
        packagesUsed.find(p => p.packageType._id === pack.packageType._id)[e.target.name] = e.target.value;
        this.setState({packagesUsed: packagesUsed});
    }

    async componentWillMount()
    {
        let packageTypes = await fetchData('/getAllPackageTypes');
        if(packageTypes.length > 0)
        {
            this.props.dispatchAction({type: 'PACKS', payload: packageTypes}) ;
        }
        else
         {
            packageTypes = [];
        }
        this.setState({packageTypes: packageTypes});
        let es = packageTypes.filter((s) =>
        {
            return s.name.toLowerCase() === 'standard';
        });
        if(es.length > 0)
        {
            this.setState({starterPack: es[0]});
        }
    }

    closeAction(returnServiceView)
    {
        this.setState({packagesUsed: [], activeTarget: 'srv_primary'});
        this.props.closeAction(returnServiceView)
    }

    componentWillUnmount()
    {
    }

    async componentWillReceiveProps(nextProps)
    {
        let el = this;
        if(nextProps.shouldUpdateCategories === true || nextProps.shouldUpdateCategories === 'true')
        {
            this.setState({packagesUsed: []});
            //using timeout is necessary so as to ensure the props have been duly updated
            // before other actions should be triggered
            setTimeout(async ()=>
            {
                el.props.updateState('shouldUpdateCategories', false);
                el.categoryChanged(nextProps.service.creativeCategory._id, true, nextProps.service.creativeSubCategory._id);
                let service = nextProps.service;
                this.state.resourceList = [];

                if(service.bannerImage !== undefined && service.bannerImage !== null && service.bannerImage.length > 0)
                {
                    this.state.resourceList.push({
                        uid: 1,
                        name: 'bannerImage',
                        status: 'done',
                        url: service.bannerImage
                    });
                }

                if(service.secondImage !== undefined && service.secondImage !== null  && service.secondImage.length > 0)
                {
                    this.state.resourceList.push({
                        uid: 2,
                        name: 'secondImage',
                        status: 'done',
                        url: service.secondImage
                    });
                }
                if(service.thirdImage !== undefined && service.thirdImage !== null && service.thirdImage.length > 0)
                {
                    this.state.resourceList.push({
                        uid: 3,
                        name: 'thirdImage',
                        status: 'done',
                        url: service.thirdImage
                    });
                }

                let packagesUsed = el.state.packagesUsed;
                let pack = await fetchData('/getAllPricePackages?subcategory=' + nextProps.service.creativeSubCategory._id);
                if(pack.pricePackages.length > 0)
                {
                    el.setState({pricePackages: pack.pricePackages});
                    if(service.packages.length > 0)
                    {
                        el.state.packageTypes.forEach(t =>
                        {
                            let sPacks = service.packages.filter(s =>
                            {
                                return s.packageType === t._id;
                            });

                            if(sPacks.length > 0)
                            {
                                let d = sPacks[0];
                                let p = Object.assign({}, el.state.pricePackages[0]);

                                let obj =
                                    {
                                        _id:d._id,
                                        title: d.title,
                                        service:service._id,
                                        description: d.description,
                                        packageType: Object.assign({}, t),
                                        package:  d.package,
                                        price:  d.price,
                                        delivery: d.delivery,
                                        packageExtras:  d.packageExtras,
                                        selectedFeatures:  d.selectedFeatures,
                                        features: [],
                                        creativeSubCategory: p.creativeSubCategory,
                                        section: d.section,
                                        dateProfiled: d.dateProfiled
                                    };

                                if(p.packageFeatures)
                                {
                                    p.packageFeatures.forEach((y) =>
                                    {
                                        let yp = obj.selectedFeatures.filter(g =>
                                        {
                                            return g.feature === y._id;
                                        });
                                        if(yp.length > 0)
                                        {
                                            let fg = Object.assign({}, y);
                                            fg.feature = yp[0].feature;
                                            fg.value = yp[0].value;
                                            obj.features.push(fg);
                                        }
                                        else{
                                            let fg = Object.assign({}, y);
                                            fg.feature = '';
                                            fg.value = '';
                                            obj.features.push(fg);
                                        }
                                    });
                                }

                                packagesUsed.push(obj);
                            }
                        });
                    }
                    else
                    {
                        let p = Object.assign({}, el.state.pricePackages[0]);
                        let obj =
                            {
                                title:'',
                                service:service._id,
                                description:'',
                                packageType: Object.assign({}, el.state.starterPack),
                                package:  p._id,
                                price:  '',
                                delivery: '',
                                packageExtras:  [],
                                selectedFeatures:  [],
                                features: [],
                                creativeSubCategory: p.creativeSubCategory,
                                section: p.section,
                                dateProfiled: p.dateProfiled
                            };
                        if(p.packageFeatures)
                        {
                            p.packageFeatures.forEach((y) =>
                            {
                                let fg = Object.assign({}, y);
                                fg.feature = '';
                                fg.value = '';
                                obj.features.push(fg);
                            });
                        }
                        service.packages.push(obj);
                        packagesUsed.push(obj);

                    }

                }
                el.setState({packagesUsed: packagesUsed, allPackageSelected: packagesUsed.length === 3});
                el.props.updateState('service', service);
            }, 400);
        }
    }

    async categoryChanged(category, flag, subCategory)
    {
        if(category !== undefined && category !== null && category.length > 0)
        {
            if(this.props.service.creativeCategory === undefined || this.props.service.creativeCategory === null)
            {
                this.props.service.creativeCategory = {_id: '', name: ''};
                this.props.service.creativeSubCategory = {_id: '', name: ''};
            }

            this.props.service.creativeCategory._id = category;
            this.props.updateState('service', this.props.service);
            this.props.showSpinner(true);
            let subCategories = await fetchData('/getCreativeSubCategoriesByCategory?category=' + category);
            this.props.showSpinner(false);
            if(subCategories.length > 0)
            {
                this.setState({creativeSubCategories: subCategories});

                if(flag !== undefined && flag !== null && (flag === true || flag === 'true') && subCategory !== undefined && subCategory !== null && subCategory.length > 0)
                {
                    this.subCategoryChanged(subCategory);
                }
            }
        }
    }

    async subCategoryChanged(subcategory)
    {
        if(subcategory !== undefined && subcategory !== null && subcategory.length > 0)
        {
            let service = this.props.service;
            if(service.creativeSubCategory === undefined || service.creativeSubCategory === null)
            {
                service.creativeSubCategory = {_id: '', name: ''};
                service.creativeType = {_id: '', name: ''};
            }

            service.creativeSubCategory._id = subcategory;

            this.props.updateState('service', service);
            this.props.showSpinner(true);
            let creativeTypes = await fetchData('/getCreativeTypesBySubCategory?subcategory=' + subcategory);
            if(creativeTypes.length > 0)
            {
                this.setState({creativeTypes: creativeTypes});
            }

            if(service._id !== undefined && service._id.length > 0)
            {
                let creativeMetadataList = await fetchData('/getCreativeMetadataBySubCategory?subcategory=' + subcategory + '&service=' + service._id);
                this.props.showSpinner(false);

                let newList = [];
                if(creativeMetadataList !== undefined && creativeMetadataList.length > 0)
                {
                    creativeMetadataList.forEach(m =>
                    {
                        m.serviceMetadata =
                        {
                            textValue: '',
                            metadata: m._id,
                            service: service._id,
                            metadataOption: '',
                            metadataOptionRange: {fromOption: '', toOption: ''},
                            providedDate: '',
                            providedDateRange: {startDate: '', endDate: ''},
                            checkedOptions: []
                        };

                        let serviceMetadata = service.metadata.find(s => s.metadata === m._id);
                        if (serviceMetadata !== undefined && serviceMetadata !== null && serviceMetadata._id.length > 0)
                        {
                            m.serviceMetadata = serviceMetadata;
                        }

                        newList.push(m);
                    });

                    this.setState({creativeMetadataList: newList});
                }
                else
                {
                    this.setState({creativeMetadataList: []});
                }
            }
        }
    }

    async serviceTypeChanged(serviceType)
    {
        if(serviceType !== undefined && serviceType !== null && serviceType.length > 0)
        {
            if(this.props.service.creativeType === undefined)
            {
                this.props.service.creativeType = {_id: '', name: ''};
            }
            this.props.service.creativeType._id = serviceType;
            this.props.updateState('service', this.props.service);
        }
    }

    componentDidMount()
    {
        let rteToolBar = document.querySelector('div[class^="EditorToolbar"]');
        let rteToolBarButtons = document.querySelectorAll('div[class^="ButtonGroup"]');
        if(rteToolBar !== undefined && rteToolBar !== null)
        {
            rteToolBar.style.margin = '1px';
            rteToolBar.style.padding = '1px';
        }
        if(rteToolBarButtons.length > 0)
        {
            Array.from(rteToolBarButtons).forEach((b, i) =>
            {
                b.style.margin = '0';
            });
        }
        setTimeout(async ()=>
        {
            let sections = this.props.sections.filter((s) =>
            {
                return s.name.toLowerCase() === 'services';
            });
            if(sections.length > 0)
            {
                this.props.showSpinner(true);
                let creativeCategories = await fetchData('/getCreativeCategoriesBySection?section=' + sections[0]._id);
                this.props.showSpinner(false);
                if(creativeCategories.length > 0)
                {
                    this.setState({creativeCategories: creativeCategories});
                }

                let keywords = await fetchData('/getAllKeywords?section=' + sections[0]._id);
                this.props.showSpinner(false);
                if(keywords.length > 0)
                {
                    this.setState({keywords: keywords});
                }
            }
        }, 3000);
    }

    inputBlur(e)
    {
        document.getElementsByClassName('rtEditor')[0].style.borderBottom = '1px solid rgb(39, 174, 96) !important';
    }

    inputClicked(e)
    {
        document.getElementsByClassName('rtEditor')[0].style.borderBottom = '1px solid rgb(39, 174, 96) !important';
    }

    toggleBottomBorder()
    {
        document.getElementsByClassName('rtEditor')[0].style.borderBottom = '1px solid rgb(39, 174, 96) !important';
    }

    toggleFocus(element, rClass)
    {
        let el = document.getElementsByClassName(element)[0];
        if(el.classList.contains(rClass))
        {
            el.classList.remove(rClass);
        }
        else
        {
            el.classList.add(rClass)
        }
    }

    triggerClose(targetName, activeLevel)
    {
        this.setState({activeTarget: targetName, activeLevel: activeLevel});
    }

    setBorder()
    {
        let rte = document.getElementsByClassName('rtEditor')[0];
        if(rte !== undefined && rte !== null)
        {
            rte.style.borderBottom = '1px solid rgb(39, 174, 96) !important';
        }
    }

    metadataTextChanged(e , m)
    {
        let service = this.props.service;

        let es = service.metadata.filter((s) =>
        {
            return s.metadata === m._id;
        });

        if(es.length < 1)
        {
            let serviceMetadata =
            {
                textValue: e.target.value,
                metadata: m._id,
                service: this.props.service._id,
                metadataOption: null,
                metadataOptionRange: {fromOption: null, toOption: null},
                providedDate: null,
                providedDateRange: {startDate: null, endDate: null}
            };
            service.metadata.push(serviceMetadata);
        }
        else
        {
            service.metadata.find(v => v.metadata === m._id).textValue = e.target.value;
        }

        m.serviceMetadata.textValue = e.target.value;
        this.props.updateState('service', service);
        this.updateMetadataList(m);
    }

    metadataRadioChanged(metadataOption , m)
    {
        let service = this.props.service;

        let es = service.metadata.filter((s) =>
        {
            return s.metadata === m._id;
        });

        if(es.length < 1)
        {
            let serviceMetadata  =
            {
                textValue: null,
                metadata: m._id,
                service: this.props.service._id,
                metadataOption: metadataOption,
                metadataOptionRange: {fromOption: null, toOption: null},
                providedDate: null,
                providedDateRange: {startDate: null, endDate: null},
                checkedOptions: []
            };
            service.metadata.push(serviceMetadata);
        }
        else
        {
            service.metadata.find(v => v.metadata === m._id).metadataOption = metadataOption;
        }

        this.props.updateState('service', service);
        m.serviceMetadata.metadataOption = metadataOption;
        this.updateMetadataList(m);
    }

    optionChanged(metadataOption , m)
    {
        let service = this.props.service;

        let es = service.metadata.filter((s) =>
        {
            return s.metadata === m._id;
        });

        if(es.length < 1)
        {
            let serviceMetadata  =
            {
                textValue: null,
                metadata: m._id,
                service: this.props.service._id,
                metadataOption: metadataOption,
                metadataOptionRange: {fromOption: null, toOption: null},
                providedDate: null,
                providedDateRange: {startDate: null, endDate: null},
                checkedOptions: []
            };
            service.metadata.push(serviceMetadata);
        }
        else
        {
            service.metadata.find(v => v.metadata === m._id).metadataOption = metadataOption;
        }
        m.serviceMetadata.metadataOption = metadataOption;
        this.props.updateState('service', service);
        this.updateMetadataList(m);
    }

    metadataOptionRangeChanged(metadataOption, m, prop)
    {
        let service = this.props.service;
        let serviceMetadata  =
        {
            textValue: null,
            metadata: m._id,
            service: service._id,
            metadataOption: null,
            metadataOptionRange: {fromOption: null, toOption: null},
            providedDate: null,
            providedDateRange: {startDate: null, endDate: null},
            checkedOptions: []
        };

        let mt = service.metadata;
        let ex = mt.filter((s) =>
        {
            return s.metadata === m._id;
        });

        if(ex.length < 1)
        {
            serviceMetadata.metadataOptionRange[prop] = metadataOption;
            service.metadata.push(serviceMetadata);
            m.serviceMetadata.metadataOptionRange[prop] = metadataOption;
        }
        else
        {
            let t = ex[0];
            if(t.metadata === m._id)
            {
                t.metadataOptionRange[prop] = metadataOption;
                m.serviceMetadata.metadataOptionRange[prop] = metadataOption;
            }
        }

        this.props.updateState('service', service);
        this.updateMetadataList(m);
    }

    metadataCheckOptionChanged(e, n, m)
    {
        let service = this.props.service;
        if(e.target.checked === true)
        {
            if(m.serviceMetadata.checkedOptions.length >= parseInt(m.minimumNumberOfOptionsToChoose))
            {
                return;
            }
            let es = service.metadata.filter((s) =>
            {
                return s.metadata === m._id;
            });

            if(es.length < 1)
            {
                let serviceMetadata  =
                {
                    textValue: null,
                    metadata: m._id,
                    service: this.props.service._id,
                    metadataOption: null,
                    metadataOptionRange: {fromOption: null, toOption: null},
                    providedDate: null,
                    providedDateRange: {startDate: null, endDate: null},
                    checkedOptions: []
                };

                serviceMetadata.checkedOptions.push(n);
                m.serviceMetadata = serviceMetadata;
                service.metadata.push(serviceMetadata);
            }
            else
            {
                let t = es[0];
                let ers = t.checkedOptions.filter((s) =>
                {
                    return s === n;
                });

                if(ers.length < 1)
                {
                    t.checkedOptions.push(n);
                }
                m.serviceMetadata = t;
            }

        }
        else
         {
            for (let i = 0; i < service.metadata.length; i++)
            {
                let t = service.metadata[i];

                if (t.metadata === m._id)
                {
                    let newChecks = t.checkedOptions.filter((option) =>
                    {
                        return option !== n;
                    });

                    if (newChecks.length > 0)
                    {
                        t.checkedOptions = newChecks;
                    }
                    else
                     {
                        t.checkedOptions = [];
                     }

                    m.serviceMetadata = t;
                }
            }
        }

        this.props.updateState('service', service);
        this.updateMetadataList(m);
    }

    allPackageTypeChanged(checked)
    {
        let el = this;
        let service = this.props.service;

        if(checked === true)
        {
            el.state.packageTypes.forEach(t =>
            {
                let packagesUsed = el.state.packagesUsed;
                let es = packagesUsed.filter((s) =>
                {
                    return s.packageType._id  === t._id;
                });

                if(es.length < 1)
                {
                    let p = Object.assign({}, el.state.pricePackages[0]);
                    let obj =
                        {
                            title: '',
                            service:service._id,
                            description: '',
                            packageType: Object.assign({}, t),
                            package:  p._id,
                            price:  '',
                            delivery: '',
                            packageExtras:  [],
                            selectedFeatures:  [],
                            features: [],
                            creativeSubCategory: p.creativeSubCategory,
                            section: p.section,
                            dateProfiled: p.dateProfiled
                        };

                    if(p.packageFeatures)
                    {
                        p.packageFeatures.forEach((y) =>
                        {
                            let yp = obj.selectedFeatures.filter(g =>
                            {
                                return g.feature === y._id;
                            });
                            if(yp.length > 0)
                            {
                                let fg = Object.assign({}, y);
                                fg.feature = yp[0].feature;
                                fg.value = yp[0].value;
                                fg.selectedOption = yp[0].selectedOption;
                                obj.features.push(fg);
                            }
                            else{
                                let fg = Object.assign({}, y);
                                fg.feature = '';
                                fg.value = '';
                                fg.selectedOption = '';
                                obj.features.push(fg);
                            }
                        });
                    }

                    packagesUsed.push(obj);
                    this.setState({packagesUsed: packagesUsed});
                }
            });
            this.setState({allPackageSelected: true});
        }
        else
        {
            let p = Object.assign({}, el.state.pricePackages[0]);
            let obj =
                {
                    title: '',
                    service:service._id,
                    description: '',
                    packageType: Object.assign({}, el.state.starterPack),
                    package:  p._id,
                    price:  '',
                    delivery: '',
                    packageExtras:  [],
                    selectedFeatures:  [],
                    features: [],
                    creativeSubCategory: p.creativeSubCategory,
                    section: p.section,
                    dateProfiled: p.dateProfiled
                };
            if(p.packageFeatures)
            {
                p.packageFeatures.forEach((y) =>
                {
                    let fg = Object.assign({}, y);
                    fg.feature = '';
                    fg.value = '';
                    obj.features.push(fg);
                });
            }
            let packagesUsed = [obj];
            this.setState({packagesUsed: packagesUsed, allPackageSelected: false});
        }
        this.props.updateState('service', service);
    }

    updateMetadataList(m)
    {
        let creativeMetadataList = this.state.creativeMetadataList;

        creativeMetadataList.forEach( c =>
        {
            if(c._id === m._id)
            {
                c = m;
                this.setState({creativeMetadataList: creativeMetadataList})
            }

        });
    }

    metadataDateChanged(rawDate , m, prop)
    {
        let formattedDate = moment(rawDate).add(1, 'd');
        let service = this.props.service;
        let serviceMetadata =
        {
            textValue: null,
            metadata: m._id,
            service: service._id,
            metadataOption: null,
            metadataOptionRange: {fromOption: null, toOption: null},
            providedDateRange: {startDate: null, endDate: null},
            checkedOptions: []
        };

        let es = service.metadata.filter((s) =>
        {
            return s.metadata === m._id;
        });

        if(es.length < 1)
        {
            if(prop === undefined || prop === null || prop.length < 1)
            {
                serviceMetadata.providedDate = formattedDate ;
                m.serviceMetadata.providedDate = formattedDate ;
            }
            else
            {
                serviceMetadata.providedDateRange[prop] = formattedDate;
                m.serviceMetadata.providedDateRange[prop] = formattedDate ;
            }

            service.metadata.push(serviceMetadata);
        }
        else
        {
            if(prop === undefined || prop === null || prop.length < 1)
            {
                service.metadata.find(v => v.metadata === m._id).providedDate = formattedDate;
                m.serviceMetadata.providedDate = formattedDate ;
            }
            else
            {
                let t = es[0];

                if(t.metadata === m._id)
                {
                    if(t.serviceMetadata === undefined || t.serviceMetadata === null)
                    {
                        t.serviceMetadata = serviceMetadata;
                    }

                    t.serviceMetadata.providedDateRange[prop] = formattedDate;
                    m.serviceMetadata.providedDateRange[prop] = formattedDate ;
                }
            }
        }

        this.props.updateState('service', service);
        this.updateMetadataList(m);
    }

    disableEarlierDate(current)
    {
        // Can not select today and days before today
        return current && current < moment().endOf('day');

        // Can not select days before today
        // return current && current < moment().startOf('day');
    }

    disableFutureDate(current)
    {
        // Can not select today and days after today
        return current && current > moment().startOf('day');

        // Can not select days after today
        // return current && current > moment().endOf('day');
    }

    renderMetadata(m)
    {
        if(m.dataType.toLowerCase() === 'text')
        {
           return <Row gutter={16} style={{marginBottom: '8px'}}>
                   <Col span= "24">
                       <h3 className= "h3-label">{m.questionCaption}</h3>
                       <input onChange={(e) => this.metadataTextChanged(e, m)} type="text" className="ant-input ant-input-lg input-no-border input-bordered" placeholder={m.questionCaption + " *"} value={m.serviceMetadata.textValue}/>
                   </Col>
           </Row>
        }

        if(m.dataType.toLowerCase() === 'radio')
        {
            return  <Row gutter={16} style={{marginBottom: '8px'}}>
                        <Col span= "24">
                            <h3 className= "h3-label">{m.questionCaption}</h3>
                            <Row className="ant-radio-group">
                                {m.metadataOptions.map( (r) =>

                                    {
                                        let checked = false;
                                        if(m.serviceMetadata.metadataOption === r._id)
                                        {
                                            checked = true;
                                        }

                                        return <Col key={r._id} span={24} style={this.state.listStyle}>
                                            <Radio name={"srv_radioOption"} checked = {checked}
                                                   value={r._id}  onChange={(e) => this.metadataRadioChanged(r._id, m)}>
                                                {r.option.name}
                                            </Radio>
                                        </Col>
                                    }
                                )}
                            </Row>
                        </Col>
                    </Row>
        }

        if(m.dataType.toLowerCase() === 'checkbox')
        {
            let optionsToSelect = '';
            let maxOptions = '';
            if(m.minimumNumberOfOptionsToChoose !== undefined && parseInt(m.minimumNumberOfOptionsToChoose) > 0)
            {
                optionsToSelect = <h3 style={{fontColor: '#000'}} className= "h3-label">{m.serviceMetadata.checkedOptions.length}/{m.minimumNumberOfOptionsToChoose}</h3>;
                maxOptions = '(Choose ' + m.minimumNumberOfOptionsToChoose + ')';
            }
            return <Row gutter={16} style={{marginBottom: '8px'}}>
                        <Col span= "24">
                            <h3 className= "h3-label">{m.questionCaption} {maxOptions} </h3>
                            {
                                optionsToSelect
                            }
                            <Row className="ant-radio-group">
                                {m.metadataOptions.map( (r) =>
                                    {
                                        let checked = false;
                                        let ed = m.serviceMetadata.checkedOptions.filter(x => {return x === r._id});
                                        if(ed.length > 0)
                                        {
                                            checked = true;
                                        }
                                      return <Col key={r._id} span={24} style={this.state.listStyle}>
                                            <Checkbox checked = {checked}
                                                      value={r._id}  onChange={(e) => this.metadataCheckOptionChanged(e, r._id, m)}>
                                                {r.option.name}
                                            </Checkbox>
                                        </Col>
                                    }
                                )}
                            </Row>
                        </Col>
                </Row>
        }

        if(m.dataType.toLowerCase() === 'dropdown')
        {
            return <Row gutter={16} style={{marginBottom: '8px'}}>
                        <Col span= "24">
                            <h3 className= "h3-label">{m.questionCaption}</h3>
                            <Select
                                    showSearch
                                    style={{width: '100%'}}
                                    placeholder="- select -"
                                    optionFilterProp="children"
                                    value={(m.serviceMetadata.metadataOption !== undefined && m.serviceMetadata.metadataOption.length > 0)? m.serviceMetadata.metadataOption : "- select -"}
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    onChange={(val) => this.optionChanged(val, m)}>
                                {m.metadataOptions.map(cn => <Option value={cn._id} key={cn._id}>{cn.option.name}</Option>)}
                            </Select>
                        </Col>
                </Row>
        }

        if(m.dataType.toLowerCase() === 'dropdownrange')
        {
            return <Row gutter={16} style={{marginBottom: '8px'}}>
                        <Col span= "24"><h3 className= "h3-label">{m.questionCaption}</h3></Col>
                        <Col span= "12">
                            <h3 className= "h3-label">From</h3>
                            <Select name="from"
                                    showSearch
                                    style={{width: '100%'}}
                                    placeholder="- From -"
                                    optionFilterProp="children"
                                    value={(m.serviceMetadata.metadataOptionRange !== undefined && m.serviceMetadata.metadataOptionRange.fromOption.length > 0)? m.serviceMetadata.metadataOptionRange.fromOption : '- From -'}
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    onChange={(val) => this.metadataOptionRangeChanged(val, m, 'fromOption')}>
                                    <Option value="">- From -</Option>
                                    {m.metadataOptions.map(cn => <Option value={cn._id} key={cn._id}>{cn.option.name}</Option>)}
                            </Select>
                        </Col>
                        <Col span= "12">
                            <h3 className= "h3-label">To</h3>
                            <Select name="to"
                                    showSearch
                                    style={{width: '100%'}}
                                    placeholder="- To -"
                                    optionFilterProp="children"
                                    value={(m.serviceMetadata.metadataOptionRange.toOption !== undefined && m.serviceMetadata.metadataOptionRange.toOption.length > 0)? m.serviceMetadata.metadataOptionRange.toOption : '- To -'}
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    onChange={(val) => this.metadataOptionRangeChanged(val, m, 'toOption')}>
                                    <Option value="">- To -</Option>
                                    {m.metadataOptions.map(cn => <Option value={cn._id} key={cn._id}>{cn.option.name}</Option>)}
                            </Select>
                        </Col>
                </Row>
        }

        if(m.dataType.toLowerCase() === 'date')
        {
            return <Row gutter={16} style={{marginBottom: '8px'}}>
                <Col span= "24">
                    <h3 className= "h3-label">{m.questionCaption}</h3>
                    <DatePicker onChange={(date) => this.metadataDateChanged(date, m)} defaultValue={(m.serviceMetadata.providedDate !== undefined && m.serviceMetadata.providedDate!== null && m.serviceMetadata.providedDate.length > 0)? moment(m.serviceMetadata.providedDate, 'YYYY/MM/DD') : null} format="YYYY/MM/DD" placeholder={m.questionCaption}
                        dateRender={(current) =>
                        {
                            return (
                              <div className="ant-calendar-date">
                                {current.date()}
                              </div>
                            );
                        }}
                    />
                </Col>
            </Row>
        }

        if(m.dataType.toLowerCase() === 'daterange')
        {
            return <Row gutter={16} style={{marginBottom: '8px'}}>
                        <Col span= "24"><h3 className= "h3-label">{m.questionCaption}</h3></Col>
                        <Col span= "12">
                            <h3 className= "h3-label">Start date</h3>
                            <DatePicker onChange={(date) => this.metadataDateChanged(date, m, 'startDate')} defaultValue={(m.serviceMetadata.providedDateRange.startDate !== undefined && m.serviceMetadata.providedDateRange.startDate !== null && m.serviceMetadata.providedDateRange.startDate.length > 0)? moment(m.serviceMetadata.providedDateRange.startDate, 'YYYY/MM/DD') : null} format="YYYY/MM/DD" placeholder="Start date"
                                dateRender={(current) =>
                                {
                                    return (
                                      <div className="ant-calendar-date">
                                        {current.date()}
                                      </div>
                                    );
                                }}
                            />
                        </Col>
                        <Col span= "12">
                            <h3 className= "h3-label">End date</h3>
                            <DatePicker onChange={(date) => this.metadataDateChanged(date, m, 'endDate')} defaultValue={(m.serviceMetadata.providedDateRange.endDate !== undefined && m.serviceMetadata.providedDateRange.endDate !== null && m.serviceMetadata.providedDateRange.endDate.length > 0)? moment(m.serviceMetadata.providedDateRange.endDate, 'YYYY/MM/DD') : null} format="YYYY/MM/DD" placeholder="Start date"
                                dateRender={(current) =>
                                {
                                    return (
                                        <div className="ant-calendar-date">
                                            {current.date()}
                                        </div>
                                    );
                                }}
                            />
                        </Col>
                </Row>
        }
    }

    async processServiceBasics()
    {
        let valid = await this.props.validateQ();
        if(!valid)
        {
            this.props.showMessage('You can only have two (2) unpublished Services at a time', -1);
            return;
        }

        let service = this.props.service;

        if(!service.title || service.title.length < 1)
        {
            this.props.showMessage('Please give your service a catchy name', -1);
            return;
        }

        if(!service.rteDescription || service.rteDescription.length < 1)
        {
            this.props.showMessage('It is important that you give your service a befitting description', -1);
            return;
        }

        let section = this.props.sections.find(s => s.name.toLowerCase() === 'services');
        if(!section || section._id.length < 1)
        {
            this.props.showMessage('An unexpected error was encountered. Please refresh the page and try again', -1);
            return;
        }

        this.props.showSpinner(true);
        let keywords = [];
        if(service.keywords.length > 0)
        {
            let res1 = await postQuery('/processKeywords', JSON.stringify(service.keywords));
            if(res1.code < 1)
            {
                this.props.showMessage('An unexpected error was encountered. Please refresh the page and try again', -1);
                return;
            }
            keywords = res1.serviceKeywords;
        }

        let payload = (service._id !== undefined && service._id.length > 0)?
            {_id: service._id, addedBy: this.props.geek.id, creativeSection: section._id, description: service.rteDescription.toString('html'), title: service.title, keywords: keywords}
            : {addedBy: this.props.geek.id, creativeSection: section._id, description: service.rteDescription.toString('html'), title: service.title, keywords: keywords};

        let res = await postQuery('/processServiceBasics', JSON.stringify(payload));
        this.props.showSpinner(false);
        this.props.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            if(service.serviceStatus <= this.props.serviceStatusMap.basicsProvided)
            {
                service.serviceStatus = this.props.serviceStatusMap.basicsProvided;
                this.setState({activeTarget: 'srv_category', activeLevel: 1});
            }
            service._id = res.serviceId;
            this.props.updateState('service', service);
        }
    }

    async processCategorisation()
    {
        let service = this.props.service;

        if(service.creativeCategory.length < 1)
        {
            this.props.showMessage('Please select a Category for your service', -1);
            return;
        }
        if(service.creativeSubCategory.length < 1)
        {
            this.props.showMessage('Please select your service Subcategory', -1);
            return;
        }
        if(service.creativeType.length < 1)
        {
            this.props.showMessage('Please select your service Type', -1);
            return;
        }

        if(service.serviceStatus < this.props.serviceStatusMap.basicsProvided)
        {
            this.props.showMessage('A surprising error was encountered. Please be sure to provide the Basic information on your service first before making this request', -1);
            return;
        }

        if(this.state.creativeMetadataList.length > 0 && service.metadata.length < 1)
        {
            this.props.showMessage('Please provide at least one metadata information', -1);
            return;
        }

        this.props.showSpinner(true);
        let payload = {metadata: service.metadata, serviceId: service._id, creativeCategory: service.creativeCategory, creativeSubCategory: service.creativeSubCategory, creativeType: service.creativeType, serviceStatus: service.serviceStatus};

        let res = await postQuery('/processCategorisation', JSON.stringify(payload));
        this.props.showSpinner(false);
        this.props.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            if(service.serviceStatus <= this.props.serviceStatusMap.basicsProvided)
            {
                service.serviceStatus = this.props.serviceStatusMap.categoryProvided;
                this.setState({activeTarget: 'srv_Resources', activeLevel: 1});
            }
            this.props.updateState('service', service);
        }

    }

    async processRequirements()
    {
        let service = this.props.service;
        if(service === undefined || service === null || service.serviceId.length < 1)
        {
            this.props.showMessage('A fatal error was encountered. Please refresh the page and try again', -1);
        }
        if(service.requirements.length < 1)
        {
            this.props.showMessage('Please provide at least one requirement to help your customers better \nprovide you with the necessary data to render this service', -1);
        }

        let noLabel = service.requirements.some(s => s.label.length < 1);
        if(noLabel === true)
        {
            this.props.showMessage('Please specify your requirement(s) so as to help your customers better \nprovide you with the necessary data to render this service', -1);
        }

        let noRequirementResponseType = service.requirements.some(s => s.requirementResponseType.length < 1);
        if(noRequirementResponseType === true)
        {
            this.props.showMessage('Please specify the Response Type to your requirement(s). \nIt your customers can be clear on what you need to render this service', -1);
        }

        let noRequirementResponseOptions = (service.requirements.some(s => s.requirementResponseType.toLowerCase() === 'single_answer' || s.requirementResponseType.toLowerCase() === 'multi-choice_answer') && s.requirementResponseOptions.length  < 1);
        if(noRequirementResponseOptions === true)
        {
            this.props.showMessage('Please specify the Response Option(s) to your requirement(s). \nThis will help your customers to be clear on what you need to render this service', -1);
        }
        if(service.serviceStatus < this.props.serviceStatusMap['categoryProvided'])
        {
            this.props.showMessage('A surprising error was encountered. \nPlease be sure to provide information on Categorization & more for your service first before making this request', -1);
        }

        this.props.showSpinner(true);
        let res = await postQuery('/processRequirements', JSON.stringify({serviceId: service._id, requirements: service.requirements, serviceStatus: service.serviceStatus}));
        this.props.showSpinner(false);
        this.props.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            if(service.serviceStatus === this.props.serviceStatusMap.categoryProvided)
            {
                service.serviceStatus = this.props.serviceStatusMap.requirementsProvided;
            }
        }

    }

    onTogglePdfSelection()
    {
        document.getElementById('servicePdf').click();
    }

    selectPdf(e)
    {
        let pdf = e.target.files[0];
        if(pdf.size > 1000*1024)
        {
            this.props.showMessage('The selected pdf file must not exceed 1MB', -1);
            return;
        }

        this.uploadPdf(pdf);
    }

    handleCancel() {this.setState({ previewVisible: false })}
    handlePreview(file){
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }

    handleChange({resourceList}) {this.setState({ resourceList });}

    onToggleFileSelection(view)
    {
        if(view === undefined || view === null || view < 1)
        {
            return;
        }

        this.setState({imageToPreview: view});
        document.getElementById('serviceImage').click();
    }

    previewPhoto(e)
    {
        e.preventDefault();
        let service = this.props.service;
        let el = this;
        let reader = new FileReader();
        let file = e.target.files[0];
        let img = new Image();
        let _URL = window.URL || window.webkitURL;
        img.src = _URL.createObjectURL(file);

        if(file.size > this.state.maxFileSize)
        {
            this.props.showMessage('Photo size should not exceed 500KB', -1);
            return;
        }

        if(this.state.imageToPreview === undefined || this.state.imageToPreview === null || this.state.imageToPreview < 1)
        {
            this.props.showMessage('A fatal error was encountered. Please refresh the page and try again', -1);
            return;
        }

        let w = 0;
        let h = 0;
        img.onload = function ()
        {
            w = parseInt(this.width);
            h = parseInt(this.height);

            if(w < el.state.minWidth || h < el.state.minHeight)
            {
                el.props.showMessage('The selected photo dimensions are lower than the Minimum recommended dimensions of: ' + el.state.minWidth + 'px * ' + el.state.minHeight + 'px', -1);
            }
            else
            {
                reader.onloadend = () =>
                {
                    let name = '';
                    if(el.state.imageToPreview === 1)
                    {
                        service.bannerImage = reader.result;
                        name = 'bannerImage';
                    }
                    else if(el.state.imageToPreview === 2)
                    {
                        service.secondImage = reader.result;
                        name = 'secondImage';
                    }
                    else if(el.state.imageToPreview === 3)
                    {
                        service.thirdImage = reader.result;
                        name = 'thirdImage';
                    }
                    let bb = el.state.resourceList.filter(d => {
                        return d.uid === el.state.imageToPreview;
                    });

                    bb.length > 0? el.state.resourceList.find(r => r.uid === el.state.imageToPreview).url = reader.result : el.state.resourceList.push(
                        {
                            uid: el.state.imageToPreview,
                            name: name,
                            status: 'done',
                            url: reader.result
                        });
                    el.props.updateState('service', service);
                    el.setState({currentFile: file});
                    el.uploadPhoto();
                };
                reader.readAsDataURL(file);
            }
        };

    }

    uploadPhoto()
    {
        let file = this.state.currentFile;
        if (file && file.size > 0)
        {
            let el = this;
            let service = el.props.service;
            let xhr = new XMLHttpRequest();
            let formData = new FormData();
            let prop = el.state.imageToPreview === 1? 'bannerImage' : el.state.imageToPreview === 2? 'secondImage' : 'thirdImage';

            xhr.open("POST", '/uploadPhoto?uploadPath=' + el.props.geek.geekNameUpper + '&section=service&itemId=' + service._id + '&prop=' + prop, true);
            xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
            xhr.onerror = function(e)
            {
                el.props.showMessage('An unknown error was encountered. Please refresh the page and try again', -1);
                console.log(e);
            };
            xhr.onload = function()
            {
                el.props.showSpinner(false);
                let res = (JSON.parse(xhr.response));
                if(res.code > 0)
                {
                    if(el.state.imageToPreview === 1)
                    {
                        service.bannerImage = res.filePath;
                    }
                    else if(el.state.imageToPreview === 2)
                    {
                        service.secondImage = res.filePath;
                    }
                    else if(el.state.imageToPreview === 3)
                    {
                        service.thirdImage = res.filePath;
                    }

                    let bb = el.state.resourceList.filter(d => {
                        return d.uid === el.state.imageToPreview;
                    });

                    bb.length > 0? el.state.resourceList.find(r => r.uid === el.state.imageToPreview).url = res.filePath : el.state.resourceList.push(
                        {
                            uid: el.state.imageToPreview,
                            name: 'bannerImage',
                            status: 'done',
                            url: reader.result
                        });

                    el.props.updateState('service', service);
                    el.setState({imageToPreview: 0});
                }
                else
                {
                    el.props.showMessage(res.message, -1);
                }
            };

            formData.append('file', file);
            el.props.showSpinner(true);
            xhr.send(formData);
        }
        else
        {
            el.props.showMessage('No files selected', -1);
        }
    };

    async removeImage(obj)
    {
        if (obj && obj.name.length > 0)
        {
            let service = this.props.service;
            this.props.showSpinner(true);
            let res = await postQuery('/removeImage?section=service&itemId=' + service._id + '&prop=' + obj.name, JSON.stringify({}));
            this.props.showSpinner(false);
            this.props.showMessage(res.message, res.code);
            if (res.code > 0)
            {
                service[obj.name] = '';
                let fileList = this.state.resourceList.filter(r => r.name !== obj.name);
                this.setState({resourceList: fileList});
                this.props.updateState('service', service);
            }
        }
        else
        {
            this.props.showMessage('An error was encountered. Please refresh the page and try again', -1);
        }
    }

    async removePdf()
    {
        let service = this.props.service;
        let res = await postQuery('/removePdf?section=service&itemId=' + service._id, JSON.stringify({}));
        this.props.showMessage(res.message, res.code);
        if (res.code > 0)
        {
            service.pdfResource = {name: '', path: ''};
            this.props.updateState('service', service);
        }
    }

    uploadPdf(pdf)
    {
        let file = this.state.pdfFile;
        if (pdf && pdf.size > 0)
        {
            let el = this;
            let service = el.props.service;
            console.log(pdf.name);
            service.pdfResource = {name: pdf.name, path: ''};
            this.props.updateState('service', service);

            let xhr = new XMLHttpRequest();
            let formData = new FormData();

            xhr.open("POST", '/uploadPdf?uploadPath=' + el.props.geek.geekNameUpper + '&section=service&itemId=' + service._id, true);
            xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
            xhr.onerror = function(e)
            {
                el.props.showMessage('An unknown error was encountered. Please refresh the page and try again', -1);
                console.log(e);
            };
            xhr.onload = function()
            {
                el.props.showSpinner(false);
                let res = (JSON.parse(xhr.response));
                el.props.showMessage(res.message, res.code);
                if(res.code > 0)
                {
                    service.pdfResource.path = res.filePath;
                    el.props.updateState('service', service);
                }
            };

            formData.append('file', pdf);
            el.props.showSpinner(true);
            xhr.send(formData);
        }
        else
        {
            el.props.showMessage('No files selected', -1);
        }
    };

    async processAssets()
    {
        let service = this.props.service;

        if(service.bannerImage === undefined || service.bannerImage === null || service.bannerImage.length < 1)
        {
            this.props.showMessage('Please attatch at least a photo to your service', -1);
            return;
        }

        this.props.showSpinner(true);
        let res = await postQuery('/toggleAsset?id=' + service._id, JSON.stringify({}));
        this.props.showSpinner(false);
        this.props.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            if(service.serviceStatus <= this.props.serviceStatusMap.assetsProvided)
            {
                service.serviceStatus = this.props.serviceStatusMap.assetsProvided;
                this.setState({activeTarget: 'srv_packages', activeLevel: 1});
            }
            this.props.updateState('service', service);
        }

    }

    async processPackages()
    {
        let service = this.props.service;
        let packages = [];
        if(this.state.packagesUsed.length < 1)
        {
            this.props.showMessage('Please provide at least one price package', -1);
            return;
        }
        for(let i = 0; i < this.state.packagesUsed.length; i++)
        {
            let p = this.state.packagesUsed[i];
            if(p.description.trim().length < 1)
            {
                this.props.showMessage('Please provide description for all selected price packages', -1);
                return;
            }

            if(p.delivery === undefined || p.delivery === null || p.delivery.length < 1 || parseInt(p.delivery) < 1)
            {
                this.props.showMessage('The Delivery field is mandatory for all selected price packages', -1);
                return;
            }

            if(p.price === undefined || p.price === null || p.price.length < 1 || parseInt(p.price) < 1)
            {
                this.props.showMessage('The Price field is mandatory and must be valid numeric figures for all selected price packages', -1);
                return;
            }
            packages.push(p);
        }

        this.props.showSpinner(true);
        let res = await postQuery('/processServicePackages', JSON.stringify(packages));
        this.props.showSpinner(false);
        this.props.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            if(service.serviceStatus <= this.props.serviceStatusMap.packagesProvided)
            {
                service.serviceStatus = this.props.serviceStatusMap.packagesProvided;
            }
            this.setState({activeTarget: 'srv_go', activeLevel: 1});
            this.props.updateState('service', service);
        }
    }

    async publish()
    {
        let service = this.props.service;
        this.props.showSpinner(true);
        let res = await postQuery('/swOnl', JSON.stringify({service: service._id}));
        this.props.showSpinner(false);
        this.props.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            service.serviceStatus = this.props.serviceStatusMap.published;
            this.props.updateState('service', service);
            this.props.updateView('Service:1');
            this.setState({activeTarget: 'srv_primary'})
        }
    }

    setPhone(e)
    {
        this.setState({phone: e.target.value})
    }

    async verifyPhone()
    {
        if(this.state.phone.length < 1)
        {
            this.props.showMessage('Phone number is required', -1);
            return;
        }

        let el = this;
        this.props.showSpinner(true);
        let res = await postQuery('/verifyPhone', JSON.stringify({user: this.props.geek.id, phone: this.state.phone}));
        this.props.showSpinner(false);
        if(res.code > 0)
        {
            this.props.showMessage('A verification code has been sent to the provided number', -1);
            this.setState({confirmationCodeSent: true});
            let interval = 60;
            let x = setInterval(function()
            {
                interval--;
                el.setState({countdown: interval});
                if (interval < 1)
                {
                    clearInterval(x);
                }
            }, 1000);
        }
    }

    setCode(e)
    {
        this.setState({confirmationCode :e.target.value});
    }

    async verifyCode()
    {
        if(this.state.confirmationCode.length < 1)
        {
            this.props.showMessage('Verification code is required', -1);
            return;
        }
        this.props.showSpinner(true);
        let res = await postQuery('/verifyCode', JSON.stringify({user: this.props.geek.id, phoneCode: this.state.confirmationCode}));
        this.props.showSpinner(false);
        if(res.code > 0 && res.phoneVerified === true)
        {
            let geek = this.props.geek;
            geek.phoneNumberConfirmed = true;
            this.props.showMessage(res.message, res.code);
            this.props.updateState('geek', geek);
            this.publish();
        }
        else{
            this.props.showMessage(res.message, -1);
        }
    }

    async resendCode(e)
    {
        if(this.state.phone.length < 1)
        {
            this.setState({confirmationCodeSent: false});
            this.props.showMessage('Phone number is required. Please refresh the page and try again', -1);
            return;
        }

        this.props.showSpinner(true);
        let res = await postQuery('/verifyPhone', JSON.stringify({user: this.props.geek.id, phone: this.state.phone}));
        this.props.showSpinner(false);
        if(res.code > 0)
        {
            this.props.showMessage('A verification code has been sent to the provided number', -1);
            this.setState({confirmationCodeSent: true});
            let x = 60;
            let interval = setInterval(function()
            {
                x--;
                this.setState({countdown: x});
                if (x < 1)
                {
                    clearInterval(interval);
                }
            }, 1000);
        }
    }

    render()
    {
        const toolbarConfig =
        {
            display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS'],
            INLINE_STYLE_BUTTONS: [
                {label: 'Bold', style: 'BOLD'},
                {label: 'Italic', style: 'ITALIC'},
                {label: 'Underline', style: 'UNDERLINE'}
            ],
            BLOCK_TYPE_BUTTONS: [
                {label: 'UL', style: 'unordered-list-item'},
                {label: 'OL', style: 'ordered-list-item'}
            ]
        };

        const {nestedSelectionChanged, RTE, handleTagDelete, handleTagAddition, geek, service, rteTextChanged, nestedDataChanged, returnServiceView, serviceStatusMap, shouldUpdateCategories} = this.props;
        const {activeTarget, value, activeLevel, creativeCategories, creativeSubCategories, creativeTypes, creativeMetadataList, packagesUsed, phone, confirmationCode, confirmationCodeSent, countdown,  previewVisible, previewImage, resourceList , packageTypes, allPackageSelected} = this.state;

        const editorOptions = {
            options: ['inline', 'blockType', 'textAlign'],
            inline: {
                inDropdown: false,
                className: undefined,
                component: undefined,
                dropdownClassName: undefined,
                options: ['bold', 'italic', 'underline', 'strikethrough'],
                bold: { icon: 'bold', className: undefined },
                italic: { icon: 'italic', className: undefined },
                underline: { icon: 'underline', className: undefined },
                strikethrough: { icon: 'strikethrough', className: undefined }
            },
            blockType: {
                inDropdown: true,
                options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
                className: undefined,
                component: undefined,
                dropdownClassName: undefined,
            }
        };

        return(
            <div  className="main-content" id="mainContent">
                <div className="main">
                    <button aria-label="Close" title="Close" className="ant-modal-close" onClick={() => this.closeAction(returnServiceView)}>
                        <i className="material-icons close-x">arrow_back</i>
                    </button>
                    <div className="ant-modal-header">
                        <div className="ant-modal-title-x">
                            {(service._id !== undefined && service._id !== null && service._id.length > 0)? 'Update Service' : 'Profile New Service'}
                        </div>
                    </div>
                    <Section activeTarget={activeTarget} activeLevel={activeLevel} triggerClose = {this.triggerClose} name="srv_primary" title="Basic" level="1" titleClass = "sectionHead"
                             triggerButtonClass = "section-button" articleWrapClass = "articlewrap" openClassClass =  "section open" closeClass = "section" toggleDisabled="accordion_enabled">
                        <div className="ant-modal-x">
                            <div className="ant-modal-content-x" style={{boxShadow : 'none !important'}}>
                                <div className="ant-modal-body-x">
                                    <Row style={{marginBottom: '18px'}}>
                                        <Col span={24}>
                                            <h3 className= "h3-label">Service Label (60 characters) *</h3>
                                            <input onChange={(e) => nestedDataChanged('service', 'title', e)} rows="3" name="title" type="text" className="ant-input ant-input-lg input-no-border input-bordered" placeholder="Give your service a catchy name *" value={service.title}/>
                                        </Col>
                                    </Row>
                                    <Row style={{marginBottom: '18px'}}>
                                        <Col span={24}>
                                            <h3 className= "h3-label">Describe your Service (Not more than 1000 characters) </h3>

                                            <RTE
                                                toolbarConfig={toolbarConfig}
                                                value={service.rteDescription}
                                                onChange={rteTextChanged}
                                                className="input-bordered rtEditor"
                                                placeholder="Describe this Service *"
                                            />

                                        </Col>
                                    </Row>
                                    <Row style={{marginBottom: '8px'}}>
                                        <Col span={24}>
                                            <h3 className= "h3-label">Search Keywords (will help customers to easily find this service)</h3>
                                            <ReactTags
                                                tags={service.keywords}
                                                suggestions={this.state.keywords}
                                                handleDelete={handleTagDelete}
                                                handleAddition={handleTagAddition}
                                                placeholder = "Press 'Enter/Tab' key to type more"
                                                allowNew = {true}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                                <Row gutter={2} className="ant-modal-footer-x">
                                    <Col span={11}>
                                        <button className="cancel cancel-padding-1 ant-btn" style={{width: 'auto', float: 'left'}} onClick={() => closeAction(returnServiceView)}>
                                            Cancel
                                        </button>
                                    </Col>
                                    <Col span={1}>
                                    </Col>
                                    <Col span={11}>
                                        <button className="join-us join-us-padding-1 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: 'auto', float: 'left', marginRight: '5px'}} onClick={this.processServiceBasics}>
                                            Continue
                                        </button>
                                    </Col>
                                </Row>

                            </div>
                        </div>
                    </Section>
                    <Section activeTarget={activeTarget} activeLevel={activeLevel} name="srv_category" title="Categorization & more" level="1" titleClass = "sectionHead" triggerClose = {this.triggerClose} triggerButtonClass = "section-button" articleWrapClass = "articlewrap" openClassClass =  "section open" closeClass = "section"
                             toggleDisabled={(service.serviceStatus >= this.props.serviceStatusMap.basicsProvided)? "accordion_enabled" : "accordion_disabled"}>
                        <div className="ant-modal-x">
                            <div className="ant-modal-content-x" style={{boxShadow : 'none !important'}}>
                                <div className="ant-modal-body-x">
                                    <Row gutter={16} style={{marginBottom: '8px'}}>
                                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                            <h3 className= "h3-label">Service Category</h3>
                                            <Select name="creativeCategory"
                                                    showSearch
                                                    style={{width: '100%'}}
                                                    placeholder="Service Category"
                                                    optionFilterProp="children"
                                                    value={(service.creativeCategory !== undefined && service.creativeCategory._id.length > 0)? service.creativeCategory._id : 'Service Category *'}
                                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                    onChange={(val) => this.categoryChanged(val)}>
                                                {creativeCategories.map(cn => <Option value={cn._id} key={cn._id}>{cn.name}</Option>)}
                                            </Select>
                                        </Col>
                                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                            <h3 className= "h3-label">Subcategory</h3>
                                            <Select name="creativeSubCategory"
                                                    showSearch
                                                    style={{width: '100%'}}
                                                    placeholder="Subcategory"
                                                    optionFilterProp="children"
                                                    value={(service.creativeSubCategory !== undefined && service.creativeSubCategory._id.length > 0)? service.creativeSubCategory._id : 'Subcategory *'}
                                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                    onChange={this.subCategoryChanged}>
                                                {creativeSubCategories.map(cn => <Option value={cn._id} key={cn._id}>{cn.name}</Option>)}
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Row gutter={16} style={{marginBottom: '8px'}}>
                                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                            <h3 className= "h3-label">Service Type</h3>
                                            <Select name="education"
                                                    showSearch
                                                    style={{width: '100%'}}
                                                    placeholder="Category"
                                                    optionFilterProp="children"
                                                    value={(service.creativeType !== undefined && service.creativeType._id.length > 0)? service.creativeType._id : 'Service Type'}
                                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                    onChange={this.serviceTypeChanged}>
                                                {creativeTypes.map(cn => <Option value={cn._id} key={cn._id}>{cn.name}</Option>)}
                                            </Select>
                                        </Col>
                                    </Row>
                                    {(creativeMetadataList !== undefined && creativeMetadataList.length > 0)?
                                        <Row style={{marginBottom: '8px', marginTop: '25px'}}>
                                            <Col span={24}>
                                                <h3 style={{fontSize: '17px', fontWeight: '700', paddingBottom: '20px !important', color: '#888'}}>More information</h3>
                                                <div className="main">
                                                    {creativeMetadataList.map(m => <Section key={m._id} activeTarget={activeTarget} activeLevel={activeLevel} name={m._id} title={m.title} level="2" titleClass = "innerSectionHead" triggerClose = {this.triggerClose} triggerButtonClass = "section-button-2" articleWrapClass = "articleWrap-2"  openClassClass = "innerSection open " closeClass = "innerSection" >
                                                        <div className="ant-modal-x">
                                                            <div className="ant-modal-content-x" style={{boxShadow : 'none !important'}}>
                                                                <div className="ant-modal-body-x">
                                                                    {
                                                                        this.renderMetadata(m)
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Section> )}
                                                </div>
                                            </Col>
                                        </Row> : ''
                                    }

                                </div>
                                <Row gutter={2} className="ant-modal-footer-x">
                                    <Col span={11}>
                                        <button className="cancel cancel-padding-1 ant-btn" style={{width: 'auto', float: 'left'}} onClick={() => closeAction(returnServiceView)}>
                                            Cancel
                                        </button>
                                    </Col>
                                    <Col span={1}>
                                    </Col>
                                    <Col span={11}>
                                        <button className="join-us join-us-padding-1 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: 'auto', float: 'left', marginRight: '5px'}} onClick={this.processCategorisation}>
                                            Continue
                                        </button>
                                    </Col>
                                </Row>

                            </div>
                        </div>
                    </Section>
                    <Section activeTarget={activeTarget} activeLevel={activeLevel} name="srv_Resources" title="Resources" level="1" titleClass = "sectionHead"
                             triggerClose = {this.triggerClose} triggerButtonClass = "section-button" articleWrapClass = "articlewrap"
                             openClassClass =  "section open" closeClass = "section"  toggleDisabled={(service.serviceStatus >= this.props.serviceStatusMap.categoryProvided)? "accordion_enabled" : "accordion_disabled"}>

                        <div className="ant-modal-x">
                            <div className="ant-modal-content-x" style={{boxShadow : 'none !important'}}>
                                <div className="ant-modal-body-x">
                                    <Row>
                                        <Col span={24}>
                                            <h4 style={{fontWeight: '700'}}>Resources to help communicate your offering & competence to buyers</h4>
                                        </Col>
                                    </Row>
                                    <br/>
                                    <Row  id= 'ed_photos' style={{marginBottom: '20px'}}>
                                        <Row style={{marginBottom: '15px'}}>
                                            <div className="ant-col-24 row-no-btm">
                                                <div className="ant-row">
                                                    <h4><b>Photo(s)</b></h4>
                                                    <h6>jpeg, jpg, or png images (<b>max. size: 500KB</b>) are cool</h6>
                                                    <h6>Minimum recommended dimensions: {this.state.minWidth + 'px * ' + this.state.minHeight + 'px'}</h6>
                                                </div>
                                            </div>
                                        </Row>
                                        <div className="clearfix svcUpload focus-within">
                                            <span className="focus-within">
                                                <div className="ant-upload-list ant-upload-list-picture-card focus-within">
                                                    {
                                                        resourceList.map(r =>
                                                        <div key={r.uid} className="ant-upload-list-item ant-upload-list-item-done focus-within">
                                                        <div className="ant-upload-list-item-info">
                                                            <span>
                                                                <a className="ant-upload-list-item-thumbnail"
                                                                   href={r.url} target="_blank"
                                                                   rel="noopener noreferrer">
                                                                    <img src={r.url} alt={r.name} style={{width: '170px', height: '150px'}}/>
                                                                </a>
                                                            </span>
                                                        </div>
                                                        <span className="ant-upload-list-item-actions focus-within" style={{width: "70%"}}>
                                                            <a onClick={() => {this.handlePreview(r)}} style={{cursor: "pointer"}} title="Preview image" className="focus-within">
                                                                <i className="anticon anticon-eye-o"></i>
                                                            </a>
                                                            <a  onClick={() => this.onToggleFileSelection(r.uid)} style={{cursor: "pointer", marginLeft: "20%", marginRight: "20%"}} title="Change image" className="focus-within">
                                                               <i className="anticon anticon-edit"></i>
                                                            </a>
                                                            <i onClick={() => {this.removeImage(r)}} title="Remove image" className="anticon anticon-delete"></i>
                                                        </span>
                                                    </div>)}
                                                </div>
                                                <div className="ant-upload ant-upload-select ant-upload-select-picture-card" style={{display: (resourceList.length >= 3) ? 'none' : 'flex'}}>
                                                    <span tabIndex="0" className="ant-upload" role="button" onClick={() => this.onToggleFileSelection(this.state.resourceList.filter(r => r.uid === 1).length < 1? 1 : this.state.resourceList.filter(r => r.uid === 2).length < 1 ? 2 : this.state.resourceList.filter(r => r.uid === 3).length < 1? 3 : 0)}>
                                                        <div className="div-margin">
                                                            <i className="material-icons">add_a_photo</i>
                                                            <div className="ant-upload-text">
                                                                {(service.bannerImage === undefined || service.bannerImage.length < 1)? 'Add banner image' : 'Add more image'}
                                                            </div>
                                                        </div>
                                                    </span>
                                                </div>
                                                <input id="serviceImage"  onChange = {(e) => this.previewPhoto(e)}  type="file" accept=".png, .jpg, .jpeg" style={{display: "none"}}/>
                                            </span>
                                            <Modal className='ggt' visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                                <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                            </Modal>
                                        </div>

                                    </Row>
                                    <Row  id= 'ed_pdf' style={{marginBottom: '20', display: (service.bannerImage === undefined ||service.bannerImage.length < 1)? 'none' : 'block'}}>
                                        <Row style={{marginBottom: '15px'}}>
                                            <div className="ant-col-24 row-no-btm">
                                                <div className="ant-row">
                                                    <h4><b>Pdf</b></h4>
                                                    <h6>You might need to add a pdf file (<b>max. size: 1MB</b>) to further drive your service offering home</h6>
                                                </div>
                                            </div>
                                        </Row>
                                        <Row gutter={2}>
                                            <Col xs={24} sm={12} md={12} lg={12} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                                {
                                                    (service.pdfResource !== undefined && service.pdfResource !== null && service.pdfResource.path.length > 0)?
                                                        <div className="row-no-btm">
                                                            <div className="ant-row ant-form-item pfs">
                                                                <nav className="ed_nav ju">
                                                                    <a href={service.pdfResource.path} target="_blank" className="focus-within">
                                                                        <i className="anticon anticon-eye-o" style={{cursor: "pointer", marginLeft: '5px'}} title="View pdf"></i>
                                                                    </a>
                                                                    <i className="anticon anticon-edit" onClick={this.onTogglePdfSelection} style={{cursor: "pointer", marginLeft: "10%", marginRight: "10%"}} title="Change pdf"></i>
                                                                    <i onClick={() => this.removePdf()} title="Remove" className="anticon anticon-delete" style={{cursor: "pointer"}}></i>
                                                                </nav>
                                                                <a style={{color: '#21ba45', fontWeight: 'bold', padding: '10px'}} className="resource-default-body">{service.pdfResource.name}</a>

                                                            </div>
                                                        </div> : ''
                                                }
                                            </Col>
                                        </Row>
                                        <div className="ant-row" style={{display: (service.pdfResource === undefined || service.pdfResource === null || service.pdfResource.path.length < 1)? 'block' : 'none'}}>
                                            <Col span={12}>
                                                <a style={{color: '#21ba45', cursor: 'pointer'}} onClick={this.onTogglePdfSelection}>
                                                    <i className="md-icon material-icons" style={{fontSize: '17px', fontWeight: 'bold', position: 'absolute', color: '#21ba45'}}>
                                                        add
                                                    </i> &nbsp; &nbsp;
                                                    <label style={{marginLeft: '5px', cursor: 'pointer'}}>Add a pdf file</label>
                                                </a>
                                                <input onChange = {(e) => this.selectPdf(e)} id="servicePdf" name="file" type="file" accept=".pdf" style={{display: 'none'}}/>
                                            </Col>
                                        </div>
                                    </Row>
                                </div>

                                <Row gutter={2} className="ant-modal-footer-x">
                                    <Col span={11}>
                                        <button className="cancel cancel-padding-1 ant-btn" style={{width: 'auto', float: 'left'}} onClick={() => closeAction(returnServiceView)}>
                                            Cancel
                                        </button>
                                    </Col>
                                    <Col span={1}>
                                    </Col>
                                    <Col span={11}>
                                        <button className="join-us join-us-padding-1 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: 'auto', float: 'left', marginRight: '5px'}} onClick={this.processAssets}>
                                            Continue
                                        </button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Section>
                    <Section activeTarget={activeTarget} activeLevel={activeLevel} name="srv_packages" title="Package(s)" level="1" titleClass = "sectionHead"
                             triggerClose = {this.triggerClose} triggerButtonClass = "section-button" articleWrapClass = "articlewrap"
                             openClassClass =  "section open" closeClass = "section" toggleDisabled={(service.serviceStatus >= this.props.serviceStatusMap.assetsProvided)? "accordion_enabled" : "accordion_disabled"}>

                        <div className="ant-modal-x">
                            <div className="ant-modal-content-x" style={{boxShadow : 'none !important'}}>
                                <div className="ant-modal-body-x">
                                    <Row>
                                        <Col span={24}>
                                            <h4 style={{fontWeight: '700'}}>Service Package(s)</h4>
                                        </Col>
                                    </Row>
                                    <br/>
                                    <Row  id= 'ed_packages' style={{marginBottom: '20px'}}>
                                        <Row style={{marginBottom: '15px'}}>
                                            <div className="ant-col-24 row-no-btm">
                                                <div className="ant-row">
                                                    <h6>
                                                        Provide pricing packages for your service offering. <br/>
                                                        You can take advantage of all the available packages so as to provide customers with flexible pricing options.
                                                    </h6>
                                                </div>
                                            </div>
                                        </Row>
                                        <Row gutter={16}>
                                            <h6 className= "h3-label packOptGroup">
                                                <Col span={24} style={this.state.listStyle}>
                                                    Packages &nbsp;
                                                    <Switch size="default" checkedChildren="3" unCheckedChildren="1"  checked = {this.state.allPackageSelected} onChange={this.allPackageTypeChanged}/>
                                                </Col>
                                            </h6>
                                        </Row>
                                        <Row gutter={16}>
                                            <section id="pricePlans">
                                                <ul id="plans">
                                                    {
                                                        packagesUsed.map( (r) =>
                                                        {
                                                            return <li className={"plan " + r.packageType.className + "-border"} key={r.packageType._id}>
                                                                <ul className="planContainer">
                                                                    <li className={"package " + r.packageType.className}><h3>{r.packageType.name}</h3></li>
                                                                    <li className="padding-4">
                                                                        <ul className="options">
                                                                            <li>
                                                                                <div className="styled-input wide">
                                                                                    <textarea required className="ant-input ant-input-lg input-no-border-2" name="description" rows={4} onChange={(e) => this.packageInputChanged(e, r)} value={r.description}>{r.description}</textarea>
                                                                                    <label>Description *</label>
                                                                                    <span></span>
                                                                                </div>
                                                                            </li>
                                                                            {r.features.map( (f) =>
                                                                            {
                                                                                if(f.featureType.toLowerCase() === 'checkbox')
                                                                                {
                                                                                    return  <li key={f._id}>
                                                                                        <Col span={24} className="bottom-border container-pad">
                                                                                            {f.title} &nbsp;<span><Checkbox checked = {f.feature.length > 0} value={f._id} onChange={(e) => this.packageFeatureCheckChanged(e, f._id, r.packageType._id)}>
                                                                                            </Checkbox></span>
                                                                                        </Col>
                                                                                    </li>
                                                                                }else if(f.featureType.toLowerCase() === 'number')
                                                                                    {
                                                                                       return <li key={f._id}>
                                                                                           <div className="styled-input">
                                                                                               <input className="bottom-border" name="title" type="number" required onChange={(e) => this.packageFeatureInputChanged(e, r, f)} value={f.value}/>
                                                                                                <label>{f.title}</label>
                                                                                               <span></span>
                                                                                           </div>
                                                                                       </li>
                                                                                    }
                                                                                else if(f.featureType.toLowerCase() === 'dropdown')
                                                                                {
                                                                                    return  <li key={f._id}>
                                                                                        <Select
                                                                                            showSearch
                                                                                            style={{width: '100%'}}
                                                                                            className="input-no-border-2"
                                                                                            placeholder="- select -"
                                                                                            optionFilterProp="children"
                                                                                            value={(f.value !== '0' && f.value !== 0 && (parseInt(f.value) > 0 || f.value.length > 0))? parseInt(f.value) : "- " + f.title + " -"}
                                                                                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                                                            onChange={(val) => this.featureOptionChanged(val, r, f)}>
                                                                                            {f.featureOptions.map(cn => <Option value={cn.value} key={cn.value}>{cn.name}</Option>)}
                                                                                        </Select>
                                                                                    </li>
                                                                                }
                                                                            })}
                                                                        </ul>
                                                                    </li>
                                                                    <li className="sides-pad">
                                                                        <Col span={24}>
                                                                            <div className="styled-input">
                                                                                <input className="bottom-border" name="delivery" type="number" required onChange={(e) => this.packageInputChanged(e, r)}
                                                                                       value={r.delivery}/>
                                                                                <label>Delivery (Days) *</label>
                                                                                <span></span>
                                                                            </div>
                                                                        </Col>
                                                                    </li>
                                                                    <li className="price">
                                                                        <Col span={24} className="styled-input" style={{marginBottom:'8px'}}>
                                                                            <input className="ant-input ant-input-lg input-no-border-price" name="price" type="number" required onChange={(e) => this.packageInputChanged(e, r)}
                                                                                   value={r.price}/>
                                                                            <label>Price *</label>
                                                                            <span></span>
                                                                        </Col>
                                                                    </li>
                                                                </ul>
                                                            </li>
                                                        }
                                                    )}
                                                </ul>
                                            </section>
                                        </Row>
                                    </Row>
                                </div>
                                <Row gutter={2} className="ant-modal-footer-x">
                                    <Col span={11}>
                                        <button className="cancel cancel-padding-1 ant-btn" style={{width: 'auto', float: 'left'}} onClick={() => closeAction(returnServiceView)}>
                                            Cancel
                                        </button>
                                    </Col>
                                    <Col span={1}>
                                    </Col>
                                    <Col span={11}>
                                        <button className="join-us join-us-padding-1 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: 'auto', float: 'left', marginRight: '5px'}} onClick={this.processPackages}>
                                            Continue
                                        </button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Section>
                    <Section activeTarget={activeTarget} activeLevel={activeLevel} name="srv_go" title="Start selling" level="1" titleClass = "sectionHead"
                             triggerClose = {this.triggerClose} triggerButtonClass = "section-button" articleWrapClass = "articlewrap"
                             openClassClass = "section open" closeClass = "section" toggleDisabled={(service.serviceStatus >= this.props.serviceStatusMap.packagesProvided)? "accordion_enabled" : "accordion_disabled"}>
                        <div className="ant-modal-x">
                            <div className="ant-modal-content-x" style={{boxShadow : 'none !important'}}>
                                <div className="ant-modal-body-x">
                                    <Row  id= 'ed_packages' style={{marginBottom: '20px'}}>
                                        <Row style={{marginBottom: '15px'}}>
                                            <div className="ant-col-24 row-no-btm">
                                                <div className="ant-row">
                                                    <h6><b>Recap:</b>&nbsp;Carefully review your offering before taking it online</h6>
                                                    <h6>Click the <b>{(service.serviceStatus <= serviceStatusMap.packagesProvided)? 'Go' : 'Update'}</b> button when ready to get customers calling.</h6>
                                                </div>
                                            </div>
                                        </Row>
                                        {
                                            (geek.phoneNumberConfirmed !== undefined && geek.phoneNumberConfirmed !== null && geek.phoneNumberConfirmed === true)? '' :

                                                (confirmationCodeSent === undefined || confirmationCodeSent === null || confirmationCodeSent === false)?

                                                    <Row gutter={2}>
                                                        <Col span={24}>
                                                            <div className="ant-row">
                                                                <h6>One more step before we can proceed. We need to confirm your phone number...</h6>
                                                            </div>
                                                        </Col>
                                                        <br/><br/><br/><br/>
                                                        <Col xs={24} sm={12} md={10} lg={10} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                                            <div className="ant-row row-no-btm">
                                                                <div className="form-group ant-col-21">
                                                                    <input className="f-control" id="phone" onFocus={() => this.toggleFocus('callSend', 'iFocus')} onBlur={() => this.toggleFocus('callSend', 'iFocus')} type="text" required onChange={this.setPhone} value={phone}/>
                                                                    <label className="f-control-placeholder" htmlFor="phone">Your phone number *</label>
                                                                </div>
                                                                <div className="ant-col-3">
                                                                    <a style={{color: '#21ba45'}} onClick={this.verifyPhone}>
                                                                        <i className="md-icon material-icons callSend">
                                                                            send
                                                                        </i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    :

                                                    <Row>
                                                        <Row gutter={2}>
                                                            <Col xs={24} sm={12} md={10} lg={10} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                                                <div className="ant-row row-no-btm">
                                                                    <div className="form-group ant-col-21">
                                                                        <input style={{marginTop: '15px !important'}} className="f-control top-x" id="confirmationCode" type="text" required onChange={this.setCode} value={confirmationCode}/>
                                                                        <label className="f-control-placeholder" htmlFor="confirmationCode">Enter code here *</label>
                                                                    </div>
                                                                    <div className="ant-col-3">
                                                                        <button onClick={this.verifyCode} className="join-us join-us-padding-1 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: 'auto', float: 'left', marginRight: '5px'}}>
                                                                            OK
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                        <Row gutter={2}>
                                                            <div className="ant-col-24" style={{marginTop: '-10px'}}>
                                                                {
                                                                    countdown > 0 ?
                                                                        <div className="ant-col-6">
                                                                            <h4 style={{fontSize: '17px', fontWeight: 'bold', color: '#757575'}}>{countdown}</h4>
                                                                        </div>
                                                                        :
                                                                        ''
                                                                }
                                                                <div className="ant-col-18">
                                                                    <a style={{color: '#21ba45'}} onClick={this.resendCode}>
                                                                        <i onClick={this.resendCode} className="md-icon material-icons" style={{fontSize: '17px', fontWeight: 'bold', position: 'absolute', color: '#21ba45'}}>
                                                                            refresh
                                                                        </i> &nbsp; &nbsp;
                                                                        resend code
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </Row>
                                                    </Row>
                                        }
                                    </Row>
                                </div>
                                <Row gutter={2} className="ant-modal-footer-x">
                                    <Col span={11}>
                                        <button className="cancel cancel-padding-1 ant-btn" style={{width: 'auto', float: 'left'}} onClick={() => closeAction(returnServiceView)}>
                                            Cancel
                                        </button>
                                    </Col>
                                    <Col span={1}>
                                    </Col>
                                    <Col span={11}>
                                        <button className="join-us join-us-padding-1 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: 'auto', float: 'left', marginRight: '5px'}} onClick={this.publish}>
                                            Submit
                                        </button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
            )
    }
}