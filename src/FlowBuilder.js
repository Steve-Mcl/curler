/**
 * @typedef REDNode
 * @type {object}
 * @property {string} id - node ID.
 * @property {string} name - node name.
 * @property {string} type - node type name
 * @property {number} outputs - number of output pins.
 * @property {[string[]]} wires - output wires.
 */

/**
 * @typedef REDInjectPropVal
 * @type {object}
 * @property {string} p - Property.
 * @property {string} [v] - Value.
 * @property {string} [vt="str"] - Value type
 */

// "rules":[
//    {"t":"set","p":"file_abc","pt":"msg","to":"payload","tot":"msg"},
//    {"t":"change","p":"payloadToChange","pt":"msg","from":"searchFor","fromt":"str","to":"replaceWith","tot":"str"},
//    {"t":"delete","p":"payload","pt":"msg"},
//    {"t":"move","p":"payloadFrom","pt":"msg","to":"payloadTo","tot":"msg"}
// ]
/**
 * @typedef REDChangeNodeSetRule
 * @type {object}
 * @property {'set'} t - Rule Type.
 * @property {string} p - Dest Property (to Set).
 * @property {'msg' | 'flow' | 'global'} pt - Dest Property type.
 * @property {string} to - Source Property or value
 * @property {'msg' | 'flow' | 'global' | 'str' | 'num' | 'bool' | 'buf' | 'env' | 'json' | 'jsonata'} tot - Source Property type.
 */

/**
 * @typedef REDChangeNodeChangeRule
 * @type {object}
 * @property {'change'} t - Rule Type.
 * @property {string} p - Property (to Change).
 * @property {'msg' | 'flow' | 'global'} pt - Property type.
 * @property {string} from - Value to search for.
 * @property {'msg' | 'flow' | 'global' | 'str' | 'num' | 'bool' | 'buf' | 'env' | 'json' | 'jsonata'} fromt - Value type.
 * @property {string} to - Value to replace with.
 * @property {'msg' | 'flow' | 'global' | 'str' | 'num' | 'bool' | 'buf' | 'env' | 'json' | 'jsonata'} tot - Replace With type.
*/

/**
 * @typedef REDChangeNodeDeleteRule
 * @type {object}
 * @property {'delete'} t - Rule Type.
 * @property {string} p - Property (to Delete).
 * @property {'msg' | 'flow' | 'global'} pt - Property type.
 */
/**
 * @typedef REDChangeNodeMoveRule
 * @type {object}
 * @property {'move'} t - Rule Type.
 * @property {string} p - Source Property (to Move).
 * @property {'msg' | 'flow' | 'global'} pt - Source Property type.
 * @property {string} to - Dest Property (to Move to).
 * @property {'msg' | 'flow' | 'global'} tot - Dest Property type.
 */

/**
 * @typedef REDChangeRule
 * @type {REDChangeNodeSetRule | REDChangeNodeChangeRule | REDChangeNodeDeleteRule | REDChangeNodeMoveRule}
 */

let FormData = require('form-data')
const CurlParser = require('./CurlParser.js')
const { lineComment, removeOuterQuotes, safePropertyName } = require('./utils.js')

class FlowBuilder {

    constructor() {
    /** @type {Array<REDNode>} */this._nodes = []
        this.position = { x: 0, y: 0 }
        const idGen = new IdGenerator()
        this.idIterator = idGen[Symbol.iterator]()
    }
    /**
     * Generate a new Node ID
     * @param size number of hexadecimal characters
     * @returns the ID
     */
    static newId = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    static get gridSize () {
        if (globalThis.RED && globalThis.RED.view) {
            return globalThis.RED.view.gridSize() || 20
        } else {
            return 20
        }
    }
    static calculateTextWidth = text => {
        return text ? (text.length * 7.75) : null
    }
    nextId = () => this.idIterator.next()
    
