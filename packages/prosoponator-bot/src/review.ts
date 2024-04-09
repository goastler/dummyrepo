import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
    console.log(':robot: brrr :robot:')

    const comment = github.context.payload.comment
    if (!comment) {
        console.log('No comment found in payload')
        return
    }

    console.log('comment', comment)

    // const body = comment.body
    // const words = body.split(' ').map(word => word.trim()).filter(word => word.length > 0)
    // const command = words[0]
    // const args = words.slice(1)
}

run().catch(error => {
    console.error(error)
    core.setFailed(error.message)
})