
function indentStr(str, indent) {
	return ' '.repeat(indent) + str;
}

function toJsStringLines(val, indent) {
	if(typeof val !== 'object' || val === null) {
		// primitive
		if(typeof val === 'string') {
			return [`${JSON.stringify(val)}`];
		}
		return [`${val}`];
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


console.log(toJsStringLines({
	github: {
		x: '"',
		token: "***",
		job: "a",
		event: {
			after: "33056cacc32509a12d8f7134053ead35ae051e0c",
			base_ref: null,
			before: "315adc6d104f6e9737e011945b0d5e33d5cb1314",
			commits: {
				0: {
					author: {
						email: "goastler4@gmail.com"
					},
					tree_id: "8272e325b35d49c10a90627c4e64ee9557bc8afa"
				}
			}
		}
	}
}, 4).join('\n'))
