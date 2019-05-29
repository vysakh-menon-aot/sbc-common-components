module.exports = {
  base: '/sbc-common-components/',
  title: 'SBC Common components',

  themeConfig: {

    nav: [
      { text: 'Home', link: '/' },
      { text: 'GITHUB', link: 'https://github.com/saravankumarpa/sbc-common-components' },
      { text: 'NPM', link: 'https://www.npmjs.com/package/sbc-common-components' },
    ],
    sidebar: [

      {
        title: 'Components',
        collapsable: false,
        children: [
          '/Header/',
          '/Footer/',
          '/Layout/',
          '/FeeCalculator/',
        ]
      },
      {
        title: 'General Documentation',
        children: [
          '/todo/',
          '/futurecomponents/'
        ]
      }
      ]
  }
}
