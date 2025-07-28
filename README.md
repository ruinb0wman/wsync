# wsync

A cli tool for sync file/folder from wsl to host(windows)

## install

```sh
git clone https://github.com/ruinb0wman/wsync.git
cd wsync
npm install
npm link
```

## usage

```sh
wsync COMMAND
```

```
Usage: wsync [options] [command]

Options:
  -h, --help      display help for command

Commands:
  init            Initialize a .sync.config.json file
  sync            Perform a one-time sync
  watch           Watch for changes and sync automatically
  check           Validate the .sync.config.json file
  help [command]  display help for command
```

### 1. config

You can just run `wsync init` to create a template of `.sync.config.json` and modify it.

```
{
  "include": [
    "src/**/*",
    "public/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ],
  "target": "/mnt/d/Workspace/yourproject/"
}
```

### 2.check

You can use `wsync check` to check if the config file is valid.

### 3.sync/watch

`wsync sync` will sync all files once

`wsync watch` will watch for changes and sync automatically

