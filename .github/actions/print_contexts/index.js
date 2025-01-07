const core = require('@actions/core');
const artifact = require('@actions/artifact')
const fs = require('fs');

const redacted = '***'

function isSecret(key) {
	return key === 'secrets';
}

function dotPrefix(prefix, key) {
	if(prefix === '') {
		return key;
	}
	return `${prefix}.${key}`;
}

function* iterEntriesInEnvFormat(obj, name, prefix = '') {
	if(!obj) {
		return;
	}
	for(const [key, value] of Object.entries(obj)) {
		const prefixedKey = dotPrefix(prefix, key);
		if(typeof value === 'object') {
			// recurse
			yield* iterEntriesInEnvFormat(value, name, prefixedKey);
		} else {
			if(isSecret(name)) {
				yield [prefixedKey, redacted];
			} else {
				yield [prefixedKey, JSON.stringify(value)];
			}
		}
	}
}

function entriesInObjectFormat(obj, name) {
	if(isSecret(name)) {
		// redact secrets
		for(const key of Object.keys(obj)) {
			obj[key] = redacted
		}
	}
	return obj
}

async function main() {
	const chunks = []
	try {
		// get the format to print in
		const format = core.getInput('format') || 'object';
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
			if(format === 'js' || format === 'json') {
				all[name] = entriesInObjectFormat(data, name);
			} else if(format === 'env') {
				chunks.push(`${commentPrefix} ${name}:`)
				for(const [key, value] of iterEntriesInEnvFormat(data, name)) {
					chunks.push(`${key}=${value}`);
				}
				chunks.push(`${commentPrefix} ${spacer}`);
			} else {
				throw new Error(`Unsupported format: ${format}`);
			}
		}
		if(format === 'json') {
			chunks.push(JSON.stringify(all, null, jsonIndent));
		} else if(format === 'js') {
			chunks.push(all)
		}
		for(const chunk of chunks) {
			console.log(chunk);
		}
	} catch(e) {
		core.setFailed(`Failed to handle contexts: ${e.message}`);
	}
	const file = core.getInput('artifact')
	if(file) {
		try {
			// overwrite the file
			fs.writeFileSync(file, '');
			for(const chunk of chunks) {
				fs.appendFileSync(file, chunk + '\n');
			}
		} catch(e) {
			core.setFailed(`Failed to write file: ${e.message}`);
		}
		try {
			// upload the artifact
			const artifactClient = new artifact.DefaultArtifactClient()
			const artifactName = file;
			const files = [file];
			const rootDirectory = '.';
			const options = {
				continueOnError: false
			};
			const uploadResponse = await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options);
			core.info(`Artifact uploaded: ${artifactName}`);
		} catch(e) {
			core.setFailed(`Failed to upload artifact: ${e.message}`);
		}
	} else {
		core.info('Skipping artifact upload');
	}
}

main()
