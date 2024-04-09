import * as core from '@actions/core'
import * as github from '@actions/github'

async function disapprove(args: string[]) {
    console.log('disapprove', args)
}

async function approve(args: string[]) {
    console.log('approve', args)
}

async function help(args: string[]) {
    console.log('help', args)
}

async function usage(args: string[]) {
    console.log('I don\'t know that command')
    await help(args)
}

const commands: {
    [key: string]: (args: string[]) => Promise<void>
} = {
    disapprove,
    approve,
    help,
    'accept': approve,
    'reject': disapprove,
}

const tag = 'prosoponator'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
    console.log(':robot: brrr :robot:')

    if (github.context.eventName !== 'issue_comment') {
        console.log('This event is not a comment.');
        return
    }

    const comment = github.context.payload.comment
    if (!comment) {
        console.log('No comment found in payload')
        return
    }

    console.log('comment', comment)

    const body = comment['body'] as string
    const words = body.split(' ').map(word => word.trim()).filter(word => word.length > 0)
    if(words.length === 0) {
        console.log('No words found in comment')
        return
    }
    const target = words[0]
    if(target !== `@${tag}`) {
        console.log('Bot not tagged in comment')
        return
    }
    const command = words[1]
    if(command === undefined) {
        console.log('No command found in comment')
        return
    }
    const args = words.slice(2)
    console.log('command', command)
    console.log('args', args)

    const fn = commands[command]
    if(fn === undefined) {
        console.log('Command not found')
        return
    }
    await fn(args)
}

run().catch(error => {
    console.error(error)
    core.setFailed(error.message)
})