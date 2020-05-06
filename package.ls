#!/usr/bin/env lsc -cj
author:
  name: ['Chia-liang Kao']
  email: 'clkao@clkao.org'
contributors: [
  name: "John McLear",
  email: "john@mclear.co.uk",
  url: "http://mclear.co.uk"
]
name: 'ep_author_neat'
description: 'Neat author display for etherpad-lite'
version: '0.0.32'
repository:
  type: 'git'
  url: 'git://github.com/clkao/ep_author_neat.git'
scripts:
  prepublish: """
    ./node_modules/.bin/lsc -cj package.ls &&
    ./node_modules/.bin/lsc -bc -o static/js src/js
  """
engines: {node: '*'}
dependencies: {}
devDependencies:
  LiveScript: \1.1.1
optionalDependencies: {}
