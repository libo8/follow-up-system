import { PureComponent } from 'react'
import QuestionnairContent from './QuestionnairContent'
import QuestionnairEditor from './QuestionnairEditor'
import QuestionnairSiderbar from './QuestionnairSiderbar'
import DragSort from '../DragSort'
import ShakeTransition from 'components/Shake'
import Input from 'components/Input'
import { message, Alert } from 'antd';
import uuid from 'utils/utils'
import { connect } from 'dva'

import styles from './index.less'

class Questionnair extends PureComponent {
	constructor(props) {
		super(props)
		this.editorsEl = [];
		this.scaleId = '';
		this.sign = false;
	}

    state = {
    	editors: [],
    	questionnairTitle: '',
    	curMoveItem: null,
    	drag: false,
    	scrollTo: 0,
    	newEditor: true
    }

    componentDidMount() {
    	if(this.props.search) {
    		const id = this.props.search.replace('?id=', '')
    		//props改变重新render一次，调用setState又重新渲染一次
			this.props.dispatch({
	        	type: 'scale/getScale',
	        	payload: id
	        }).then(() => {
	        	const { questions, title, scaleId, sign } = this.props.scale.scaleInfo;
	        	this.scaleId = scaleId;
	        	this.sign = sign;
	        	this.setState({
	        		editors: questions,
	        		questionnairTitle: title
	        	})
	        })
    	}
    }

    updateEditors = (type) => {
    	if(this.state.questionnairTitle==''){
    		message.error('请输入模板标题！')
    		return
    	}
    	this.state.editors.some((data, index) => {
    		if(data.isFirst && data.isEditor) {
    			this.state.editors.splice(index, 1)
    			return true;
    		}else if(!data.isFirst && data.isEditor){
				data.isEditor = false;
				return true;
    		}
    	})
		this.props.dispatch({
        	type: 'scale/saveScale',
        	payload: {
        		questions: this.state.editors,
        		scaleId: this.scaleId,
        		title: this.state.questionnairTitle,
        		sign: this.sign
        	}
        }).then((a)=>{
        	this.scaleId = this.props.scale.scaleId;
        	if(type&&type==='remove'){
        		message.warning('删除成功！')
        	}else{
        		message.success('修改成功！')
        	}
		})
    }
    /* 
     * 判断是否有处于编辑状态的题目, activeEditorIndex // -1,没有处于编辑状态的题目
     * 如果有处于编辑状态的题目，则激活该编辑器抖动
     */
    isThereEditor = () => {
    	const activeEditorIndex = this.state.editors.findIndex(data => data.isEditor === true)
    	if(activeEditorIndex !== -1) {
			let editors = JSON.parse(JSON.stringify(this.state.editors));
			editors[activeEditorIndex].editorShake = uuid();
			this.setState({
	        	editors
	        })
			return true;
		}else {
			return false;
		}
    } 

	createEditor = (type) => {
		if(this.isThereEditor()) {
			return;
		}
		const editor = {
			questionId: uuid(), //id
			type: type, //类型
			title: '', //题目
        	required: false, //是否必填
        	remark: false, //是否有备注
	        remarkText: '', //备注内容
	        options: ['', ''], //选项(只有radio,checkbox,select有,其余尽量给个空数组)
	        rows: 1, //选项占的行数
	        textareaHeight: 3, //多行文本高度
	        maxLength: 50, //单行文本限制的字数
	        otherOption: false, //是否有其他选项
	        otherOptionForwards: '其他', //”其他“项文本(前)
	        otherOptionBackwards: '', //”其他“项文本(后)
	        completionForwards: '题目：', //填空题文本(前)
	        completionBackwards: '', //填空题文本(后)
            isEditor: true, //编辑状态还是已编辑状态
            isFirst: true, //是否是新创建的
            editorShake: ''
		}
		this.setState(prevState => ({
			editors: [...prevState.editors, editor],
		}))
	}
    
    dragEditor = (editors) => {
		this.setState({
			editors
		})
    }
    
    locateEditor = (index) => {
    	this.setState({
    		scrollTo: this.editorsEl[index].offsetTop
    	})
    }

