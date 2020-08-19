const parseArgs = require("minimist")

const downloadFromGithub = require("./github"),
			parseRepository = require("./parser"),
			folder = require("./folder"),
			s3 = require("./s3");

const { local } = require("../config")

const putSpace = () => {
	console.log("\n\n")
}

const validArgs = (args) => {

	if (!args.branch)
		throw new Error("Please include --branch [master|beta].")

	if (args.branch !== "master" && args.branch !== "beta")
		throw new Error("Unrecognized branch. Options: [master|beta].")

	return args

}

const downloadLatest = async () => {

	try {

		const args = validArgs(parseArgs(process.argv.slice(2)))
		const branch = args.branch

		putSpace()

		await folder.clear(local.all)
		await folder.create(local.all)
		await folder.create(local.staging)

		await downloadFromGithub(branch)
		await parseRepository(branch)

		console.log("Finished.")

		putSpace()


	} catch (e) {
		return console.error(e.message)
	}

}

const updateBranch = async () => {

	try {

		const args = validArgs(parseArgs(process.argv.slice(2)))
		const branch = args.branch

		putSpace()

		await folder.clear(local.all)
		await folder.create(local.all)
		await folder.create(local.staging)

		await downloadFromGithub(branch)
		await parseRepository(branch)

		await folder.clear(local.staging)
		await s3.clearFolder(branch)

		putSpace()

		const upload_results = await s3.uploadTemplates(branch)

		putSpace()

		console.log("Finished.")

		if (args.verbose)
			console.log("\nPromise array:", upload_results)

		putSpace()



	} catch (e) {
		return console.error(e.message)
	}

}

module.exports = {
	downloadLatest: downloadLatest,
	updateBranch: updateBranch
}
