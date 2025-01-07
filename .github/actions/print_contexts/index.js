const core = require('@actions/core');

function dotPrefix(prefix, key) {
	if(prefix === '') {
		return key;
	}
	return `${prefix}.${key}`;
}

function* iterEntriesInEnvFormat(obj, prefix = '') {
	if(!obj) {
		return;
	}
	for(const [key, value] of Object.entries(obj)) {
		const prefixedKey = dotPrefix(prefix, key);
		if(typeof value === 'object') {
			// recurse
			yield* iterEntriesInEnvFormat(value, prefixedKey);
		} else {
			yield [prefixedKey, JSON.stringify(value)];
		}
	}
}

async function main() {
	try {
		// get the format to print in
		const format = core.getInput('format') || 'json';
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
			if(format === 'json') {
				console.log(data)
			} else if(format === 'env') {
				for(const [key, value] of iterEntriesInEnvFormat(data)) {
					console.log(`${key}=${value}`);
				}
			} else {
				throw new Error(`Unsupported format: ${format}`);
			}
			console.log(spacer);
		}
	} catch(e) {
		core.setFailed(e.message);
	}
}

main()
