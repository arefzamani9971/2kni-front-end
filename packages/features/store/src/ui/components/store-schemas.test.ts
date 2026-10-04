import { contactSchema } from './StoreContactStep.schema';
import { hoursSchema } from './StoreHoursStep.schema';
import { privateSchema } from './StorePrivateStep.schema';
import { schema as locationSchema } from './StoreLocationStep.schema';

describe('F02 optional section schemas', () => {
  it('contact: everything optional, but filled values must be valid; empty becomes null', () => {
    const empty = contactSchema.parse({ phone: '', email: '', addressLine: '', postalCode: '' });
    expect(empty).toEqual({ phone: null, email: null, addressLine: null, postalCode: null });
    expect(contactSchema.safeParse({ phone: '1234', email: '', addressLine: '', postalCode: '' }).success).toBe(false);
    expect(contactSchema.safeParse({ phone: '', email: 'x@', addressLine: '', postalCode: '' }).success).toBe(false);
    expect(contactSchema.parse({ phone: '', email: '', addressLine: '', postalCode: '۰۰۱۲۳۴۵۶۷۸' }).postalCode).toBe('0012345678');
  });

  it('private: bank and identity numbers are validated when present (F02 §7)', () => {
    const base = { ownerName: '', licenseNo: '', nationalId: '', accountNumber: '', cardNumber: '', iban: '' };
    expect(privateSchema.parse(base)).toEqual({
      ownerName: null,
      licenseNo: null,
      nationalId: null,
      accountNumber: null,
      cardNumber: null,
      iban: null,
    });
    expect(privateSchema.safeParse({ ...base, cardNumber: '0000000000000000' }).success).toBe(false);
    expect(privateSchema.safeParse({ ...base, nationalId: '1111111111' }).success).toBe(false);
    expect(privateSchema.parse({ ...base, accountNumber: '0012-345' }).accountNumber).toBe('0012345');
  });

  it('hours: open and close may not be equal; overnight is fine; days off may not be open days', () => {
    expect(hoursSchema.safeParse({ days: 'sat-thu', opens: '09:00', closes: '09:00', closed: 'fri' }).success).toBe(false);
    expect(hoursSchema.safeParse({ days: 'sat-thu', opens: '18:00', closes: '02:00', closed: 'fri' }).success).toBe(true);
    expect(hoursSchema.safeParse({ days: 'all', opens: '09:00', closes: '21:00', closed: 'fri' }).success).toBe(false);
  });

  it('location: the typed address is optional', () => {
    expect(locationSchema.parse({ addressLine: '  ' }).addressLine).toBeNull();
  });
});
