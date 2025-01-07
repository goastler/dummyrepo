
function indentStr(str, indent) {
	return ' '.repeat(indent) + str;
}

const newline = '\n'

function indentLines(lines, indent) {
	return lines.map(line => indentStr(line, indent));
}

function toJsStringLines(val, indent) {
	if(typeof val !== 'object' || val === null) {
		// primitive
		return [String(val)]
	}
	const lines = []
	const isArr = Array.isArray(val);
	if(isArr) {
		if(val.length === 0) {
			return ['[]'];
		}
		lines.push('[');
		for(let i = 0; i < val.length; i++) {
			const subLines = toJsStringLines(val[i], indent)
			for(let j = 0; j < subLines.length; j++) {
				subLines[j] = indentStr(subLines[j], indent);
			}
			if(i !== val.length - 1) {
				subLines[subLines.length - 1] += ',';
			}
			lines.push(...subLines);
		}
		lines.push(']');
	} else {
		const entries = Object.entries(val);
		if(entries.length === 0) {
			return ['{}'];
		}
		lines.push('{');
		for(let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			const key = entry[0];
			const value = entry[1];
			const subLines = toJsStringLines(value, indent);
			for(let j = 0; j < subLines.length; j++) {
				if(j === 0) {
					subLines[j] = `${key}: ${subLines[j]}`;
				}
				subLines[j] = indentStr(subLines[j], indent);
			}
			if(i !== entries.length - 1) {
				subLines[subLines.length - 1] += ',';
			}
			lines.push(...subLines)
		}
		lines.push('}');
	}
	return lines
}

// console.log(toJsStringLines([1,2,3], 4).join('\n'));
// console.log(toJsStringLines({a: 1, b: 2, c: 3}, 4).join('\n'));
console.log(toJsStringLines({
	a: 1,
	b: [1,2,3],
	c: {
		d: 4,
		e: [{
			f: 5
		}, {
			g: 6
		}]
	},
	h: [],
	i: {},
}, 4).join('\n'));
