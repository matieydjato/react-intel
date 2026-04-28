import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Zero boilerplate',
    icon: '⚡',
    description: (
      <>
        One command analyzes your component AST and emits a Vitest test plus a
        Storybook CSF 3 story right next to the source.
      </>
    ),
  },
  {
    title: 'Context-aware inference',
    icon: '🧠',
    description: (
      <>
        Extracts props from inline types, <code>type</code> aliases,{' '}
        <code>interface</code>, <code>forwardRef</code> and <code>memo</code>{' '}
        wrappers — then infers realistic prop values.
      </>
    ),
  },
  {
    title: 'Offline & deterministic',
    icon: '🔒',
    description: (
      <>
        No network calls by default. Reproducible output you can trust in CI
        and review on every run.
      </>
    ),
  },
  {
    title: 'AI enhancement (preview)',
    icon: '✨',
    description: (
      <>
        Opt in with <code>--ai</code> to try the enhancer pipeline. Today it
        ships a deterministic mock provider — real LLM providers (Anthropic,
        Ollama) are on the roadmap.
      </>
    ),
  },
  {
    title: 'Real testing patterns',
    icon: '🧪',
    description: (
      <>
        Implicit ARIA role mapping, edge cases for booleans, optional props,
        union variants, and event-handler coverage out of the box.
      </>
    ),
  },
  {
    title: 'Programmatic API',
    icon: '🛠️',
    description: (
      <>
        Use <code>run()</code> directly from Node to integrate with codegen
        pipelines, monorepo scripts, or custom tooling.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon} aria-hidden="true">
          {icon}
        </div>
        <Heading as="h3" className={styles.featureTitle}>
          {title}
        </Heading>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Why react-spec-gen?</Heading>
          <p>
            Built for teams that want consistent test and story coverage —
            without writing the same boilerplate twice.
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
