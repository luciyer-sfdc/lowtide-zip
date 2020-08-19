const { create } = require("xmlbuilder2")

exports.generate = (version) => create({
    encoding: "UTF-8"
  }, {
    Package: {
      "@xmlns": "http://soap.sforce.com/2006/04/metadata",
      types: [{
        members: "*",
        name: "WaveTemplateBundle"
      },
      {
          members: "*",
          name: "StaticResource"
      }],
      version: version
    }
}).end({ prettyPrint: true })
