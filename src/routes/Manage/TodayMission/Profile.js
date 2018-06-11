import { Component } from 'react'
import styles from './Profile.less'
import patientInfo from '../../../assets/patient.png'
import { Select, DatePicker, Table, Input, Button, Breadcrumb, Form, message } from 'antd';
import { connect } from 'dva'

import PlanMenu from 'components/PlanMenu'
import Modal from 'components/Modal'
import PopoverSure from 'components/PopoverSure'
import EditDateCell from 'components/EditTableCell/EditDateCell.js'
import EditSelectCell from 'components/EditTableCell/EditSelectCell.js'

const Option = Select.Option;
const { TextArea } = Input;
const FormItem = Form.Item

const statusDom = (text, record) => {
	switch(text.status){
		case 'COMPLETE':
			return (
				<span >
					<span className={`${styles.status} ${styles.grey}`}></span>
					<span className={styles.statusText}>已随访</span>
				</span>
			)
		case 'OVERDUE':
			return (
				<span >
					<span className={`${styles.status} ${styles.red}`}></span>
					<span className={styles.statusText}>随访逾期</span>
				</span>
			)
		case 'WAIT':
			return (
				<span >
					<span className={`${styles.status} ${styles.green}`}></span>
					<span className={styles.statusText}>待随访</span>
				</span>
			)
		case 'NO_START':
			return (
				<span >
					<span className={`${styles.status} ${styles.yellow}`}></span>
					<span className={styles.statusText}>时间未到</span>
				</span>
			)
		default :
			return (
				<span >
					<span className={`${styles.status}`}></span>
					<span className={styles.statusText}>未知</span>
				</span>
			)
	}
		
}


@Form.create()
class MissionProfile extends Component {
	state = {
		dataSource: [{
			key: '1',
			status: 'yisuifang',
			date: '2017-10-10',
			way: '到院复查',
			table: '肝胆外科随访登记表'
		},{
			key: '2',
			status: 'yuqi',
			date: '2017-10-10',
			way: '到院复查',
			table: '肝胆外科随访登记表'
		},{
			key: '3',
			status: 'daisuifang',
			date: '2017-10-10',
			way: '到院复查',
			table: '肝胆外科随访登记表'
		},{
			key: '4',
			status: 'weidao',
			date: '2017-10-10',
			way: '到院复查',
			table: '肝胆外科随访登记表'
		}],
		planTaskList: [],
		status: '',
		editPlanShow: false,
		stopPlanShow: false,
		conclusionShow: false,
		medicineShow: false,
		inhospitalId: this.props.match.params.id,
		scaleId: this.props.match.params.scaleId,
		medicineSquareTime: '',
		medicineResident: '',
		stopReason: '',
		stopDes: '',
		choosedPlanId: ''
	}
	

	
	changeId=(id)=>{
		this.setState({
			status: id
		})
	}
	showConclusion=()=>{
		this.setState({
			conclusionShow: true
		})
	}
	hideConclusion=()=>{
		this.setState({
			conclusionShow: false
		})
	}
	showMedicine=()=>{
		this.setState({
			medicineShow: true
		})
	}
	hideMedicine=()=>{
		this.setState({
			medicineShow: false
		})
	}
	showEditPlan=()=>{
		this.setState({
			editPlanShow: true
		})
	}
	hideEditPlan=()=>{
		this.setState({
			editPlanShow: false
		})
	}
	showStopPlan=()=>{
		this.setState({
			stopPlanShow: true
		})
	}
	hideStopPlan=()=>{
		this.setState({
			stopPlanShow: false
		})
	}
	handleAdd = () => {
	    const { dataSource } = this.state;
	    const newData = {
			key: dataSource.length+1,
			status: '',
			date: '',
			way: '',
			table: ''
	    };
	    this.setState({
	      	dataSource: [...dataSource, newData]
	    });
  	}
  	deletePlan = (record) => {
  		if(record.status!='yisuifang'){
  			const dataSource = [...this.state.dataSource];
			this.setState({ dataSource: dataSource.filter(item => item.key !== record.key) });
  		}else{
  			return
  		}
		
	}