    static toFlow(curl, parsedCurl) {
        parsedCurl = parsedCurl || CurlParser.parse(curl)
        // const escapeDoubleQuotes = c => c.replace(/\\([\s\S])|(")/g, '\\$1$2')
        // const trimStartAndEndQuotes = c => c.replace(/^["'](.+(?=["']$))["']$/, '$1');
        // let curlEscaped = escapeDoubleQuotes(curl)
        
        // get cookies
        let cookiesJSON = parsedCurl.cookies ? JSON.stringify(parsedCurl.cookies, null, 4) : null

        // get FORM data
        const fileNodes = []
        if (Array.isArray(parsedCurl.multipartData) && parsedCurl.multipartData.length > 0) {
            const form = new FormData()
            const formEntries = parsedCurl.multipartData
            for (let index = 0; index < formEntries.length; index++) {
                const mpu = formEntries[index]
                const key = mpu.key
                const value = mpu.value
                const type = mpu.type
                const config = { headers: { } }
                if (type) {
                    config.headers['Content-Type'] = type
                }
                if (value.startsWith('@')) {
                    const fn = {
                        key,
                        value,
                        filename: removeOuterQuotes(value.substring(1)),
                        msgProp: 'file_' + safePropertyName(key),
                        msgPropTemplate: '{{msg.' + 'file_' + safePropertyName(key) + '}}',
                        msgPropES6: '${msg.' + 'file_' + safePropertyName(key) + '}'
                    }
                    fileNodes.push(fn)
                    if (mpu.filename) {
                        config.filename = mpu.filename
                    }
                    form.append(key, fn.msgPropES6, config)
                } else {
                    form.append(key, value, type ? config : undefined)
                }
            }
            parsedCurl.payload = form.getBuffer().toString()
    
            let additionalHeaders = form.getHeaders()
            if (additionalHeaders) {
                let additionalHeaderKeys = Object.keys(additionalHeaders)
                if (additionalHeaderKeys.length) {
                    if (!parsedCurl.headers) {
                        parsedCurl.headers = { ...additionalHeaders }
                    } else {
                        let headerKeys = Object.keys(parsedCurl.headers)
                        let headersKeysLowerToOriginal = {}
                        for (let index = 0; index < headerKeys.length; index++) {
                            const key = headerKeys[index]
                            headersKeysLowerToOriginal[key.toLowerCase()] = key
                        }
                        for (let index = 0; index < additionalHeaderKeys.length; index++) {
                            const key = additionalHeaderKeys[index]
                            const keyLower = key.toLowerCase()
                            if (headersKeysLowerToOriginal[keyLower]) {
                                parsedCurl.headers[headersKeysLowerToOriginal[keyLower]] = additionalHeaders[key]
                            } else {
                                parsedCurl.headers[key] = additionalHeaders[key]
                            }
                        }
                    }
                }
            }
        }
        const looksLikeJson = str => {
            str = str.trim()
            const obj = str.length > 1 && str.startsWith('{') && str.endsWith('}')
            const arr = str.length > 1 && str.startsWith('[') && str.endsWith(']')
            return obj || arr
        }
        let headersJSON = parsedCurl.headers ? JSON.stringify(parsedCurl.headers, null, 4) : null
        if (parsedCurl.data) {
            const regex = /{.*?"content-type".*?json.*?}/gims
            parsedCurl.payload = parsedCurl.data
            const parseJson = !!regex.exec(headersJSON) || looksLikeJson(parsedCurl.data)
            if (parseJson) {
                try {
                    parsedCurl.payload = JSON.parse(parsedCurl.data)
                } catch (_error) { /* ignore */}
            }
        }
    
        delete parsedCurl.data
        const replaceAll = function (str, find, replace) {
            str = str || ''
            return str.replace(new RegExp(find, 'g'), replace)
        }
        const escapePayload = function (str, quoteType) {
            let pl = str
            quoteType = quoteType || '`'
            let surround = quoteType
            if (typeof pl === 'object') {
                pl = JSON.stringify(pl, null, 4)
                surround = ''
            }
            pl = replaceAll(pl, quoteType, `\\${quoteType}`)
            return surround + pl + surround
        }
        const functionBuilder = []
        functionBuilder.push(`// original curl:`)
        functionBuilder.push(lineComment(curl))
        functionBuilder.push('')
        functionBuilder.push(`// msg.method = "${parsedCurl.method}" // set in HTTP Request node`)
        functionBuilder.push(`// msg.url = "${removeOuterQuotes(parsedCurl.url)}" // set in HTTP Request node`)
        functionBuilder.push(`msg.payload = ${escapePayload(parsedCurl.payload)}`)
        functionBuilder.push(`msg.headers = ${headersJSON}`)
        functionBuilder.push(`msg.cookies = ${cookiesJSON}`)
        functionBuilder.push(`return msg`)
        const fnCode = functionBuilder.join('\n')

        const flow = new FlowBuilder()
        let ids = {
            inject: flow.nextId().value,
            function: flow.nextId().value,
            req: flow.nextId().value,
            debug: flow.nextId().value,
        }
        let nextNodeId = ids.function
        const inj = flow.addInject(ids.inject, 'Click me', flow.position, FlowBuilder.injectPropVal('payload', 'bool', true), [])
        if (fileNodes.length) {
            const firstFileNodeId = flow.nextId().value
            FlowBuilder.connect(inj, firstFileNodeId)
            nextNodeId = firstFileNodeId
            for (let fileIdx = 0; fileIdx < fileNodes.length; fileIdx++) {
                const f = fileNodes[fileIdx]
                const fId = nextNodeId
                const chId = flow.nextId().value
                flow.addFileIn(fId, 'load ' + f.filename, null, f.filename, [chId])
                const changeNodeNextWireId = fileIdx === fileNodes.length - 1 ? ids.function : flow.nextId().value
                const changeNodeName = `move file data to msg.${f.msgProp}`
                flow.addChangeNode(chId, changeNodeName, null, [{ t: 'move', pt: 'msg', p: 'payload', tot: 'msg', to: f.msgProp }], [changeNodeNextWireId])
                nextNodeId = changeNodeNextWireId
            }
        } else {
            inj.connectTo(ids.function)
        }
    
        flow.addFunction(ids.function, 'Prepare Req', null, fnCode, [ids.req])
        flow.addHTTPRequest(ids.req, null, null, parsedCurl, [ids.debug])
        flow.addDebug(ids.debug, null, null, true, true, false, false, false)
        return flow.nodes
    }
    

