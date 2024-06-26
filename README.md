# VSCode Source Maps Navigator

> DiSCLAIMER: Since i'm not going to develop or support this anymore, you'd better check @andersnm's [vscode-sourcemap-helper](https://github.com/andersnm/vscode-sourcemap-helper) as successor and a better alternative.

VSCode Source Maps Navigator is a VSCode extension that allows you to quickly navigate to the original source code directly from transpiled/generated one.

The extension is also provides an ability to open the source map itself (both inline maps and map files are supported) by `Ctrl/Cmd+click` on source map URL.

## Available commands

Currently there is only one command available:

### **Source Map: Navigate _(Shift+F7)_**

Navigates (opens in separate tab) original source of transpiled/generated file from current tab with cursor, located at corresponding location.

After navigating from generated file to original one, backward navigation is also becomes available.

## Release Notes

### 0.0.1

The initial release

### 0.0.2

Added support for navigating to inlined sources

## 0.0.3

Added support for ctrl/cmd+click on source map urls
