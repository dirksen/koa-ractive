var path = require('path')
var Ractive = require('Ractive')
var fs = require('fs')

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


module.exports = function (opts) {
	let base = opts.path;
	let partialsDir = opts.partialsPath || base + '/partials';
	let ext = opts.ext || '.mustache';
	let mainBodyPartialName = opts.mainBodyPartialName || 'mainbody';
	let ractiveOpts = opts.ractiveOpts || {};
	ractiveOpts.partials = {};

	// Register all partials
	fs.readdir(partialsDir, (err, files) => {
		if (!files) return
		files.forEach(file => {
			let name = path.basename(file, path.extname(file))
			let code = fs.readFileSync(partialsDir+'/'+file, 'utf8')
			ractiveOpts.partials[name] = code
		});
	})

	ractiveOpts.template = fs.readFileSync(`${base}/layout${ext}`, 'utf8');

	function render(tmpl, data) {
		path = base+'/'+tmpl+ext;
		ractiveOpts.partials[mainBodyPartialName] = fs.readFileSync(path, 'utf8');

		// Merge context locals with data
		ractiveOpts.data = merge(this.state || {}, data || {})

		var html = new Ractive(ractiveOpts).toHTML()
		this.body = html;
	}

	return async (ctx, next) => {
		ctx.render = render
		await next()
	}
}
