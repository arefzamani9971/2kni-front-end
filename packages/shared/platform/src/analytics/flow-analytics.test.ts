import { sanitizeFlowEvent, type FlowEvent } from './flow-analytics';
describe('flow analytics privacy boundary', () => {
  it('drops sensitive/free props and unsafe error strings', () => {
    const input = {
      eventName: 'submit_result',
      flowId: 'F10',
      durationMs: 12.7,
      errorCode: '09123456789',
      phone: '09123456789',
      reason: 'sensitive',
      storeId: 'private',
      file: 'private-image',
    } as unknown as FlowEvent;
    expect(sanitizeFlowEvent(input)).toEqual({ eventName: 'submit_result', flowId: 'F10', durationMs: 13 });
  });
  it('allows machine codes and bounds duration', () => {
    expect(
      sanitizeFlowEvent({
        eventName: 'validation_failed',
        flowId: 'F10',
        errorCode: 'TITLE_DUPLICATE',
        durationMs: -10,
      }),
    ).toEqual({ eventName: 'validation_failed', flowId: 'F10', errorCode: 'TITLE_DUPLICATE', durationMs: 0 });
  });
});
