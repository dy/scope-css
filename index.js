'use strict'

module.exports = scope
scope.replace = replace

var stripCommentsRE
try {
	// lookbehind RE (not supported by some browsers)
	stripCommentsRE = new RegExp('(?<!content:\\s*["\'](?:[^\\/]|\\/[^\*])*)\\/\\*([\\s\\S]*?)\\*\\/', 'gi')
} catch (e) {
	stripCommentsRE = /\/\*([\s\S]*?)\*\//gi
}

function scope (css, parent) {
	if (!css) return css

	if (!parent) return css

	css = replace(css, parent + ' $1$2')

	//regexp.escape
	var parentRe = parent.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

	//replace self-selectors
	css = css.replace(new RegExp('(' + parentRe + ')\\s*\\1(?=[\\s\\r\\n,{])', 'g'), '$1')

	//replace `:host` with parent
	css = css.replace(new RegExp('(' + parentRe + ')\\s*:host', 'g'), '$1')

	//revoke wrongly replaced @ statements, like @supports, @import, @media etc.
	css = css.replace(new RegExp('(' + parentRe + ')\\s*@', 'g'), '@')

	//revoke wrongly replaced :root blocks
	css = css.replace(new RegExp('(' + parentRe + ')\\s*:root', 'g'), ':root')

	return css
}

function replace (css, replacer) {
	css = css.replace(stripCommentsRE, '')

	return css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, replacer)
}


//helpers to escape unfoldable things in strings
function escape (str, arr) {
	//hide comments
	str = str.replace(/\/\*([^\*]|[\r\n]|(\*+([^\*\/]|[\r\n])))*\*+\//g, function (match) {
		return ' ___comment' + arr.push(match);
	});
	//Escape strings
	str = str.replace(/\'[^']*\'/g, function (match) {
		return ' ___string' + arr.push(match);
	});
	str = str.replace(/\"[^"]*\"/g, function (match) {
		return ' ___string' + arr.push(match);
	});

	return str;
}

function unescape (str, arr) {
	// unhide strings & comments
	for (var i = arr.length; i--;) {
		str = str.replace(' ___string' + (i + 1), arr[i]);
		str = str.replace(' ___comment' + (i + 1), arr[i]);
	}

	return str;
}
