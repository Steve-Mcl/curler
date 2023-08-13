// eslint-disable-next-line no-unused-vars
const should = require('should')
const { FlowBuilder } = require('../src/FlowBuilder.js')

describe('FlowBuilder', () => {
    describe('toFlow', () => {
        describe('basic flow', () => {
            it('should return a flow array containing 4 nodes: inject -> function -> http request -> debug', () => {
                const result = FlowBuilder.toFlow('curl https://www.google.com')
                result.should.be.an.Array()
                result[0].should.be.an.Object()
                result[0].should.have.property('type', 'inject')
                result[0].should.have.property('id').and.be.a.String()
                result[0].should.have.property('wires').and.be.an.Array()
                result[0].wires.should.be.an.Array()
                result[0].wires[0].should.be.an.Array()
                result[0].wires[0].should.have.length(1)
                result[0].wires[0][0].should.equal(result[1].id) // should be wired to the function node

                result[1].should.be.an.Object()
                result[1].should.have.property('type', 'function')
                result[1].should.have.property('id').and.be.a.String()
                result[1].should.have.property('wires').and.be.an.Array()
                result[1].wires.should.be.an.Array()
                result[1].wires[0].should.be.an.Array()
                result[1].wires[0].should.have.length(1)
                result[1].wires[0][0].should.equal(result[2].id) // should be wired to the http request node

                result[2].should.be.an.Object()
                result[2].should.have.property('type', 'http request')
                result[2].should.have.property('id').and.be.a.String()
                result[2].should.have.property('wires').and.be.an.Array()
                result[2].wires.should.be.an.Array()
                result[2].wires[0].should.be.an.Array()
                result[2].wires[0].should.have.length(1)
                result[2].wires[0][0].should.equal(result[3].id) // should be wired to the debug node

                result[3].should.be.an.Object()
                result[3].should.have.property('type', 'debug')
            })
        })
        describe('function node', () => {
            it('the original curl command should be present as a code comment in the function node', () => {
                const result = FlowBuilder.toFlow('curl https://www.google.com')
                result[1].should.have.property('func').and.be.a.String()
                result[1].func.should.containEql('// original curl:\n// curl https://www.google.com\n\n')
            })
            it('the function node should msg.payload set with data', () => {
                const result = FlowBuilder.toFlow('curl -X POST https://www.google.com -d "data"')
                result[1].should.have.property('func').and.be.a.String()
                result[1].func.should.containEql('msg.payload = `data`')
            })
            it('the function node should msg.headers set', () => {
                const result = FlowBuilder.toFlow('curl -X POST https://www.google.com -H "Accept: application/json"')
                result[1].should.have.property('func').and.be.a.String()
                result[1].func.should.containEql(`msg.headers = {\n    "Accept": "application/json"\n}`)
            })
            it('the function node should msg.cookies set', () => {
                const result = FlowBuilder.toFlow('curl -X POST https://www.google.com -b "cookie1=value1; cookie2=value2"')
                result[1].should.have.property('func').and.be.a.String()
                result[1].func.should.containEql(`msg.cookies = {\n    "cookie1": "value1",\n    "cookie2": "value2"\n}`)
            })
            it('the function node should end with a return msg', () => {
                const result = FlowBuilder.toFlow('curl https://www.google.com')
                result[1].should.have.property('func').and.be.a.String()
                result[1].func.should.endWith('return msg')
            })
        })
        describe('http request node', () => {
            it('the http request node should have the url set', () => {
                const result = FlowBuilder.toFlow('curl https://www.google.com')
                result[2].should.have.property('url', 'https://www.google.com')
            })
            it('the http request node should have the method set to GET', () => {
                const result = FlowBuilder.toFlow('curl https://www.google.com')
                result[2].should.have.property('method', 'GET')
            })
            it('the http request node should have the method set to POST', () => {
                const result = FlowBuilder.toFlow('curl -X POST https://www.google.com')
                result[2].should.have.property('method', 'POST')
            })
            it('the http request node should have the method set to PUT', () => {
                const result = FlowBuilder.toFlow('curl -X PUT https://www.google.com')
                result[2].should.have.property('method', 'PUT')
            })
            it('the http request node should have authType basic when username/password are encoded in the url', () => {
                const result = FlowBuilder.toFlow('curl https://user:pass@localhost')
                result[2].should.have.property('credentials', { user: 'user', password: 'pass' })
                result[2].should.have.property('authType', 'basic')
            })
            it('the http request node should have authType basic when username/password are options of the curl command', () => {
                const result = FlowBuilder.toFlow('curl --user user:pass https://localhost')
                result[2].should.have.property('credentials', { user: 'user', password: 'pass' })
                result[2].should.have.property('authType', 'basic')
            })
            it('the http request node should have authType digest when username/password are options of the curl command and the digest option is set', () => {
                const result = FlowBuilder.toFlow('curl --digest --user user:pass https://localhost')
                result[2].should.have.property('credentials', { user: 'user', password: 'pass' })
                result[2].should.have.property('authType', 'digest')
            })
        })
    })
})