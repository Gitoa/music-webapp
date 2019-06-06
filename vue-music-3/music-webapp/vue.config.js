const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const userConfig = require('./config')
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  lintOnSave: false,
  chainWebpack: (config) => {
    config.resolve.alias
      .set('src', resolve('src'))
      .set('@', resolve('src'))
      .set('api', resolve('src/api'))
      .set('base', resolve('src/base'))
      .set('store', resolve('src/store'))
      .set('common', resolve('src/common'))
      .set('components', resolve('src/components'))
  },
  configureWebpack: (config) => {
    config.plugins.push(new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/sw.js')
    }))
    if (process.env.NODE_ENV === 'production') {
      if (userConfig.build.productionGzip) {
        const CompressionWebpackPlugin = require('compression-webpack-plugin')
        config.plugins.push(
          new CompressionWebpackPlugin({
            filename: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp(
              '\\.(' +
              userConfig.build.productionGzipExtensions.join('|') +
              ')$'
            ),
            threshold: 10240,
            minRatio: 0.8
          })
        )
      }  
    } else {
      config.devServer = {
        before(app) {
          app.use(bodyParser.urlencoded({extended: true}))
          const querystring = require('querystring')
    
          app.get('/api/getDiscList', function(req, res) {
            const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
            axios.get(url, {
              headers: {
                referer: 'https://c.y.qq.com/',
                host: 'c.y.qq.com'
              },
              params: req.query
            }).then((response) => {
              res.json(response.data)
            }).catch((e) => {
              console.log(e)
            })
          })
    
          app.get('/api/getQuery', function(req, res) {
            const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
    
            axios.get(url, {
              headers: {
                referer: 'https://c.y.qq.com',
                host: 'c.y.qq.com'
              },
              params: req.query
            }).then((response) => {
              let ret = response.data
              if (typeof ret === 'string') {
                const reg = /^\w+\(({.+})\)$/
                const matches = ret.match(reg)
                if (matches) {
                  ret = JSON.parse(matches[1])
                }
              }
              res.json(ret)
            }).catch((e) => {
              console.log(e)
            })
          })
    
          app.get('/api/getCdInfo', function (req, res) {
            const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
            axios.get(url, {
              headers: {
                referer: 'https://c.y.qq.com/',
                host: 'c.y.qq.com'
              },
              params: req.query
            }).then((response) => {
              let ret = response.data
              if (typeof ret === 'string') {
                const reg = /^\w+\(({.+})\)$/
                const matches = ret.match(reg)
                if (matches) {
                  ret = JSON.parse(matches[1])
                }
              }
              res.json(ret)
            }).catch((e) => {
              console.log(e)
            })
          })
    
          app.get('/api/lyric', function (req, res) {
            const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
    
            axios.get(url, {
              headers: {
                referer: 'https://c.y.qq.com/',
                host: 'c.y.qq.com'
              },
              params: req.query
            }).then((response) => {
              let ret = response.data
              if (typeof ret === 'string') {
                const reg = /^\w+\(({.+})\)$/
                const matches = ret.match(reg)
                if (matches) {
                  ret = JSON.parse(matches[1])
                }
              }
              res.json(ret)
            }).catch((e) => {
              console.log(e)
            })
          })
    
          app.post('/api/getPurlUrl', bodyParser.json(), function (req, res) {
            const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
            axios.post(url, req.body, {
              headers: {
                referer: 'https://y.qq.com/',
                origin: 'https://y.qq.com',
                'Content-type': 'application/x-www-form-urlencoded'
              }
            }).then((response) => {
              res.json(response.data)
            }).catch((e) => {
              console.log(e)
            })
          })
        }
      }
    }
  }
}