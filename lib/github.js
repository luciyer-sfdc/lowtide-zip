const pull = require("github-download");

const { repository, local } = require("../config")

module.exports = async (branch) => {

  const target = local[branch]

  return new Promise((resolve, reject) => {

    try {

    console.log(`\nDownloading #${branch}...\n`)

    pull(`${repository.remote}#${branch}`, local.staging)
      .on("zip", (zip_url) => {
        console.log(`Request too big. Retrieving zip from ${zip_url}.`)
      })
      .on("error", (e) => {
        console.error(e.message)
        reject(e.message)
      })
      .on("end", async () => {
        console.log(`#${branch} downloaded to ${local.staging}.\n`)
        resolve()
      })

    } catch (e) {
      console.error(e.message)
      reject(e.message)
    }

  })

}
