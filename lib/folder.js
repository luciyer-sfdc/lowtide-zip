const fsp = require("fs").promises,
      copy = require("ncp").ncp;

const copyFolder = (source, dest) => {
  return new Promise((resolve, reject) => {
    copy(source, dest, (error) => {
      if (error) {
        console.error(error.message)
        reject(error.message)
        return
      } resolve()
    })
  })
}

const removeFolder = (folder_path) => {
  console.log(`Clearing ${folder_path}.`)
  return fsp.rmdir(folder_path, { recursive: true })
}

const createFolder = async (folder_path) => {
  console.log(`Making ${folder_path}.`)
  return fsp.mkdir(folder_path)
}

const listFolder = (folder_path) => {
  return fsp.readdir(folder_path)
}


module.exports = {
  copy: copyFolder,
  clear: removeFolder,
  create: createFolder,
  list: listFolder
}
