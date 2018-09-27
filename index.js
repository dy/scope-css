module.exports = scope;
scope.replace = replace;

function scope (css, parent, prefix) {
	if (!css) return css;

	if (!parent) return css;

	if (!prefix) prefix = 'p' + Math.random().toString(36).substring(7) + '-';

	css = replace(css, parent + ' $1$2');

	//regexp.escape
	var parentRe = parent.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

	//replace self-selectors
	css = css.replace(new RegExp('(' + parentRe + ')\\s*\\1(?=[\\s\\r\\n,{])', 'g'), '$1');

	//replace `:host` with parent
	css = css.replace(new RegExp('(' + parentRe + ')\\s*:host', 'g'), '$1');

	//revoke wrongly replaced @ statements, like @supports, @import, @media etc.
	css = css.replace(new RegExp('(' + parentRe + ')\\s*@', 'g'), '@');

	//revoke wrongly replaced :root blocks
	css = css.replace(new RegExp('(' + parentRe + ')\\s*:root', 'g'), ':root');

	//animations: prefix animation anmes
	var animations = [],
	    animationNameRe = /@keyframes\s+([a-zA-Z0-9_-]+)\s*{/g,
	    match;
	while ((match = animationNameRe.exec(css)) !== null) {
		if (animations.indexOf(match[1]) < 0)
			animations.push(match[1]);
	}
	animations.forEach(function (name) {
		var newName = prefix + name;
		css = css.replace(new RegExp('(@keyframes\\s+)' + name + '(\\s*{)', 'g'),
				  '$1' + newName + '$2');
		css = css.replace(new RegExp('(animation(?:-name)?\\s*:[^;]*\\s*)' + name + '([\\s;}])', 'g'),
				  '$1' + newName + '$2');
	});

	//animation: revoke wrongly replaced keyframes
	css = css.replace(new RegExp('(' + parentRe + ' )(\\s*(?:to|from|[+-]?(?:(?:\\.\\d+)|(?:\\d+(?:\\.\\d*)?))%))(?=[\\s\\r\\n,{])', 'g'),
			  '$2');

	return css;
}

function replace (css, replacer) {
	//strip block comments
	css = css.replace(/\/\*([\s\S]*?)\*\//g, '');

	return css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, replacer);
}
