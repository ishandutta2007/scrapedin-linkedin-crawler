const dependencies = {
  // extractRelatedCompanys: require('./extractRelatedCompanys'),
  saveCompany: require('./saveCompany'),
  logger: require('./logger'),
  config: require('../config.json'),
  getCompanyIdFromUrl: require('./getIdFromCompanyUrl')
}

module.exports = async (companyScraper, companyUrl, injection) => {
  const {
    // extractRelatedCompanys,
    saveCompany,
    logger,
    getCompanyIdFromUrl,
    config
  } = Object.assign({}, dependencies, injection)


  const companyId = getCompanyIdFromUrl(companyUrl)
  console.log('companyId: ' + companyId)
  const company = await companyScraper('https://www.linkedin.com/company/' + companyId, config.companyLoadWaitTime)

  await saveCompany(companyId, company)

  // const related = await extractRelatedCompanys(company, companyId)
  // return related
  return true

}
