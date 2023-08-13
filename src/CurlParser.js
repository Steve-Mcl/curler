/* eslint-disable require-jsdoc */

const cookie = require('cookie')
const yargs = require('yargs')

const { removeOuterQuotes } = require('../src/utils.js')
// let commandLineArgs = require('command-line-args')

module.exports = {
    parse
}

function parse (curlCommand) {
    // Remove newlines (and from continuations)
    curlCommand = curlCommand.replace(/\\\r|\\\n/g, ' ')

    // Remove extra whitespace
    curlCommand = curlCommand.replace(/\s+/g, ' ')

    // yargs parses -XMETHOD as single argument. fix them up first/here
    curlCommand = curlCommand.replace(/ -XPOST/, ' -X POST')
    curlCommand = curlCommand.replace(/ -XGET/, ' -X GET')
    curlCommand = curlCommand.replace(/ -XPUT/, ' -X PUT')
    curlCommand = curlCommand.replace(/ -XPATCH/, ' -X PATCH')
    curlCommand = curlCommand.replace(/ -XDELETE/, ' -X DELETE')
    curlCommand = curlCommand.replace(/ -XHEAD/, ' -X HEAD')
    curlCommand = curlCommand.replace(/ -XOPTIONS/, ' -X OPTIONS')

    // Safari adds `-Xnull` if it is unable to determine the request type, it can be ignored
    curlCommand = curlCommand.replace(/ -Xnull/, ' ')
    curlCommand = curlCommand.trim()

    const parsedArguments = yargs
        .boolean(['I', 'head', 'G', 'get', 'i', 'include', 'compressed', 'l', 'k', 'silent', 's', 'basic', 'digest', ])
        .alias('A', 'user-agent') // a user agent string
        .alias('B', 'use-ascii') // Use ASCII/text transfer
        // .alias('C', 'continue-at') not supported
        // .alias('D', 'dump-header') not supported
        .alias('E', 'cert') // future // Specify client certificate file for HTTPS and/or FTPS
        .alias('F', 'form') // specify HTTP multipart POST data
        .alias('G', 'get') // Put the post data in the URL and use GET
        .alias('H', 'header') // Pass custom header LINE to server
        .alias('I', 'head') // Show document info only
        // .alias('j', 'junk-session-cookies')
        // .alias('K', 'config')
        .alias('L', 'location') // Follow redirects
        // .alias('M', 'manual') // Display the full manual // not supported
        // .alias('N', 'netrc') // not supported
        // .alias('O', 'remote-name') // Write output to a file named as the remote file // not supported
        // .alias('P', 'ftp-port') // Use PORT instead of PASV // not supported
        // .alias('Q', 'quote') // Send command(s) to server before transfer // not supported
        // .alias('R', 'remote-time') // Set the remote file's time on the local output // not supported
        .alias('S', 'show-error') // Show error even when -s is used // future
        // .alias('T', 'upload-file') // Transfer local FILE to destination // not supported
        .alias('U', 'proxy-user') // Proxy user and password <user:password> // future
        // .alias('V', 'version') // Display version information and exit // not supported
        // .alias('W', 'write-out') // What to output after completion // not supported
        .alias('X', 'request') // Specify request command to use
        // .alias('Z', 'time-cond') not supported
        .alias('a', 'append') // Append to target file when uploading // future?
        .alias('b', 'cookie') // <data|filename> Send cookies from string/file. file is denoted by @filename
        // .alias('c', 'cookie-jar') not supported
        .alias('d', 'data') // HTTP POST data
        .alias('e', 'referer')
        .alias('f', 'fail')
        // .alias('h', 'help')
        .alias('i', 'include')
        // .alias('j', 'junk-session-cookies')
        .alias('k', 'insecure')
        .alias('l', 'location-trusted') // Like -L, but will allow sending the name + password to all hosts that the site may redirect to. Unsure about support!
        .alias('m', 'max-time') // Maximum time allowed for the transfer. // future?
        // .alias('n', 'netrc-file')
        // .alias('o', 'output')
        // .alias('p', 'proxytunnel') // future?
        // .alias('q', 'quote')
        // .alias('r', 'range')
        .alias('s', 'silent')
        .alias('t', 'timeout')
        .alias('u', 'user')
        // .alias('v', 'verbose')
        // .alias('w', 'write-out')
        .alias('x', 'proxy')
        // .alias('y', 'speed-time')
        // .alias('z', 'time-cond')

        .parse(curlCommand)

    let cookieString
    let cookies
    let url = parsedArguments._[1]
    // if url argument wasn't where we expected it, try to find it in the other arguments
    if (!url) {
        for (const argName in parsedArguments) {
            if (typeof parsedArguments[argName] === 'string') {
                if (parsedArguments[argName].indexOf('http') === 0 || parsedArguments[argName].indexOf('www.') === 0) {
                    url = parsedArguments[argName]
                }
            }
        }
    }
    url = removeOuterQuotes(url)

    let headers

    if (parsedArguments.header) {
        headers = {}
        if (!Array.isArray(parsedArguments.header)) {
            parsedArguments.header = [parsedArguments.header]
        }
        parsedArguments.header.forEach(header => {
            if (header.toLowerCase().indexOf('cookie') !== -1) {
                cookieString = header
            } else {
                const components = header.split(/:(.*)/)
                if (components[1]) {
                    headers[components[0]] = components[1].trim()
                }
            }
        })
    }

    if (parsedArguments['user-agent']) {
        if (!headers) {
            headers = {}
        }
        headers['User-Agent'] = parsedArguments['user-agent']
        delete headers['user-agent']
    }

    if (parsedArguments.b) {
        cookieString = parsedArguments.b
    }
    if (parsedArguments.cookie) {
        cookieString = parsedArguments.cookie
    }
    let multipartData
    if (parsedArguments.F) {
        multipartData = []
        if (!Array.isArray(parsedArguments.F)) {
            parsedArguments.F = [parsedArguments.F]
        }
        parsedArguments.F.forEach(multipartArgument => {
            // value could be a file path prepended with an @ e.g. 'file=@/path/to/file'
            // or
            // input could be k=v;type  (type is optional) type can be "text/plain" or "application/json" e.g: 'request={ "title": "My template" };type=application/json'
            const splitArguments = multipartArgument.split('=')
            const key = splitArguments[0]
            if (splitArguments.length > 2) {
                // join the rest back again
                splitArguments[1] = splitArguments.slice(1).join('=')
            }
            const rightOfEq = splitArguments[1]
            let value = rightOfEq
            const formProps = {}
            if (rightOfEq.indexOf(';') !== -1) {
                const semiColonSplit = rightOfEq.split(';')
                value = semiColonSplit[0]
                // now loop through semiColonSplit and look for x=y and collect these key/value pairs
                for (let i = 1; i < semiColonSplit.length; i++) {
                    const valuePart = semiColonSplit[i]
                    if (valuePart.indexOf('=') !== -1) {
                        const equalsSplit = valuePart.split('=')
                        formProps[equalsSplit[0]] = equalsSplit[1]
                    }
                }

                // for (let i = 1; i < semiColonSplit.length; i++) {
                //     const valuePart = semiColonSplit[i]
                //     if (valuePart.indexOf('filename=') !== -1) {
                //         filename = valuePart.split('filename=')[1]
                //     } else if (valuePart.indexOf('type=') !== -1) {
                //         type = valuePart.split('type=')[1]
                //     }
                // }
            }
            multipartData.push({
                key: key,
                value: value,
                ...formProps
            })
        })
    }
    if (cookieString) {
        const cookieParseOptions = {
            decode: function (s) { return s }
        }
        // separate out cookie headers into separate data structure
        // note: cookie is case insensitive
        cookies = cookie.parse(cookieString.replace(/^Cookie: /gi, ''), cookieParseOptions)
    }
    let method
    const xRequest = parsedArguments.request || parsedArguments.X
    if (xRequest === 'POST') {
        method = 'post'
    } else if (xRequest === 'PUT' ||
        parsedArguments.T) {
        method = 'put'
    } else if (xRequest === 'PATCH') {
        method = 'patch'
    } else if (xRequest === 'DELETE') {
        method = 'delete'
    } else if (xRequest === 'OPTIONS') {
        method = 'options'
    } else if ((parsedArguments.d ||
        parsedArguments.data ||
        parsedArguments['data-ascii'] ||
        parsedArguments['data-binary'] ||
        parsedArguments['data-raw'] ||
        parsedArguments.F ||
        parsedArguments.form) && !((parsedArguments.G || parsedArguments.get || xRequest === 'GET'))) {
        method = 'post'
    } else if (parsedArguments.I || parsedArguments.head || xRequest === 'HEAD') {
        method = 'head'
    } else {
        method = 'get'
    }

    const compressed = !!parsedArguments.compressed
    const urlObject = new URL(url) // eslint-disable-line

    // if GET request with data, convert data to query string
    // NB: the -G flag does not change the http verb. It just moves the data into the url.
    if (parsedArguments.G || parsedArguments.get || xRequest === 'GET') {

        const option = 'd' in parsedArguments ? 'd' : 'data' in parsedArguments ? 'data' : null
        if (option && parsedArguments[option]) {
            let kvPairs = parsedArguments[option]
            if (!Array.isArray(kvPairs)) {
                kvPairs = [kvPairs]
            }
            
            // loop through each key/value pair and add them to the url object
            for (const kvPair of kvPairs) {
                const splitArguments = kvPair.split('=', 2)
                const key = splitArguments[0]
                const value = splitArguments[1] || ''
                urlObject.searchParams.append(key, value)
            }

            delete parsedArguments[option]
        }
    }

    const searchParams = urlObject.searchParams || []
    const queryParams = {}
    searchParams.forEach((v, k) => {
        if (v) {
            queryParams[k] = v
        }
    })

    const deSlash = (url) => {
        const urlObject = new URL(url)
        if (urlObject.href === urlObject.origin + '/') {
            return urlObject.origin
        }
        return url
    }

    const request = {
        url: deSlash(urlObject.href),
        URL: urlObject
    }

    
    if (parsedArguments.user) {
        const [user, password] = parsedArguments.user.split(':')
        const type = parsedArguments['anyauth'] ? 'any' : (parsedArguments['ntlm'] ? 'ntlm' : (parsedArguments['digest'] ? 'digest' : null)) || 'basic'
        request.auth = { type, user, password }
    }
    if (urlObject.username || urlObject.password) {
        if (!request.auth) {
            request.auth = {
                type: 'basic',
                user: urlObject.username,
                password: urlObject.password
            }
        }
        const cleanURL = new URL(urlObject.href)
        cleanURL.username = ''
        cleanURL.password = ''
        request.url = deSlash(cleanURL.href)
    }

    if (compressed) {
        request.compressed = true
    }

    if (Object.keys(queryParams).length > 0) {
        request.query = queryParams
    }
    if (headers) {
        request.headers = headers
    }
    request.method = method

    if (cookies) {
        request.cookies = cookies
        request.cookieString = cookieString.replace('Cookie: ', '')
    }
    if (multipartData) {
        request.multipartData = multipartData
    }
    if (parsedArguments.data) {
        request.data = parsedArguments.data
    } else if (parsedArguments['data-binary']) {
        request.data = parsedArguments['data-binary']
        request.isDataBinary = true
    } else if (parsedArguments.d) {
        request.data = parsedArguments.d
    } else if (parsedArguments['data-ascii']) {
        request.data = parsedArguments['data-ascii']
    } else if (parsedArguments['data-raw']) {
        request.data = parsedArguments['data-raw']
        request.isDataRaw = true
    }

    if (parsedArguments.user) {
        request.user = parsedArguments.user
    }

    if (Array.isArray(request.data)) {
        request.dataArray = request.data
        request.data = request.data.join('&')
    } else if (request.data) {
        request.dataArray = request.data.split('&')
    }

    if (parsedArguments.k || parsedArguments.insecure) {
        request.insecure = true
    }
    return request
}