    nextPosition(useThisPosition, nodeText) {
        const roundUpToGrid = (value) => {
            return Math.ceil(value / FlowBuilder.gridSize) * FlowBuilder.gridSize
        }
        const DEF_WIDTH = FlowBuilder.gridSize * 6 //120
        const Y_SPACING = 3 * FlowBuilder.gridSize // 3 grid spaces @ 20px each = 60px
        const X_MAX = 900 - (DEF_WIDTH / 2)
        
        const widthEstimate = nodeText ? FlowBuilder.calculateTextWidth(nodeText) : DEF_WIDTH
        const lastWidth = this.position.lastWidth || DEF_WIDTH
        
        if (useThisPosition && useThisPosition.x !== null && useThisPosition.y !== null) {
            this.position.x = useThisPosition.x
            this.position.y = useThisPosition.y
        } else {
            const thisWidth = widthEstimate || DEF_WIDTH
            const idealXOffset = (lastWidth / 2) + (thisWidth / 2) + (2 * FlowBuilder.gridSize) + FlowBuilder.gridSize // 1 extra for icon
            // round x up to the nearest grid space
            this.position.x += idealXOffset
            this.position.x = roundUpToGrid(this.position.x)
            if (this.position.x >= X_MAX) {
                this.position.x = (thisWidth - DEF_WIDTH) > 0 ? (thisWidth - DEF_WIDTH) / 2 : 0
                this.position.y += Y_SPACING
            }
        }
        this.position.lastWidth = widthEstimate
        
        return { ...this.position }
    }

