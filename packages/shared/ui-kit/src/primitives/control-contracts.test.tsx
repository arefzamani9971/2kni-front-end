import { render } from '@dukani/i18n/testing';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../fields/Checkbox';
import { Switch } from '../fields/Switch';
import { TextField } from '../fields/TextField';
import { NavigationItem } from '../patterns/NavigationItem';
import { Button } from './Button';
import { Chip } from './Chip';

describe('independent interaction and value axes', () => {
  it('does not leave an aria-disabled button visually blocked but still actionable', () => {
    const click = vi.fn();
    render(
      <Button aria-disabled="true" onClick={click}>
        ذخیره
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'ذخیره' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
  });
  it('preserves selected/checked values while suppressing disabled activation', () => {
    const change = vi.fn();
    render(
      <>
        <Checkbox label="انتخاب" checked disabled onChange={change} />
        <Switch label="فعال" checked disabled onChange={change} />
        <Chip selected disabled onClick={change}>
          فیلتر
        </Chip>
      </>,
    );
    for (const role of ['checkbox', 'switch']) {
      const control = screen.getByRole(role);
      expect(control).toHaveAttribute('aria-checked', 'true');
      expect(control).toBeDisabled();
      fireEvent.click(control);
    }
    const chip = screen.getByRole('button', { name: 'فیلتر' });
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(chip);
    expect(change).not.toHaveBeenCalled();
  });

  it('retains field value and accessible validation while disabled', () => {
    render(<TextField label="شماره" value="12" disabled status="error" message="شماره نامعتبر" />);
    const input = screen.getByLabelText('شماره');
    expect(input).toHaveValue('12');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(document.getElementById(input.getAttribute('aria-describedby')!)).toHaveTextContent(
      'شماره نامعتبر',
    );
  });

  it('blocks repeated activation while loading without losing its accessible label', () => {
    const click = vi.fn();
    render(
      <Button loading onClick={click}>
        ذخیره
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'ذخیره' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
  });

  it('keeps current-route semantics on a disabled navigation item without a destination', () => {
    render(<NavigationItem item={{ id: 'home', href: '/', label: 'خانه', icon: 'home' }} active disabled />);
    const link = screen.getByRole('link', { name: 'خانه' });
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).not.toHaveAttribute('href');
  });
});
