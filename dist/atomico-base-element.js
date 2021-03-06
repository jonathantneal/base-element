/**
 * Applies JSON.parse to extract the real value of an attribute from a string.
 * @param {string} value
 * @returns {(boolean|string|number|Object|Array)}
 **/
function parse(value) {
	return JSON.parse(value);
}

class Element extends HTMLElement {
	constructor() {
		super();
		/**@type {Object<string,any>} */
		this.props = {};
		/**@type {Promise} */
		this.mounted = new Promise(resolve => (this.mount = resolve));
		/**@type {Promise} */
		this.unmounted = new Promise(resolve => (this.unmount = resolve));
	}
	connectedCallback() {
		this.mount();
	}
	disconnectedCallback() {
		this.unmount();
	}
	attributeChangedCallback(name, oldValue, value) {
		if (oldValue == value) return;
		this.setProperty(name, value);
	}
	static get observedAttributes() {
		let observables = this.observables || {},
			attributes = [],
			/**
			 * @param {string} - add the setter and getter to the constructor prototype
			 */
			proxy = name => {
				Object.defineProperty(this.prototype, name, {
					set(value) {
						this.setProperty(name, value);
					},
					get() {
						return this.props[name];
					}
				});
			};
		for (let key in observables) {
			let attr = key.replace(/([A-Z])/g, "-$1").toLowerCase();
			attributes.push(attr);
			if (!(name in this.prototype)) proxy(key);
		}
		return attributes;
	}
	/**
	 * validate to `value`, and then deliver it to the` update` method.
	 * @param {name} name
	 * @param {*} value
	 */
	setProperty(name, value) {
		name = name.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());
		let { observables } = this.constructor,
			error,
			type = observables[name];
		try {
			if (typeof value == "string") {
				switch (type) {
					case Boolean:
						value = parse(value || "true") == true;
						break;
					case Number:
						value = Number(value);
						break;
					case Object:
					case Array:
						value = parse(value);
						break;
				}
			}
		} catch (e) {
			error = true;
		}
		if (!error && {}.toString.call(value) == `[object ${type.name}]`) {
			this.update({ [name]: value });
		} else {
			throw `the attribute [${name}] must be of the type [${type.name}]`;
		}
	}
	/**
	 * @param {Object<string,any>} props
	 */
	update(props) {}
}

export default Element;
//# sourceMappingURL=atomico-base-element.js.map