    /**
     * 
     * @param propertyName 
     * @param valueType 
     * @param value 
     * @returns REDInjectPropVal
     */
    static injectPropVal = (propertyName, valueType, value) => {
        /** @type {REDInjectPropVal} */ const p = {
            'p': propertyName,
            'v': value,
            'vt': valueType
        }
        return p
    }

    /**
     * Connect nodes by wire
     * @param {REDNode | String} from - the node to connect from
     * @param {REDNode A String} to - the node to connect to
     * @returns the from node for chaining
     */
    static connect(from, to) {
        // check to see if `from` is a string, if yes, use that as `fromId
        // otherwise, check to see if `from` is an object with an `id` property and use that as `fromId`
        // otherwise, throw an error

        let fromNode = from
        if (from && typeof from === 'string') {
            fromNode = this._nodes.find(e => e.id === from)
        }
        // fromNode should be a REDNode at this point
        if (!fromNode || typeof fromNode !== 'object') {
            throw new Error('`from` is invalid. Expected a type of REDNode or String')
        }

        let toId = to
        if (to && typeof to === 'object') {
            toId = to.id
        }
        // toId should be a string ID at this point
        if (!toId || typeof toId !== 'string') {
            throw new Error('`to` is invalid. Expected a type of REDNode or String')
        }

        if (!fromNode.wires[0].find(e => e === toId)) {
            fromNode.wires[0].push(toId)
        }
        return from
    }

    /**
     * Connect nodes by Id
     * @param {string} from 
     * @param {string} to 
     * @returns the from node
     */
    connectById(fromId, toId) {
        const src = this._nodes.find(e => e.id === fromId)
        const dst = this._nodes.find(e => e.id === toId)
        return FlowBuilder.connect(src, dst)
    }

