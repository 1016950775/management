module.exports = {
    publicPath: '/manage/',
    assetsDir: 'static',
    productionSourceMap: false,
    devServer: {
        proxy: {
            '/api':{
                target:'http://127.0.0.1',
                changeOrigin:true,
            }
        }
    }
};