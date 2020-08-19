const path = require("path"),
      fsp = require("fs").promises;

const folder = require("./folder")

const { local, repository } = require("../config")

const extToResource = async () => {

  const renamed_files = [],
        static_temp = local.staging + repository.static_path,
        resources = await fsp.readdir(static_temp);

  await Promise.allSettled(resources.map(async resource => {

    const file_path = path.join(static_temp, resource),
          file_ext = path.extname(file_path);

    if (file_ext !== ".xml") {
      const new_file = path.basename(file_path, file_ext) + ".resource";
      const new_path = path.join(path.dirname(file_path), new_file)
      await fsp.rename(file_path, new_path)
      renamed_files.push({
        old: resource,
        current: path.basename(new_path)
      })
    }

  }))

  return renamed_files

}

module.exports = async (branch) => {

  const target = local[branch]

  console.log("Renamed Resources:", await extToResource(), "\n")

  await folder.copy(local.staging + repository.template_path, target)
  await folder.copy(local.staging + repository.static_path, local.static)

  console.log(`Copied templates to ${target}.`)
  console.log(`Copied static to ${local.static}.`)


}