    /**
     * Add an inject node
     * @param {string} [id]  node id
     * @param {string} name   node name
     * @param {{x:number,y:number}} [position]   where to position the node {x,y}
     * @param {REDInjectPropVal[]} propsAndValues (optional) Array of properties and values to inject
     * @param {string[]} [wires] (optional) connections
     * @returns 
     */
    addInject(id, name, position, propsAndValues, wires) {
        const { x, y } = this.nextPosition(position, name || undefined)
        /** @type {REDNode} */
        const n = {
            'id': id || this.nextId(),
            'name': name || 'Click me',
            'type': 'inject',
            'x': x,
            'y': y,
            'props': [],
            'repeat': '', 'crontab': '', 'once': false, 'onceDelay': 0.1, 'topic': '',
            'wires': [[...wires]],
            connectTo: function (/** @type {REDNode} */to) {
                FlowBuilder.connect(n, to)
                return n
            },
            addPropVal: (/** @type {REDInjectPropVal} */propVal) => {
                if (propVal && typeof propVal === 'object' && propVal.p) {
                    n.props.push(FlowBuilder.injectPropVal(propVal.p, propVal.vt, propVal.v))
                }
                return n
            }
            // "x":"400"
        }

        if (Array.isArray(propsAndValues)) {
            for (let index = 0; index < propsAndValues.length; index++) {
                n.addPropVal(propsAndValues[index])
            }
        }
        this._nodes.push(n)
        return n
    }
    /**
     * Add a function node
     * @param {string} [id]  node id
     * @param {string} name   node name
     * @param {{x:number,y:number}} [position]   where to position the node {x,y}
     * @param {string} code   function code (JSON)
     * @param {string[]} [wires] (optional) connections
     * @returns 
     */
    addFunction(id, name, position, code, wires) {
        const { x, y } = this.nextPosition(position, name || undefined)
        /** @type {REDNode} */
        const n = {
            'id': id || this.nextId(),
            'name': name || '',
            'type': 'function',
            'x': x,
            'y': y,
            'func': typeof code === 'object' ? JSON.stringify(code) : code,
            'outputs': 1, 'noerr': 0, 'initialize': '', 'finalize': '', 'libs': [],
            'wires': [[...wires]],
            connectTo: function (/** @type {REDNode} */to) {
                FlowBuilder.connect(n, to)
                return n
            }
            // "x":"400"
        }
        this._nodes.push(n)
        return n
    }
    /**
     * Add a file in node
     * @param {string} [id]  node id
     * @param {string} name   node name
     * @param {{x:number,y:number}} [position]   where to position the node {x,y}
     * @param {string} filename   The file to read
     * @param {string[]} [wires] (optional) connections
     * @returns 
     */
    addFileIn(id, name, position, filename, wires) {
        const { x, y } = this.nextPosition(position, name || undefined)
        /** @type {REDNode} */
        const n = {
            'id': id || this.nextId(),
            'name': name || '',
            'type': 'file in',
            'x': x,
            'y': y,
            'filename': filename,
            'format': '',
            'chunk': false,
            'sendError': false,
            'wires': [[...wires]],
            connectTo: function (/** @type {REDNode} */to) {
                FlowBuilder.connect(n, to)
                return n
            }
        }
        this._nodes.push(n)
        return n
    }
    /**
     * Add a change node
     * @param {string} [id]  node id
     * @param {string} name   node name
     * @param {{x:number,y:number}} [position]   where to position the node {x,y}
     * @param {REDChangeRule[]} rules   Array of properties and values to inject
     */
    addChangeNode(id, name, position, rules, wires) {
        // [{"id":"f960a34bddebb9b8","type":"change","z":"65b88f90c5129bc8","name":"","rules":[{"t":"set","p":"file_abc","pt":"msg","to":"payload","tot":"msg"}],"action":"","property":"","from":"","to":"","reg":false,"x":510,"y":220,"wires":[[]]}]
        const { x, y } = this.nextPosition(position, name ? name : undefined)
        /** @type {FlowBuilder} */
        const n = {
            'id': id || this.nextId(),
            'name': name || '',
            'type': 'change',
            'x': x,
            'y': y,
            'rules': rules,
            'wires': [[...wires]],
            connectTo: function (/** @type {REDNode} */to) {
                FlowBuilder.connect(n, to)
                return n
            },
        }
        this._nodes.push(n)
        return n
    }
    /**
     * Add a HTTP Request node
     * @param {string} [id] - node id
     * @param {string} name - node name
     * @param {{x:number,y:number}} [position] - where to position the node {x,y}
     * @param {'string'} [method="use"] - http method 
     * @param {'' | 'basic' | 'digest'} [user=""] - auth type
     * @param {string} [password=""] - auth user
     * @param {string} [authPass=""] - auth password
     * @param {'txt' | 'bin' | 'obj'} [ret="txt"] - return type
     * @param {string[]} [wires] (optional) connections
     * @returns 
     */
    addHTTPRequest(id, name, position, parsedCurl, wires) {
        const { method, auth, url } = parsedCurl
        const { type, user, password } = auth || { type: '', user: '', password: '' }
        const { x, y } = this.nextPosition(position, name || undefined)
        const node = FlowBuilder.buildHTTPRequest( {id, name, x, y, method, url, authType: type, user, password, wires: [...wires]} )
        this._nodes.push(node)
        return node
    }
    /**
     * Add a debug node
     * @param {string} [id]  node id
     * @param {string} name   node name
     * @param {{x:number,y:number}} [position]   where to position the node {x,y}
     * @param {Boolean} [active=true] debug active or disabled (options, [default=true])
     * @param {Boolean} [toSidebar=true] send debug to sidebar?  (options, [default=true])
     * @param {Boolean} [toConsole=false] send debug to console?  (options, [default=false])
     * @param {Boolean} [completeMsg=false] send complete msg?  (options, [default=false])
     * @returns 
     */
    addDebug(id, name, position, active, toSidebar, toStatus, toConsole, completeMsg) {
        const { x, y } = this.nextPosition(position, name || undefined)
        /** @type {REDNode} */
        const n = {
            'id': id || this.nextId(),
            'type': 'debug',
            'name': name || '',
            'x': x,
            'y': y,
            'active': active === false ? false : true,
            'tosidebar': toSidebar === false ? false : true,
            'console': !!toConsole,
            'tostatus': !!toStatus,
            'complete': completeMsg === true ? 'true' : 'false',
            'statusVal': '',
            'statusType': 'auto',
            'wires': [],
            connectTo: function (/** @type {REDNode} */to) {
                FlowBuilder.connect(n, to)
                return n
            }
        }

        this._nodes.push(n)
        return n
    }