    cancelEdit = (index) => {
        let editors = JSON.parse(JSON.stringify(this.state.editors));
        editors[index].isFirst ? editors.splice(index, 1) : editors[index].isEditor = false;
        this.setState({
        	editors
        })
    }
        
    confirmEdit = (index, newEditor) => {
    	let editors = JSON.parse(JSON.stringify(this.state.editors));
    	editors.splice(index, 1, newEditor);
    	this.setState({
    		editors
        }, () => {
			this.updateEditors();
        })
    }
    
    againEdit = (index) => {
    	if(this.isThereEditor()) {
			return;
		}
        let editors = JSON.parse(JSON.stringify(this.state.editors));
        editors[index].isEditor = true;
        this.setState({
       	    editors
        })
    }
    
    copyEdit = (index) => {
		let editors = JSON.parse(JSON.stringify(this.state.editors));
		const copyEditor = {...this.state.editors[index], questionId: uuid()};
    	editors.splice(index+1, 0, copyEditor);
    	this.setState({
       	    editors
        }, () => {
        	this.updateEditors();
        })
    }

    removeEdit = (index) => {
		let editors = JSON.parse(JSON.stringify(this.state.editors));
        editors.splice(index, 1)
        this.setState({
       	    editors
        }, () => {
        	this.updateEditors('remove');
        })
    }
    
    handleDragMove = (editors, from, to) => {
	    this.setState({
	      curMoveItem: to,
	      editors,
	      drag: true
	    })
	}

	handleDragEnd = ()=>{
	    this.setState({
	      curMoveItem: null,
	      drag: false
	    }, () => {
        	this.updateEditors();
        })
	}
    
    changeQuestionnairTitle = (e) => {
    	let value = e.target.value;
		this.setState({
			questionnairTitle: value
        })
    }
    
    handleSgin = (sign) => {
		this.sign = sign;
        this.updateEditors();
    }

	render() {
		const { editors, drag, editorShake, scrollTo, questionnairTitle } = this.state;
		//如果有编辑状态的题目则禁止拖动
		const hasEditor = editors.some(data => data.isEditor === true);
		const canDrag = hasEditor ? false : true;

		const isFirst = editors.length !== 0 && editors[editors.length - 1].isFirst
		const editorsEl = editors.map((editor, index) => {
	    	return (
	    		<div
	    		  className="drag-wrapper"
	    		  ref={el => this.editorsEl[index] = el}
	    		  key={editor.questionId}>
					<QuestionnairEditor
					  index={index}
					  curMoveItem={this.state.curMoveItem}
					  editor={editor}
					  drag={drag}
					  handleConfirm={this.confirmEdit}
				      handleCancel={this.cancelEdit}
				      handleEdit={this.againEdit}
				      handleRemove={this.removeEdit}
				      handleCopy={this.copyEdit}
				    />
			    </div>
	    	)
	    });
	    const titleEl = (
			<div className='title-inner'>
				<Input
					placeholder="模板标题"
                  value={questionnairTitle}
                  onChange={this.changeQuestionnairTitle}
                  onBlur={this.updateEditors}
                  style={{
                  	height: 45,
                  	borderColor: 'transparent',
                  	textAlign: 'center',
                  	fontSize: 18,
                  	color: '#666',
                  	fontFamily: 'PingFangSC-Medium'
                  }}
				  className={styles['title-input']} />
			</div>
	    );
		return (
			<div className={styles.questionnair}>
				<QuestionnairSiderbar 
				  selectEditor={this.createEditor}
				  onDragOutline={this.dragEditor}
				  onClickOutline={this.locateEditor}
				  editors={editors} 
				/>
				<QuestionnairContent
				  isFirst={isFirst}
                  scrollTo={scrollTo}
                  sign={this.sign}
                  onChangeSign={this.handleSgin}>
				    {titleEl}
				    {editorsEl.length !== 0 && (
						<DragSort
						  onDragEnd={this.handleDragEnd} 
			              onDragMove={this.handleDragMove}
			              draggable={canDrag} 
			              data={editors}>
					    	{editorsEl}
					    </DragSort>
				    )}
				</QuestionnairContent>
			</div>
		)
	}
}

export default connect(({ scale }) => ({
  scale
}))(Questionnair);