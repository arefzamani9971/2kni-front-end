import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@dukani/i18n';
import type { ReactNode } from 'react';
import type { CorrectionRequest } from '../../domain/correction.types';
import { CorrectionChanges } from './CorrectionChanges';
import { CorrectionSummary } from './CorrectionSummary';
import { CorrectionTimeline } from './CorrectionTimeline';

const wrap = (node: ReactNode) =>
  render(
    <I18nProvider locale="en" messages={{}}>
      {node}
    </I18nProvider>,
  );
const correction: CorrectionRequest = {
  id: 'c1',
  catalogItemId: 'item',
  subject: 'Blue pen',
  status: 'Rejected',
  proposedChanges: { title: 'Blue pen A', 'attr:color': 'red', description: null },
  reason: 'Label differs',
  evidenceFileIds: ['f1'],
  decisionReason: 'Photo is unclear',
  createdAt: '2026-10-11T08:00:00Z',
  history: [
    { at: '2026-10-11T08:00:00Z', status: 'Submitted', note: 'Label differs' },
    { at: '2026-10-11T09:00:00Z', status: 'Rejected', note: 'Photo is unclear' },
  ],
};

describe('correction status (F11 §7, AC05)', () => {
  it('shows the status from the enum with its meaning and the decision reason', () => {
    wrap(<CorrectionSummary correction={correction} />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByText(/You can appeal/)).toBeInTheDocument();
    expect(screen.getByText('Photo is unclear')).toBeInTheDocument();
  });

  it('names fields and options from the capabilities and marks a cleared value', () => {
    wrap(
      <CorrectionChanges
        changes={correction.proposedChanges}
        fields={[
          {
            key: 'attr:color',
            valueType: 'Option',
            name: 'Ink color',
            clearable: false,
            allowedValues: [{ value: 'red', name: 'Red' }],
          },
        ]}
      />,
    );
    expect(screen.getByText('Item title')).toBeInTheDocument();
    expect(screen.getByText('Ink color')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Remove value')).toBeInTheDocument();
  });

  it('lists every history entry in order', () => {
    wrap(<CorrectionTimeline history={correction.history} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Submitted');
    expect(items[1]).toHaveTextContent('Rejected');
  });
});