	stopPlan = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if(!err){
				console.log('wwww', values)
				const param = {
					planId: this.props.patientDetail.todayDetail.tasks[0].planId,
					reason: values.reason,
					description: values.desc
				}
				console.log(param)
				this.props.dispatch({
					type: 'patientDetail/stopPlan',
					payload: param
				}).then(()=>{
					this.setState({
						stopReason: values.reason,
						stopDes: values.desc,
						stopPlanShow: false
					})
					message.success('结案成功！')
				})
			}
		})

	}

	onCellChange = (key, dataIndex) => {
		console.log(key,'key')
	    return (value) => {
	    	console.log(value,'value')
	      	const planTaskList = [...this.state.planTaskList];
	     	const target = planTaskList.find((item,index) => index === key);
	      	if (target) {
		        target[dataIndex] = value;
		        console.log(planTaskList,'planTaskListplanTaskList')
		        this.setState({ planTaskList },()=>{
		        	console.log(this.state.planTaskList,'planTaskList')
		        });
	      	}
	    };
  	}

  	planChange = (value) => {
  		this.setState({
  			choosedPlanId: value
  		})
  		this.props.dispatch({
  			type: 'patientDetail/getPlanTask',
  			payload: {
  				planTemplateId: value,
  				dischargeTime: this.props.patientDetail.todayDetail.dischargeTime
  			}
  		}).then(()=>{
  			let list = [...this.props.patientDetail.PlanTaskList]
			list.forEach(item=>{
				item.scaleId = {
					key: item.scaleId,
					label: item.scaleName
				}
			})
  			this.setState({
  				planTaskList: list
  			})
  		})
  	}

  	savePlanTask = () => {
  		console.log(this.state.planTaskList)

  	}

  	cancelPlanTask = () => {
  		let list = [...this.props.patientDetail.todayDetail.tasks]
		list.forEach(item=>{
			item.scaleId = {
				key: item.scaleId,
				label: item.scaleName
			}
		})
		this.setState({
			planTaskList: list,
			choosedPlanId: this.props.patientDetail.todayDetail.planId
		})
  		this.setState({

  		})
  		this.hideEditPlan()
  	}

  	hideIdCard=(id)=>{
		if(!id){
			return
		}
		if(id.length==18){
			return String(id).replace(String(id).substr(4,10),'**********')
		}else if(id.length==15){
			return String(id).replace(String(id).substr(4,7),'*******')
		}else{
			return id
		}
	}

  	componentDidMount( ){
  		this.props.dispatch({
			type: 'global/fetchDict'
		})
  		this.props.dispatch({
  			type: 'patientDetail/fetchSummary',
  			payload: this.state.inhospitalId
  		})
  		this.props.dispatch({
  			type: 'patientDetail/fetchMedicine',
  			payload: this.state.inhospitalId
  		}).then(()=>{
  			if(this.props.patientDetail.outMedicine.length>0){
  				this.setState({
					medicineSquareTime: this.props.patientDetail.outMedicine[0].squareTime,
					medicineResident: this.props.patientDetail.outMedicine[0].resident
				})
  			}else{
  				this.setState({
					medicineSquareTime: '暂无',
					medicineResident: '暂无'
				})
  			}
  			
  		})
  		this.props.dispatch({
  			type: 'plan/fetchPlanTwoList'
  		})
  		this.props.dispatch({
  			type: 'scale/fetchScaleList',
  			payload: {
  				title: ''
  			}
  		})
		this.props.dispatch({
			type: 'patientDetail/fetchToday',
			payload: {
				inhospitalId: this.state.inhospitalId,
				scaleId: this.state.scaleId
			}
		}).then(()=>{
			let list = [...this.props.patientDetail.todayDetail.tasks]
			list.forEach(item=>{
				item.scaleId = {
					key: item.scaleId,
					label: item.scaleName
				}
			})
			const status = this.props.patientDetail.todayDetail.tasks[0].taskId
			this.setState({
				status:status,
				planTaskList: list,
				choosedPlanId: this.props.patientDetail.todayDetail.planId
			})
		})
		
	}

	render(){
		const { 
			isSummaryShow,
			status, 
			editPlanShow, 
			dataSource, 
			stopPlanShow, 
			conclusionShow, 
			medicineShow, 
			medicineSquareTime,
			medicineResident,
			stopReason,
			stopDes,
			planTaskList,
			choosedPlanId
		} = this.state
		const {
			todayDetail,
			outSummary,
			outMedicine
		} = this.props.patientDetail

		const {dictionary} = this.props.global

		const {planTwoList} = this.props.plan

		const {scaleList} = this.props.scale

		const {
			getFieldDecorator
		} = this.props.form

		const columns = [{
			title: '随访状态',
			key: 'status',
			render: (text, record) => statusDom(text, record)
		},{
			title: '随访日期',
			width: '150px',
			dataIndex: 'followTime',
			key: 'followTime',
			render: (text, record, key) => (
				record.status!='COMPLETE'&&record.status!='OVERDUE'?
				<EditDateCell value={text} onChange={this.onCellChange(key, 'followTime')}></EditDateCell>
				:
				<span>{text}</span>
			)
		},{
			title: '随访方式',
			width: '150px',
			dataIndex: 'returnType',
			key: 'returnType',
			render: (text, record, key) => (
				record.status!='COMPLETE'&&record.status!='OVERDUE'?
				<EditSelectCell dataSource={dictionary['RETURN_WAY']} 
					value={text} allowClear={false} labelInValue={false}
					onChange={this.onCellChange(key, 'returnType')}
					valueType={{code:'code',value: 'value'}}
					styleObj={{ width: 140 }} >

				</EditSelectCell>
				:
				<span>
					{dictionary['RETURN_WAY']?dictionary['RETURN_WAY'].map(item=>(
						text==item.code?item.value:''
                    )):''}
				</span>
			)
		},{
			title: '量表选择',
			dataIndex: 'scaleId',
			width: '190px',
			key: 'scaleId',
			render: (text, record, key) => (
				record.status!='COMPLETE'&&record.status!='OVERDUE'?
				<EditSelectCell dataSource={scaleList} 
					value={text} allowClear={true} labelInValue={true}
					onChange={this.onCellChange(key, 'scaleId')}
					valueType={{code:'scaleId',value: 'title'}}
					styleObj={{ width: 180 }}>

				</EditSelectCell>
				:
				<span>{text.label}</span>
			)
		},{
			title: '操作',
			key: 'action',
			width: '80px',
			render: (text, record) => (
				record.status!='COMPLETE'?
				<PopoverSure title="您确定要删除该表格吗？"
					text="目标删除后将不可恢复。"
					sureFunction={()=>this.deletePlan(record)}>
					<span className="delLink">删除</span>
				</PopoverSure>
				:
				<span className="delLink">删除</span>
			)
		}]   
		const columns2 = [{
			title: '药品名称',
			dataIndex: 'drugsName',
			key: 'drugsName'
		},{
			title: '药品规格',
			dataIndex: 'drugSpecifications',
			key: 'drugSpecifications'
		},{
			title: '药品数量',
			dataIndex: 'amount',
			key: 'amount',
			render: (text, record) => (
				<span>{record.number+record.unit}</span>
			)
		},{
			title: '用法用量',
			dataIndex: 'usage',
			key: 'usage'
		}]
		return (
			<div>
				<div className={styles.contentWrap}>
					<Breadcrumb separator=">">
					    <Breadcrumb.Item>随访管理</Breadcrumb.Item>
					    <Breadcrumb.Item href="">今日任务</Breadcrumb.Item>
					    <Breadcrumb.Item>开始随访</Breadcrumb.Item>
				  	</Breadcrumb>
					<div className={`${styles.patientInfo} clearfix`}>
						<div className={styles.infoWrap}>
							<div className={styles.img}>
								<img src={patientInfo} alt="头像"/>
							</div>
							<div className={styles.info}>
								<div className={styles.infoItemWrap}>
									<div className={styles.infoItem}>
										<span className={styles.basicInfo}>{todayDetail.patientName}</span>
										<span className={styles.basicInfo}>{todayDetail.sex}</span>
										<span className={styles.basicInfo}>{todayDetail.age}岁</span>
									</div>
									<div className={styles.infoItem}>
										<span className={styles.label}>身份证号：</span>
										<span className={styles.text}>{this.hideIdCard(todayDetail.cardNo)}</span>
									</div>
								</div>
								<div className={styles.infoItemWrap}>									
									<div className={styles.infoItem}>
										<span className={styles.label}>联系人：</span>
										<span className={styles.text}>{todayDetail.patientRelationship} {todayDetail.contactPeople}</span>
									</div>
									<div className={styles.infoItem}>
										<span className={styles.label}>费用类型：</span>
										<span className={styles.text}>{todayDetail.costType}</span>
									</div>
									
								</div>
								<div className={styles.infoItemWrap}>
									<div className={styles.infoItem}>
										<span className={styles.label}>联系电话：</span>
										<span className={styles.text}>{todayDetail.contactPhone}</span>
									</div>
									<div className={styles.infoItem}>
										<span className={styles.label}>家庭住址：</span>
										<span className={`${styles.text} text-hidden`}>{todayDetail.contactAddress}</span>
									</div>
								</div>
							</div>
						</div>
						<div className={styles.call}>
							<i className={`iconfont icon-red_phone ${styles.callIcon}`}></i>
							<div className={styles.text}>拨打电话</div>
						</div>
					</div>
					<div className={styles.mainInfoWrap}>
						<div className={styles.overFlow}>
							<div className={styles.menuList}>
								<div className={styles.specialItem}>
									<div className={styles.menuItem}>
										<i className={`iconfont icon-suifangjihuaicon ${styles.itemIcon}`}></i>
										<div className={styles.content}>
											<div className={styles.itemTitle}>
												随访计划
											</div>
											<div className={styles.info}>
												{todayDetail.planTitle}
											</div>
											<div className={`${styles.btnItem} aLink`} onClick={this.showEditPlan}>
												<i className={`iconfont icon-grey_bianji`}></i><span>编辑计划</span>
											</div>
											<div className={`${styles.btnItem} aLink`} onClick={this.showStopPlan}>
												<i className={`iconfont icon-jieshu`}></i><span>手动结案</span>
											</div>
										</div>
									</div>
									
								</div>
								<PlanMenu listData={todayDetail.tasks} status={status} changeStatus={this.changeId}></PlanMenu>
							</div>
							<div className={styles.mainInfo}>
								<div className={styles.info}>
									<div className={styles.title}>
										<i className={`iconfont icon-tongyongbiaotiicon ${styles.titleIcon}`}></i><span>患者信息</span>
									</div>
									<div className={styles.content}>
										<div className={styles.line}>
											<div className={styles.infoItem}>
												<span className={styles.label}>住院科室：</span>
												<span className={`${styles.text} text-hidden`}>{todayDetail.hospitalizationDepartment}</span>
											</div>
											<div className={styles.infoItem}>
												<span className={styles.label}>主管医生：</span>
												<span className={styles.text}>{todayDetail.resident}</span>
											</div>
											<div className={styles.infoItem}>
												<span className={styles.label}>出院诊断：</span>
												<span className={`${styles.text} text-hidden`}>{todayDetail.dischargeDiagnosis}</span>
											</div>
										</div>
										<div className={styles.line}>
											<div className={styles.infoItem}>
												<span className={styles.label}>病区：</span>
												<span className={styles.text}>{todayDetail.wards}</span>
											</div>
											<div className={styles.infoItem}>
												<span className={styles.label}>转归情况：</span>
												<span className={`${styles.text} text-hidden`}>{todayDetail.physicalCondition}</span>
											</div>
											<div className={styles.infoItem}>
												<span className={styles.label}>出院小结：</span>
												<span className={`${styles.text} aLink`} onClick={this.showConclusion}>点击查看</span>
											</div>
										</div>
										<div className={styles.line}>
											<div className={styles.infoItem}>
												<span className={styles.label}>床号：</span>
												<span className={styles.text}>{todayDetail.bedNumber}</span>
											</div>
											<div className={styles.infoItem}>
												<span className={styles.label}>出院日期：</span>
												<span className={styles.text}>{todayDetail.dischargeTime}</span>
											</div>
											<div className={styles.infoItem}>
												<span className={styles.label}>出院带药：</span>
												<span className={`${styles.text} aLink`} onClick={this.showMedicine}>点击查看</span>
											</div>					
										</div>
										<div className={styles.line}>
												<div className={styles.infoItem}>
													<span className={styles.label}>住院号：</span>
													<span className={styles.text}>{todayDetail.inhospitalId}</span>
												</div>
												<div className={styles.infoItem}>
													<span className={styles.label}>住院天数：</span>
													<span className={styles.text}>{todayDetail.hospitalizationDays}天</span>
												</div>
										</div>
									</div>
								</div>
								<div>
									status：{status}
								</div>
							</div>
							<Modal title="编辑随访计划" closable={false} visible={editPlanShow} onCancel={this.hideEditPlan}>
								<div className={styles.planName}>
									<span className={styles.label}>计划模板</span>
									<Select placeholder="请选择" style={{ width: 270 }}
										value={choosedPlanId}
										onChange={this.planChange}>
								      	{
								      		planTwoList.map(item => (
									      		<Option key={item.planTemplateId} value={item.planTemplateId}>{item.title}</Option>
									      	))
					      				}
								    </Select>
								</div>
								<div className={styles.table}>
									<Table dataSource={planTaskList} columns={columns} pagination={false}
										rowKey="taskId"
										rowClassName={(record, index) => {
											return record.status
										}}/>
									<div className={`${styles.tableFooter} ${dataSource.length%2==0?styles.doubleTable:''}`}>
										<span className={styles.footerBtn} onClick={this.handleAdd}>
											<i className={`iconfont icon-tianjialiebiao_icon ${styles.tableIcon}`}></i><span>添加计划</span>
										</span>
									</div>
								</div>
								<div className={styles.tableBtn}>
									<Button type="primary" onClick={this.savePlanTask}>保存</Button>
									<Button onClick={this.cancelPlanTask}>取消</Button>								
								</div>
							</Modal>
							<Modal title="手动结案" closable={false} visible={stopPlanShow} type="small"
								 onCancel={this.hideStopPlan}>
								<Form onSubmit={this.stopPlan} layout="inline">
									<FormItem>
										<div className={styles.stopItem}>
											<span className={styles.label}>结案原因</span>
											{
												getFieldDecorator('reason',{
													initialValue: stopReason,
													rules: [{ required: true, message: '请输入备注原因！'}]
												})(
													<Select placeholder="请选择" style={{ width: 353 }}
														allowClear>
												      	{
												      		dictionary['SETTLE_CAUSE']?
														      	dictionary['SETTLE_CAUSE'].map(item => (
														      		<Option key={item.code} value={item.code}>{item.value}</Option>
														      	))
												      		:''
									      				}
												    </Select>
												)
											}
										</div>										
									</FormItem>
									<FormItem>
										<div className={styles.stopItem}>
											<span className={styles.label}>描述</span>
											{
												getFieldDecorator('desc',{
													initialValue: stopDes,
												})(
													<TextArea style={{ width: 353, height: 120 }} />
												)
											}
											
										</div>
									</FormItem>
									<div className={styles.stopText}>
										结案后，此患者后续随访将不会执行。
									</div>
									<div className={styles.stopBtn}>
										<Button type="primary" htmlType="submit">保存</Button>
										<Button onClick={this.hideStopPlan}>取消</Button>								
									</div>
								</Form>
							</Modal>
							<Modal title="出院小结" closable={true} visible={conclusionShow} onCancel={this.hideConclusion}>
								<div className={styles.conclusionTitle}>
									<div className={styles.titleItem}>
										<span className={styles.label}>病区：</span>
										<span className={styles.text}>{outSummary.wards}</span>
									</div>
									<div className={styles.titleItem}>
										<span className={styles.label}>床号：</span>
										<span className={styles.text}>{outSummary.bedNumber}</span>
									</div>
								</div>
								<div className={styles.conclusionContent}>
									<div>
										<div className={`${styles.item} ${styles.specialItem}`}>
											<span className={styles.label}>入院日期：</span>
											<span className={styles.text}>{outSummary.admittingTime}</span>
										</div>
										<div className={`${styles.item} ${styles.specialItem}`}>
											<span className={styles.label}>出院日期：</span>
											<span className={styles.text}>{outSummary.dischargeTime}</span>
										</div>
									</div>
									<div className={styles.item}>
										<span className={styles.label}>入院诊断：</span>
										<span className={styles.text}>{outSummary.admittingDiagnosis}</span>
									</div>
									<div className={styles.item}>
										<span className={styles.label}>出院诊断：</span>
										<span className={styles.text}>{outSummary.dischargeDiagnosis}</span>
									</div>
									<div className={styles.item}>
										<span className={styles.label}>入院情况：</span>
										<span className={styles.text}>{outSummary.admittingDescription}</span>
									</div>
									<div className={styles.item}>
										<span className={styles.label}>住院经过：</span>
										<span className={styles.text}>{outSummary.hospitalizationCourse}</span>
									</div>
									<div className={styles.item}>
										<span className={styles.label}>出院情况：</span>
										<span className={styles.text}>{outSummary.dischargeCondition}</span>
									</div>
									<div className={styles.item}>
										<span className={styles.label}>住院医嘱：</span>
										<span className={styles.text}>{outSummary.doctorAdvance}</span>
									</div>
									<div className={styles.sign}>
										签名：{outSummary.recordMember}
									</div>
								</div>
							</Modal>
							<Modal title="出院带药" closable={true} visible={medicineShow} onCancel={this.hideMedicine}>
								<div className={styles.medicineTitle}>
									<div className={styles.item}>
										<span className={styles.label}>开方时间：</span>
										<span className={styles.text}>{medicineSquareTime}</span>
									</div>
									<div className={styles.item}>
										<span className={styles.label}>医师：</span>
										<span className={styles.text}>{medicineResident}</span>
									</div>
								</div>
								<div className={styles.medicineContent}>
									<Table dataSource={outMedicine} columns={columns2} pagination={false}
										rowKey="incrementId"/>
								</div>
							</Modal>
						</div>

						
					</div>
				</div>
				
				
			</div>
		)
	}
}

export default connect(({ patientDetail, global, plan, scale }) => ({
  patientDetail, global, plan, scale
}))(MissionProfile);