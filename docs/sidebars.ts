import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'getting-started',
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: ['cli', 'api', 'configuration'],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: ['ai', 'examples'],
    },
    {
      type: 'category',
      label: 'Notes',
      collapsed: false,
      items: ['limitations', 'faq'],
    },
  ],
};

export default sidebars;
