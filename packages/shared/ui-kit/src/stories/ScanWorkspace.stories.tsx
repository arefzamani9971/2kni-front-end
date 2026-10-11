import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScanWorkspace } from '../scanning/ScanWorkspace';
const meta: Meta<typeof ScanWorkspace> = { title: 'Scanning/ScanWorkspace', component: ScanWorkspace };
export default meta;
export const Idle: StoryObj<typeof ScanWorkspace> = {
  args: {
    active: false,
    preview: true,
    hint: 'Place the barcode in the frame',
    status: 'Ready to scan',
    actions: [
      { kind: 'keyboard', label: 'Enter manually', onClick() {} },
      { kind: 'layers', label: 'Scan multiple items', onClick() {} },
      { kind: 'settings', label: 'Scan settings', onClick() {} },
    ],
  },
};
