# sbc-common-components

[![npm version](https://badge.fury.io/js/sbc-common-components.svg)](https://badge.fury.io/js/sbc-common-components)

[![npm:size:gzip](https://img.shields.io/bundlephobia/minzip/sbc-common-components.svg?label=npm:size:gzip)](https://bundlephobia.com/result?p=sbc-common-components)

The common components for all vue projects in SBC can reside here

[visit the github page ](https://bcgov.github.io/sbc-common-components/)



## How to consume it
```
npm install sbc-common-components --save

and use individual components as you want
```

### How to do local development

use npm link for local dev.
```
go to the sbc-common-components project root 

npm link

Go to the client project [where this module is being used] [ie SBC-AUTH or COOPS-WEB project]

npm link sbc-common-components
```




### How to publish in NPM
```
npm publish --access public

```

### Lints and fixes files
```
npm run lint
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Run your unit tests
```
npm run test:unit
```


### Components


[visit the github page ](https://bcgov.github.io/sbc-common-components/FeeCalculator/)



### TODO - Pending taks


- [ ] copy job to create licence etc for npm repo
- [ ] write tests
- [ ] more documentation in github page
- [ ] handle version update by script
- [ ] change logs


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
