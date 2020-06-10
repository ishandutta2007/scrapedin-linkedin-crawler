const logger = require('./logger')
const dependencies = {
  config: require('../config.json'),
  scrapCompany: require('./scrapCompany'),
  // avoidAlreadyCrawled: require('./avoidAlreadyCrawled'),
}


module.exports = async (companyScraper, rootCompanys, injection) => new Promise((resolve) => {
  const {
    config,
    scrapCompany,
    avoidAlreadyCrawled
  } = Object.assign({}, dependencies, injection)


  const WORKER_INTERVAL_MS = config.workerIntervalWaitTime
  // avoidAlreadyCrawled.updateAlreadyCrawledCompanys(rootCompanys)

  let currentCompanysToCrawl = rootCompanys
  let nextCompanysToCrawl = []
  console.log('currentCompanysToCrawl : ' + currentCompanysToCrawl)
  

  let parallelCrawlers = 0
  const crawl = async (companyUrl) => {
    parallelCrawlers++
    logger.info(`starting scraping: ${companyUrl}`)

    scrapCompany(companyScraper, companyUrl)
      .then((relatedCompanys) => {
        if(config.avoidAlreadyCrawled){
          nextCompanysToCrawl = avoidAlreadyCrawled.getNextCompanys(nextCompanysToCrawl, relatedCompanys)
        } else {
          nextCompanysToCrawl = nextCompanysToCrawl.concat(relatedCompanys)
        }

        logger.info(`finished scraping: ${companyUrl} , ${relatedCompanys.length} company(s) found!`)
        parallelCrawlers--
      })
      .catch((e) => {
        logger.error(`error on crawling company: ${companyUrl} \n ${e}`)
        parallelCrawlers--
      })
  }

  setInterval(() => {
    if (currentCompanysToCrawl.length === 0 && nextCompanysToCrawl.length === 0) {
      logger.info('there is no companys to crawl right now...')
    } else if (currentCompanysToCrawl.length === 0) {
      logger.info(`a depth of crawling was finished, starting a new depth with ${nextCompanysToCrawl.size} company(s)`)
      currentCompanysToCrawl = nextCompanysToCrawl
      if (config.avoidAlreadyCrawled) {
        avoidAlreadyCrawled.updateAlreadyCrawledCompanys(nextCompanysToCrawl)
      }
      nextCompanysToCrawl = []
    } else if (parallelCrawlers < config.maxConcurrentCrawlers) {
      const companyUrl = currentCompanysToCrawl.shift()
      crawl(companyUrl)
    }
  }, WORKER_INTERVAL_MS)
})


function union(setA, setB) {
    let _union = new Set(setA)
    for (let elem of setB) {
        _union.add(elem)
    }
    return _union
}


function difference(setA, setB) {
    let _difference = new Set(setA)
    for (let elem of setB) {
        _difference.delete(elem)
    }
    return _difference
}
