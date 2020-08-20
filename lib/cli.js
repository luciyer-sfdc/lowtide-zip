require("dotenv").config()

const parseArgs = require("minimist")

const downloadFromGithub = require("./github"),
			parseRepository = require("./parser"),
			folder = require("./folder"),
			s3 = require("./s3");

const { local } = require("../config")

const putSpace = () => {
	console.log("\n\n")
}

const hasKeyS3 = () => {
	return (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
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

		putSpace()

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
		const verbose = args.verbose ? true : false;

		if (!hasKeyS3())
			return console.error("To use this script you need to define environment variables.")

		putSpace()

		await folder.clear(local.all)
		await folder.create(local.all)
		await folder.create(local.staging)

		await downloadFromGithub(branch)
		await parseRepository(branch)

		await folder.clear(local.staging)
		await s3.clearFolder(branch)

		putSpace()

		const upload_results = await s3.uploadTemplates(branch, verbose)

		putSpace()

		const manifest = upload_results.map(d => d.value)

		const manifest_results = await s3.uploadManifest(branch, manifest)

		console.log("Finished.")

		putSpace()



	} catch (e) {
		return console.error(e)
	}

}

module.exports = {
	downloadLatest: downloadLatest,
	updateBranch: updateBranch
}
