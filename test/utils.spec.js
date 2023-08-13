// eslint-disable-next-line no-unused-vars
const should = require('should')
const utils = require('../src/utils.js')

describe('utils', () => {
    describe('safePropertyName', () => {
        it('should return a safe version of filename for use as a JS property name', () => {
            const safePropertyName = utils.safePropertyName
            safePropertyName('hello world').should.equal('hello_world')
            safePropertyName('hello-world').should.equal('hello-world')
            safePropertyName('hello_world').should.equal('hello_world')
            safePropertyName('hello.world').should.equal('hello_world')
            safePropertyName('hello@world').should.equal('hello_world')
            safePropertyName(' hello world .json').should.equal('hello_world__json')
        })
    })
    describe('serializeCookies', () => {
        it('should return a string of cookies', () => {
            const serializeCookies = utils.serializeCookies
            serializeCookies({}).should.equal('')
            serializeCookies({ a: '1' }).should.equal('a=1')
            serializeCookies({ a: '1', b: '2' }).should.equal('a=1; b=2')
        })
    })
    describe('lineComment', () => {
        it('should return a string with line comments', () => {
            const lineComment = utils.lineComment
            lineComment('hello world').should.equal('// hello world')
            lineComment('hello world', 'title').should.equal('// title\n// hello world')
            lineComment('hello\nworld').should.equal('// hello\n// world')
            lineComment('hello\nworld', 'title').should.equal('// title\n// hello\n// world')
        })
    })
    describe('blockComment', () => {
        it('should return a string with block comments', () => {
            const blockComment = utils.blockComment
            blockComment('hello world').should.equal('/*\nhello world\n*/')
            blockComment('hello world', 'title').should.equal('/* title\nhello world\n*/')
            blockComment('hello\nworld').should.equal('/*\nhello\nworld\n*/')
            blockComment('hello\nworld', 'title').should.equal('/* title\nhello\nworld\n*/')
        })
    })
    describe('removeOuterQuotes', () => {
        it('should return a string with outer quotes removed', () => {
            const removeOuterQuotes = utils.removeOuterQuotes
            removeOuterQuotes('"hello world"').should.equal('hello world')
            removeOuterQuotes('"hello world"').should.equal('hello world')
            removeOuterQuotes("'hello world'").should.equal('hello world')
            removeOuterQuotes("'hello world'").should.equal('hello world')
            removeOuterQuotes('hello world').should.equal('hello world')
            removeOuterQuotes('hello world').should.equal('hello world')
        })
    })
})