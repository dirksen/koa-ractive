var path = require('path')
var Ractive = require('ractive')
var rcu = require('rcu/rcu.node')
var fs = require('fs')

rcu.init(Ractive)

/**
 * Shallow copy two objects into a new object
 *
 * Objects are merged from left to right. Thus, properties in objects further
 * to the right are preferred over those on the left.
 *
 * @param {object} obj1
 * @param {object} obj2
 * @returns {object}
 * @api private
 */

function merge (obj1, obj2) {
	var c = {},
		keys = Object.keys(obj2),
		i;

	for (i = 0; i !== keys.length; i++) {
		c[keys[i]] = obj2[keys[i]];
	}

	keys = Object.keys(obj1);
	for (i = 0; i !== keys.length; i++) {
		if (!c.hasOwnProperty(keys[i])) {
			c[keys[i]] = obj1[keys[i]];
		}
	}

	return c;
};


module.exports = function (directory, opts) {
	var base=directory

	function parser(path) {
		console.log(path)
		var template = { v:1, t:[] }
		try {
			template = rcu.parse(fs.readFileSync(path, 'utf8')).template
		} catch (e) { console.error(e) }
		return template
	}

	function render(path, data) {
		var url = base+'/'+path+'.ract'

		// Merge context locals with data
		data = merge(this.locals || {}, data || {})

		var html = new Ractive({
			template: parser(url),
			data: data
		}).toHTML()
		this.body = html;
	}

	return async (ctx, next) => {
		ctx.render = render
		await next()
	}
}
