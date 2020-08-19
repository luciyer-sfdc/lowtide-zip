# lowtide-zip

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

Download templates from beta or master:
```
lt-download --branch [beta|master]
```
Download, Zip, and Upload templates from beta or master.
```
lt-update --branch [beta|master]
```
