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

const parseTemplateInfo = async (template_folder) => {

  const template_info_file = "template-info.json",
        template_info_filepath = `${template_folder}/${template_info_file}`,
        data = JSON.parse(await fsp.readFile(template_info_filepath)),
        metadata_map = new Map();

  const api_version = data.assetVersion.toString() + ".0",
        template_dashboards = data.dashboards.map(d => d.label),
        template_datasets = data.externalFiles
          .filter(d => d.type === "CSV")
          .map(d => d.label);

  return {
    api_name: data.name,
    api_version: api_version,
    label: data.label,
    description: data.description,
    tags: data.tags,
    dashboards: template_dashboards,
    datasets: template_datasets
  }

}

const uploadTemplates = async (branch, verbose) => {

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
            zip_key = `${subfolder}${template}.zip`,
            template_info = await parseTemplateInfo(`${source}/${template}`);

      return new Promise((resolve, reject) => {

        archive
          .on("error", (error) => { reject(error.message) })
          .on("finish", () => {
            console.log(`${template}.zip created (${archive.pointer()} bytes).`)
          })

        archive.append(manifest.generate(template_info.api_version), { name: package.manifest })
        archive.directory(local.static, package.static_resources)
        archive.directory(`${source}/${template}`, `${package.templates}/${template}`)
        archive.finalize()

        const upload_params = {
          Bucket: bucket.name,
          Key: zip_key,
          Body: archive
        }

        s3.upload(upload_params, (error, data) => {
          if (error) reject(error)
          console.log(`${template} uploaded to ${bucket.name}/${subfolder}.`)
          if (verbose) console.log("S3:", data, "Metadata:", template_info)
          resolve({
            s3: data,
            template: template_info
          })
        })

      })

    })
  )

}

const uploadManifest = (branch, data) => {

  const file_name = `${branch}.json`
        subfolder = bucket.folders.manifest,
        file_key = `${subfolder}${file_name}`;

  const upload_params = {
    Bucket: bucket.name,
    Key: file_key,
    Body: JSON.stringify(data)
  }

  return new Promise((resolve, reject) => {
    s3.upload(upload_params, (error, data) => {
      if (error) reject(error)
      console.log(`${file_name} uploaded to ${bucket.name}/${subfolder}.`)
      resolve(data)
    })
  })

}

module.exports = {
  listBuckets: listBuckets,
  readBucket: readBucket,
  clearFolder: clearFolder,
  uploadTemplates: uploadTemplates,
  uploadManifest: uploadManifest
}
