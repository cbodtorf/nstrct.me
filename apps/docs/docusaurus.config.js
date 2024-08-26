const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'nstrct.me',
  staticDirectories: ['apps/docs/public', 'apps/docs/static'],
  tagline: "nstrct.me is a modern web application that reduces the length of link URL, so it's easier to remember, share and track.",
  favicon: 'images/favicon.png',
  url: 'https://nstrct.me/',
  baseUrl: '/',
  projectName: 'nstrct.me',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          editUrl: 'https://github.com/cbodtorf/nstrct.me/tree/master/',
          path: 'apps/docs/docs',
        },
        pages: {
          path: 'apps/docs/src/pages',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: 'nstrct.me Logo',
          src: 'images/logo.svg',
          srcDark: 'images/logo-dark.svg',
          href: 'https://nstrct.me',
          target: '_self',
          width: '70%',
        },
        items: [
          {
            type: 'search',
            position: 'right',
          },
          {
            position: 'right',
            href: 'https://nstrct.me',
            label: 'Visit App',
          },

          {
            position: 'right',
            href: 'https://github.com/cbodtorf/nstrct.me',
            html: `
                <a  aria-label="GitHub" class="navbar-github-link">
                  <img src="images/github-logo.png" alt="GitHub Logo" class="navbar-github-logo" />
                </a>
              `,
          },
        ],
      },
      footer: {
        copyright: `Copyright © ${new Date().getFullYear()} nstrct.me, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
