import { PureComponent } from 'react'

import styles from './index.less'

class Radio extends PureComponent {

	handleChange = (e) => {
		const { onChange } = this.props;
		if(onChange) {
			onChange(e)
		}
	}

	render() {
		const { defaultChecked, value, name, label, style } = this.props;
		return (
			<label className="wowjoy-radio" style={style}>
				<input 
				  type="radio"
				  name={name}
				  value={value} 
				  defaultChecked={defaultChecked}
				  onChange={this.handleChange}
				  style={{ display: 'none' }}/>
				<span className="wowjoy-radio__inner"></span>
			    <span className="wowjoy-radio__text">{label}</span>
			</label>
		)
	}
}

export default Radio