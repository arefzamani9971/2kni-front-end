import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { render } from '@dukani/i18n/testing';
import { ViewportProvider } from '@dukani/ui-kit';
import type { Dto } from '@dukani/contracts';
import type { AttributeEditorValue } from '../../../domain/attribute-values.types';
import { AttributeField } from '../components/AttributeField';
const field = (dataType: Dto<'AttributeDataType'>): Dto<'ProductTypeAttributeDto'> => ({
  attributeId: 'a',
  key: 'feature',
  name: 'Feature',
  dataType,
  isRequired: false,
  isVariantAxis: false,
  sort: 0,
  options: ['One', 'Two', 'Three'].map((value, n) => ({
    id: String(n),
    key: value,
    value,
    colorHex: null,
    isArchived: n === 0,
  })),
});
function Editor({
  dataType,
  initial = '',
  obsolete = false,
}: {
  dataType: Dto<'AttributeDataType'>;
  initial?: AttributeEditorValue;
  obsolete?: boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <ViewportProvider forced="desktop">
      <AttributeField attribute={field(dataType)} value={value} onChange={setValue} obsolete={obsolete} />
      <output data-testid="value">{JSON.stringify(value)}</output>
    </ViewportProvider>
  );
}
it('uses text and numeric controls without losing zero or raw input', () => {
  const view = render(<Editor dataType="Text" />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'model' } });
  expect(screen.getByTestId('value')).toHaveTextContent('model');
  view.unmount();
  render(<Editor dataType="Number" initial="0" />);
  expect(screen.getByRole('textbox')).toHaveValue('۰');
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '-۱۲' } });
  expect(screen.getByTestId('value')).toHaveTextContent('-12');
});
it('distinguishes an explicit false boolean from an empty field', () => {
  render(<Editor dataType="Bool" initial="false" />);
  expect(screen.getByRole('button')).toHaveTextContent('خیر');
  expect(screen.getByTestId('value')).toHaveTextContent('false');
});
it('hides archived options from a new choice and selects a valid option', async () => {
  render(<Editor dataType="Option" />);
  await userEvent.click(screen.getByRole('button'));
  expect(screen.queryByRole('option', { name: /One/ })).toBeNull();
  await userEvent.click(await screen.findByRole('option', { name: 'Two' }));
  expect(screen.getByTestId('value')).toHaveTextContent('1');
});
it('preserves three historical multi-options and removes only the unchecked value', async () => {
  render(<Editor dataType="MultiOption" initial={['0', '1', '2']} />);
  expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(3);
  await userEvent.click(screen.getByRole('checkbox', { name: 'Two' }));
  expect(screen.getByTestId('value')).toHaveTextContent('["0","2"]');
  expect(screen.getByRole('checkbox', { name: /One.*قدیمی/ })).toBeChecked();
});
it('labels obsolete historical values and preserves their displayed value', () => {
  render(<Editor dataType="Option" initial="0" obsolete />);
  expect(screen.getByText(/Feature.*قدیمی/)).toBeVisible();
  expect(screen.getByRole('button')).toHaveTextContent('One (قدیمی)');
  expect(screen.getByTestId('value')).toHaveTextContent('0');
});
