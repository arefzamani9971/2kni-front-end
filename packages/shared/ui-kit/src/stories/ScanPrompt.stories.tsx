import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../primitives/Button';
import { ScanPrompt } from '../scanning/ScanPrompt';
const meta: Meta<typeof ScanPrompt> = { title: 'Scanning/ScanPrompt', component: ScanPrompt };
export default meta;
export const Closed: StoryObj<typeof ScanPrompt> = {
  args: { open: false, onOpenChange() {}, title: 'Camera permission' },
};

export const Open: StoryObj<typeof ScanPrompt> = {
  args: {
    open: true,
    onOpenChange() {},
    title: 'Camera permission',
    children: 'Allow the camera to read barcodes, or enter the code manually.',
    actions: (
      <>
        <Button>Allow camera</Button>
        <Button variant="secondary">Enter manually</Button>
      </>
    ),
  },
};
