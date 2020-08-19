# lowtide-zip

Download templates, zip each individually with static resources, and upload to S3.

## Getting started

First, Clone this repo, cd to project directory, and install.

```
$ git clone https://github.com/luciyer-sfdc/lowtide-zip.git
$ cd lowtide-zip/
$ npm install -g
```

Now,
```
$ touch .env
```

and add values for:

```
AWS_ACCESS_KEY_ID=XXXXXX
AWS_SECRET_ACCESS_KEY=XXXXXX
```


## Usage

Download templates from beta or master (for inspection, dev, etc.):
```
lt-download --branch [beta|master]
```
Download, zip, and upload templates from beta or master (optionally, show output).
```
lt-update --branch [beta|master] [--verbose]
```

## Config

Change at your own peril.

```
const root = require("path").resolve(__dirname)

const settings = {
  api_version: "49.0",
  repository : {
    remote : "https://github.com/ttse-sfdc/sfdc-ea-demo-templates.git",
    branches : {
      master : "master",
      beta : "beta"
    },
    template_path : "/force-app/main/default/waveTemplates",
    static_path : "/force-app/main/default/staticresources"
  },
  local : {
    all : root + "/staging",
    staging : root + "/staging/temp",
    beta : root + "/staging/beta",
    master : root + "/staging/master",
    static : root + "/staging/static"
  },
  bucket : {
    name: "ac-template-repo",
    folders : {
      beta : "beta/",
      master : "master/"
    }
  }
}
```
