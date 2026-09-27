import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { LocationField } from '../location/LocationField';
import type { GeoPoint } from '../location/types';

const meta: Meta = { title: 'Fields/Location' };
export default meta;

export const Picker: StoryObj = {
  render: function Render() {
    const [p, setP] = useState<GeoPoint | null>(null);
    return (
      <div className="flex max-w-sm flex-col gap-4">
        <LocationField value={p} onChange={setP} optional hint="اختیاری؛ نشانی را می‌توانید دستی بنویسید." />
        <code dir="ltr" className="text-caption">{JSON.stringify(p)}</code>
      </div>
    );
  },
};
