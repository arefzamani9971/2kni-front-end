import { render, screen } from '@testing-library/react';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('links both panels and has one h1 (LAND-D01)', () => {
    render(<LandingPage links={{ sellerLogin: 'https://app.2kni.ir/login', customerLogin: 'https://my.2kni.ir/login' }} />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'ورود فروشنده' })).toHaveAttribute('href', 'https://app.2kni.ir/login');
    expect(screen.getAllByRole('link', { name: 'ورود مشتری' })[0]).toHaveAttribute('href', 'https://my.2kni.ir/login');
    expect(screen.getByRole('link', { name: 'امکانات' })).toHaveAttribute('href', '#features');
  });
});
