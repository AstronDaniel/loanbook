module.exports = {
  // ...existing code...
  module: {
    rules: [
      // ...existing code...
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: /node_modules\/html2pdf\.js/
      },
      // ...existing code...
    ]
  }
  // ...existing code...
}
