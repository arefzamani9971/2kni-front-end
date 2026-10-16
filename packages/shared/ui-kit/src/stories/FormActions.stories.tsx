import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from '../fields/TextField';
import { FormActions } from '../patterns/FormActions';
import { FormSection } from '../patterns/FormSection';

/** PAT-FORM-01 action row: Primary first; mobile stacked (sticky for long forms), desktop one row. */
const meta: Meta<typeof FormActions> = { title: 'Patterns/FormActions', component: FormActions };
export default meta;

const Form = (props: Parameters<typeof FormActions>[0]) => (
  <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
    <FormSection title="مشخصات مشتری">
      <TextField label="نام مشتری" />
    </FormSection>
    <FormActions {...props} />
  </form>
);

export const Default: StoryObj<typeof FormActions> = {
  render: (args) => <Form {...args} />,
  args: { submitLabel: 'ثبت مشتری', onCancel: () => undefined },
};
export const Busy: StoryObj<typeof FormActions> = {
  render: (args) => <Form {...args} />,
  args: { submitLabel: 'ثبت مشتری', busy: true, onCancel: () => undefined },
};
export const Desktop: StoryObj<typeof FormActions> = {
  render: (args) => <Form {...args} />,
  args: { submitLabel: 'ذخیرهٔ تغییرات', onCancel: () => undefined, hint: 'تغییرات بعد از ذخیره در فاکتورهای بعدی اعمال می‌شود.' },
  globals: { device: 'desktop' },
};
