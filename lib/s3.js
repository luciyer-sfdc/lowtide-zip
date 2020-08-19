require("dotenv").config()

const fsp = require("fs").promises,
      s3Connection = require("aws-sdk").S3,
      archiver = require("archiver");

const folder = require("./folder"),
      manifest = require("./manifest"),
      { api_version, local, bucket } = require("../config");


const s3 = new s3Connection ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const listBuckets = () => {
  return new Promise((resolve, reject) => {
    s3.listBuckets({}, (error, data) => {
      if (error) reject(error.message)
      resolve(data)
    })
  })
}

const readBucket = () => {
  return new Promise((resolve, reject) => {
    s3.listObjects({ Bucket: bucket.name }, (error, data) => {
      if (error) reject(error.message)
      resolve(data)
    })
  })
}

const clearFolder = (branch) => {
  console.log(bucket.folders[branch])
  return new Promise((resolve, reject) => {
    s3.listObjects({ Bucket: bucket.name, Prefix: bucket.folders[branch] },
    (error, data) => {
      if (error)
        reject(error.message)

      if (data.Contents.length === 0)
        reject("Folder empty.")

      params = { Bucket: bucket.name, Delete: { Objects: [] }}

      data.Contents.forEach(item => {
        params.Delete.Objects.push({ Key: item.Key })
      })

      s3.deleteObjects(params, (error, data) => {
        if (error)
          reject(error.message)
        resolve(data)
      })

    })
  })
}

const uploadTemplates = async (branch) => {

  const source = local[branch],
        subfolder = bucket.folders[branch];

  const package = {
    file: "package.zip",
    manifest: "pkg/package.xml",
    templates: "pkg/waveTemplates/",
    static_resources: "pkg/staticresources/"
  }

  const templates = await folder.list(source)

  return Promise.allSettled(
    templates.map(async template => {

      const archive = archiver("zip"),
            zip_key = `${subfolder}${template}.zip`;

      return new Promise((resolve, reject) => {

        archive
          .on("error", (error) => { reject(error.message) })
          .on("finish", () => {
            console.log(`${template}.zip created (${archive.pointer()} bytes).`)
          })

        archive.append(manifest.generate(api_version), { name: package.manifest })
        archive.directory(local.static, package.static_resources)
        archive.directory(`${source}/${template}`, package.templates)
        archive.finalize()

        s3.upload({ Bucket: bucket.name, Key: zip_key, Body: archive },
        (error, data) => {
          if (error) reject(error)
          console.log(`${template} uploaded to ${subfolder}.`)
          resolve(data)
        })

      })

    })
  )

}

module.exports = {
  listBuckets: listBuckets,
  readBucket: readBucket,
  clearFolder: clearFolder,
  uploadTemplates: uploadTemplates
}
