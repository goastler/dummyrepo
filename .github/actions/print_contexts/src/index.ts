import * as core from '@actions/core'
import * as artifact from '@actions/artifact'
import fs from 'fs'

const redacted = '***'

function isSecret(key: string) {
	return key === 'secrets';
}

function dotPrefix(prefix: string, key: string) {
	if(prefix === '') {
		return key;
	}
	return `${prefix}.${key}`;
}

function* iterEntriesInEnvFormat(obj: unknown, name: string, prefix = ''): Generator<[string, string]> {
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

function entriesInObjectFormat(obj: object, name: string) {
	if(isSecret(name)) {
		// redact secrets
		for(const key of Object.keys(obj)) {
			(obj as any)[key] = redacted
		}
	}
	return obj
}

function toJsString(val: unknown, indent: number): string {
	return toJsStringLines(val, indent).join('\n');
}

function indentStr(str: string, indent: number): string {
	return ' '.repeat(indent) + str;
}

function toJsStringLines(val: unknown, indent: number): string[] {
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

async function main() {
	const chunks: string[] = []
	try {
		// get the format to print in
		const format = core.getInput('format') || 'json';
		const indent = Number.parseInt(core.getInput('indent') || '4');
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
		const all = {} as any
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
			chunks.push(...toJsStringLines(all, indent));
		}
		for(const chunk of chunks) {
			console.log(chunk);
		}
	} catch(e: any) {
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
		} catch(e: any) {
			core.setFailed(`Failed to write file: ${e.message}`);
		}
		try {
			// upload the artifact
			const artifactClient = new artifact.DefaultArtifactClient()
			const artifactName = file;
			const files = [file];
			const rootDirectory = '.';
			const uploadResponse = await artifactClient.uploadArtifact(artifactName, files, rootDirectory);
			core.info(`Artifact uploaded: ${artifactName}`);
		} catch(e: any) {
			core.setFailed(`Failed to upload artifact: ${e.message}`);
		}
	} else {
		core.info('Skipping artifact upload');
	}
}

main()