    toString() {
        return JSON.stringify(this._nodes)
    }

    get nodes() {
        const n = /** @type {Array<REDNode>} */ this._nodes
        return n
    }
}


module.exports = {
    FlowBuilder
}

/**
 * 
 * @param {Object} setup - setup object
 * @param {string} setup.id - node id
 * @param {string} setup.name - node name
 * @param {number} setup.x - node x position
 * @param {number} setup.y - node y position
 * @param {string} setup.method - http method
 * @param {string} setup.url - http url
 * @param {string} setup.headers - http headers
 * @param {string} setup.returnAs - return as type
 * @param {'' | 'basic' | 'digest' | 'bearer' | 'anyauth'} setup.authType - auth type
 * @param {string} setup.user - auth user
 * @param {string} setup.password - auth password
 * @param {boolean} setup.persist - persist connection
 * @param {string} setup.proxy - proxy url
 * @param {string} setup.tls - tls config
 * @param {'ignore' | 'query' | 'body'} setup.paytoqs - ignore payload or add payload to query string or add payload to body
 * @param {boolean} setup.insecureHTTPParser - insecure http parser
 * @param {boolean} setup.senderr - Only send non-2xx responses to Catch node
 * @param {Array<Array<String>>} setup.wires - node wires
 */
FlowBuilder.buildHTTPRequest = function ({id, name, x, y, method, url, headers, returnAs, authType, user, password, persist, proxy, tls, paytoqs, insecureHTTPParser, senderr, wires} = {}) {
    if (!returnAs) {
        returnAs = 'txt' // default to text
        // check headers for accept header and attempt to infer return type
        if (headers) {
            for (let i = 0; i < headers.length; i++) {
                if (headers[i].keyType === 'Accept') {
                    if (headers[i].valueType === 'application/json') {
                        returnAs = 'obj'
                    } else if (headers[i].valueType === 'application/octet-stream') {
                        returnAs = 'bin'
                    } else if (headers[i].valueType === 'application/x-www-form-urlencoded') {
                        returnAs = 'obj'
                    }
                }
            }
        }
    }
    const n = {
        id: id || this.nextId(),
        type: 'http request',
        name: name || '',
        method: method === 'use' ? 'use' : (method || 'get').toUpperCase(),
        ret: returnAs || 'txt',
        paytoqs: paytoqs || 'ignore',
        url: url || '',
        tls: tls || '', // tls config // TODO
        persist: persist || false,
        proxy: proxy || '', // proxy config ID // TODO
        insecureHTTPParser: insecureHTTPParser || false,
        authType: authType || '',
        senderr: senderr || false,
        headers: headers || [],
        credentials: authType ? {
            user: user || '',
            password: password || ''
        } : {
            user: '',
            password: ''
        },
        x: x || 0, y: y || 0, // position
        wires: [[...(wires || [])]],
        connectTo: function (/** @type {REDNode} */to) {
            FlowBuilder.connect(n, to)
            return n
        }
    }
    return n
}

class IdGenerator {
    constructor() {
        this.index = 0
        this.base = null
    }

    nextId() {
        if (this.index < 1 || this.index > 255) {
            this.index = 1
            this.base = FlowBuilder.newId(14)
        }
        this.index++
        return this.base + this.index.toString(16).padStart(2, '0')
    }

    [Symbol.iterator]() {
        return {
            next: () => {
                return { value: this.nextId(), done: false }
            }
        }
    }
}