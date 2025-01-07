const core = require('@actions/core');

function dotPrefix(prefix, key) {
	if(prefix === '') {
		return key;
	}
	return `${prefix}.${key}`;
}

function* iterEntriesInEnvFormat(obj, secret, prefix = '') {
	if(!obj) {
		return;
	}
	for(const [key, value] of Object.entries(obj)) {
		const prefixedKey = dotPrefix(prefix, key);
		if(typeof value === 'object') {
			// recurse
			yield* iterEntriesInEnvFormat(value, secret, prefixedKey);
		} else {
			if(secret) {
				yield [prefixedKey, '<secret>'];
			}
			yield [prefixedKey, JSON.stringify(value)];
		}
	}
}

function entriesInJsonFormat(obj, name) {
	if(name === 'secrets') {
		// redact secrets
		for(const key of Object.keys(obj)) {
			obj[key] = '<secret2>'
		}
	}
	return obj
}

async function main() {
	try {
		// get the format to print in
		const format = core.getInput('format') || 'json';
		const jsonIndent = Number.parseInt(core.getInput('json-indent') || '2');
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
		const commentPrefix = '#';
		const all = {}
		for(const name of names) {
			const data = JSON.parse(core.getInput(name));
			if(format === 'json') {
				all[name] = entriesInJsonFormat(data, name);
			} else if(format === 'env') {
				console.log(`${commentPrefix} ${name}:`)
				for(const [key, value] of iterEntriesInEnvFormat(data)) {
					console.log(`${key}=${value}`);
				}
				console.log(`${commentPrefix} ${spacer}`);
			} else {
				throw new Error(`Unsupported format: ${format}`);
			}
		}
		if(format === 'json') {
			console.log(JSON.stringify(all, null, jsonIndent));
		}
	} catch(e) {
		core.setFailed(e.message);
	}
}

main()
