module.exports = scope;
scope.replace = replace;

function scope (css, parent) {
	if (!parent) return css;

	css = replace(css, parent + ' $1$2');

	//replace self-selectors
	css = css.replace(new RegExp('(' + parent + ') \\1(?=[\\s\\r\\n,{])', 'g'), '$1');
	css = css.replace(new RegExp('(' + parent + ') :host', 'g'), '$1');

	return css;
}

function replace (css, replacer) {
	return css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, replacer);
}
