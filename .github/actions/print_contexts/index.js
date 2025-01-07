const core = require('@actions/core');

function dotPrefix(prefix, key) {
	if(prefix === '') {
		return key;
	}
	return `${prefix}.${key}`;
}

function* iterEntries(obj, prefix = '') {
	if(!obj) {
		return;
	}
	for(const [key, value] of Object.entries(obj)) {
		const prefixedKey = dotPrefix(prefix, key);
		if(typeof value === 'object') {
			// recurse
			yield* iterEntries(value, prefixedKey);
		} else {
			yield [prefixedKey, JSON.stringify(value)];
		}
	}
}

async function main() {
	try {
		// get the inputs
		const names = [
			'github',
			'env',
			'vars',
			'job',
			'steps',
			'runner',
			'secrets',
			'strategy',
			'matrix',
			'needs',
			'inputs',
		]
		const spacer = '----------------------------------------';
		for(const name of names) {
			const data = JSON.parse(core.getInput(name));
			console.log(`${name}:`);
			console.log(spacer);
			for(const [key, value] of iterEntries(data)) {
				console.log(`${key}=${value}`);
			}
			console.log(spacer);
		}
	} catch(e) {
		core.setFailed(e.message);
	}
}

main()
