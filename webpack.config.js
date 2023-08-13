const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')

module.exports = {
    entry: './index.js', // Replace with your entry point
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'curl-to-flow.html', // Output filename in the dist directory (this will be overwritten by HtmlWebpackPlugin)
    },
    target: 'web', // Set the target to web environment (for browser)
    // module: {
    //     rules: [
    //         // Add the raw-loader to inline the source code
    //         {
    //             test: /\.js$/, // Apply the loader to JavaScript files
    //             loader: 'raw-loader',
    //             include: path.resolve(__dirname, 'src'), // Apply only to files in the src directory
    //         },
    //     ],
    // },
    resolve: {
        alias: {
            // Add any necessary aliases here (e.g., for resolving modules)
            assert: require.resolve('assert'),
        },
        fallback: {
            assert: require.resolve('assert'),
            fs: false,
            path: require.resolve('path-browserify')
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './pluginFiles/curl-to-flow.html', // Path to your HTML template
            // inlineSource: 'index.js', // Inline the output JavaScript within the HTML file
            // filename: 'curl-to-flow.html', // Output filename in the dist directory
            inject: 'body',
        }),
        // new HtmlWebpackPlugin({
        //     template: 'pluginFiles/curl-to-flow.html', // Path to your HTML template
        //     inlineSource: 'src/flowBuilder.js', // Inline the output JavaScript within the HTML file
        // }),
        // new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin) // Inline the output JavaScript within the HTML file
        // new HtmlWebpackPlugin({
        //     template: 'pluginFiles/curl-to-flow.html', // Path to your HTML template
        //     filename: 'curl-to-flow.html', // Output filename in the dist directory
        //     inject: 'body', // Inject the script tag into #curl_to_flow_main
        // }),
    ],
}

