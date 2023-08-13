module.exports = {
    removeOuterQuotes,
    lineComment,
    blockComment,
    safePropertyName,
    serializeCookies
}


/**
 * Deletes the outer quotes of a string if they exist and are the same character
 * @param {string} str 
 */
function removeOuterQuotes(str) {
    str = str.trim()
    let ch1 = str.slice(0, 1)
    let ch2 = str.slice(-1)
    if (ch1 === ch2 && ["'", '"'].includes(ch1) && ["'", '"'].includes(ch2)) {
        str = str.slice(1, str.length - 1)
    }
    return str
}

/**
 * Adds inline comment markers to the code
 * @param {string} code 
 */
function lineComment(code, title) {
    let result = []
    if (title) {
        title = title.trim()
        result.push(`${title}`)
    }
    result.push(code.split('\n'))
    result = result.flat().map(line => `// ${line}`)
    return result.join('\n')
}

/**
 * Surrounds the code with block comment markers
 * @param {string} code 
 */
function blockComment(code, title) {
    // extract all spaces from start of string to first non-space character
    const spaces = code.match(/^\s*/)[0]
    code = code.trim()
    code = `/*${title ? ' ' + title : ''}\n${spaces}${code}\n*/`
    return code
}

/**
 * Sanitizes a string, returning a safe version for use as a JS property name
 * NOTES:
 * - removes all non-alphanumeric characters
 * - replaces spaces with underscores
 * - converts to lowercase
 * - trims leading and trailing spaces
 * - removes leading @
 * @param {String} name - the name of the file
 * @returns {String} - a safe filename
 */
function safePropertyName(name) {
    let n = (name + '').trim()
    if (n.startsWith('@')) {
        n = n.substring(1)
    }
    n = removeOuterQuotes(n)
    return (n || 'file').replace(/[^a-z0-9-]/gi, '_').toLowerCase().trim()
}

// eslint-disable-next-line require-jsdoc
function serializeCookies (cookieDict) {
    let cookieString = ''
    let i = 0
    const cookieCount = Object.keys(cookieDict).length
    for (const cookieName in cookieDict) {
        const cookieValue = cookieDict[cookieName]
        cookieString += cookieName + '=' + cookieValue
        if (i < cookieCount - 1) {
            cookieString += '; '
        }
        i++
    }
    return cookieString
}
