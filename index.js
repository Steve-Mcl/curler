(function () {
    'use strict'
    const FlowBuilder = require('./src/FlowBuilder.js')
    // eslint-disable-next-line no-unused-vars
    function showCurlImport(params) {
        const dialog = $('<div id="curl-dialog-input-curl" class="hide" style="display: flex; align-items: flex-end;">' +
            '<div style="flex-grow: 1; height: 100%">' +
            '<form id="curl-dialog-input-curl-fields" class="form-horizontal" style="margin-bottom: 0px; margin-left:20px; height: 100%">' +
            '<div id="curl-dialog-input-editor" style="height:100%;width:100%; position:relative" />' +
            '</form>' +
            '</div>' +
            '</div>')
        let curl_input_editor
        const dWidth80 = $(window).width() * 0.8
        const $dialog = dialog.dialog({
            autoOpen: true,
            title: 'Curl to Flow',
            classes: {
                'ui-dialog': 'red-ui-editor-dialog',
                'ui-widget-overlay': 'red-ui-editor-dialog'
            },
            modal: true,
            closeOnEscape: true,
            width: dWidth80,
            height: 410,
            resizable: true,
            draggable: true,
            open: function (_event, _ui) {
                RED.keyboard.disable()
                curl_input_editor = RED.editor.createEditor({
                    mode: 'ace/mode/shell',
                    id: 'curl-dialog-input-editor',
                    value: '',
                })
            },
            close: function (_event, _ui) {
                $('#curl-dialog-input-curl').dialog('destroy').remove()
                curl_input_editor.destroy()
                curl_input_editor = null
                RED.keyboard.enable()
            },
            buttons: [
                {
                    text: RED._('common.label.cancel'),
                    click: function () {
                        $(this).dialog('close')
                    }
                },
                {
                    text: RED._('common.label.import'),
                    class: 'primary',
                    click: function () {
                        const val = curl_input_editor.getValue()
                        const flow = FlowBuilder.parse(val)

                        function importNodes(nodesStr, addFlow) {
                            let newNodes = nodesStr
                            try {
                                if (typeof nodesStr === 'string') {
                                    try {
                                        nodesStr = nodesStr.trim()
                                        if (nodesStr.length === 0) {
                                            return
                                        }
                                        newNodes = JSON.parse(nodesStr)
                                    } catch (err) {
                                        const e = new Error(RED._('clipboard.invalidFlow', { message: err.message }))
                                        e.code = 'NODE_RED'
                                        throw e
                                    }
                                }
                                const importOptions = { generateIds: true, addFlow: addFlow }
                                RED.view.importNodes(newNodes, importOptions)
                                $dialog.dialog('close')
                            } catch (error) {
                                console.log(error)
                                RED.notify('Error: ' + error.message, 'error')
                            }
                        }
                        importNodes(flow, false)
                    }
                }
            ]

        })
    }

    RED.plugins.registerPlugin('curl-to-flow', {
        type: 'curl',
        onadd: function () {
            console.log('curl-to-flow.onadd called')
            RED.actions.add('curl:show-curl-import', showCurlImport)
        }
    })
})()