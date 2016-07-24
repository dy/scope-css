module.exports = scope;
scope.replace = replace;

function scope (css, parent) {
	if (!css) return css;

	if (!parent) return css;

	css = replace(css, parent + ' $1$2');

	//regexp.escape
	let parentRe = parent.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

	//replace self-selectors
	css = css.replace(new RegExp('(' + parentRe + ')\\s*\\1(?=[\\s\\r\\n,{])', 'g'), '$1');

	css = css.replace(new RegExp('(' + parentRe + ')\\s*:host', 'g'), '$1');

	return css;
}

function replace (css, replacer) {
	//strip block comments
	css = css.replace(/\/\*([\s\S]*?)\*\//g, '');

	return css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, replacer);
}
