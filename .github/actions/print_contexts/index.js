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

function indent(str, indent) {
	return ' '.repeat(indent) + str;
}

function objToString(obj, indentInc, totalIndent = 0) {
	totalIndent += indentInc;
	const lines = [indent('{', totalIndent)]
	for(const [key, value] of Object.entries(obj)) {
		if(typeof value === 'object' && value !== null) {
			lines.push(indent(`${key}: {`, totalIndent));
			lines.push(...objToString(value, indentInc, totalIndent + indentInc));
			lines.push(indent('}', totalIndent));
		} else {
			lines.push(indent(`${key}: ${value}`, totalIndent));
		}
	}
	lines.push(indent('}', totalIndent - indentInc));
	return lines
}

async function main() {
	const chunks = []
	try {
		// get the format to print in
		const format = core.getInput('format') || 'object';
		const indent = Number.parseInt(core.getInput('indent') || '2');
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
			chunks.push(JSON.stringify(all, null, indent));
		} else if(format === 'js') {
			chunks.push(...objToString(all, indent));
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
