import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'react-spec-gen',
  tagline:
    'Generate Vitest + RTL tests and Storybook CSF 3 stories from your React components',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://matieydjato.github.io',
  baseUrl: '/react-intel/',

  organizationName: 'matieydjato',
  projectName: 'react-intel',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl:
            'https://github.com/matieydjato/react-intel/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    metadata: [
      {
        name: 'keywords',
        content:
          'react, vitest, testing, storybook, csf3, codegen, ast, cli, react-testing-library, dev-tool',
      },
    ],
    navbar: {
      title: 'react-spec-gen',
      logo: {
        alt: 'react-spec-gen logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/docs/cli', label: 'CLI', position: 'left'},
        {to: '/docs/api', label: 'API', position: 'left'},
        {
          href: 'https://www.npmjs.com/package/react-spec-gen',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/matieydjato/react-intel',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Introduction', to: '/docs/intro'},
            {label: 'Getting Started', to: '/docs/getting-started'},
            {label: 'CLI Reference', to: '/docs/cli'},
            {label: 'Programmatic API', to: '/docs/api'},
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/matieydjato/react-intel',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/react-spec-gen',
            },
            {
              label: 'Issues',
              href: 'https://github.com/matieydjato/react-intel/issues',
            },
            {
              label: 'Changelog',
              href: 'https://github.com/matieydjato/react-intel/blob/main/CHANGELOG.md',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Contributing',
              href: 'https://github.com/matieydjato/react-intel/blob/main/CONTRIBUTING.md',
            },
            {
              label: 'Security',
              href: 'https://github.com/matieydjato/react-intel/blob/main/SECURITY.md',
            },
            {
              label: 'License (MIT)',
              href: 'https://github.com/matieydjato/react-intel/blob/main/LICENSE',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} react-spec-gen — MIT licensed.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'tsx', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
