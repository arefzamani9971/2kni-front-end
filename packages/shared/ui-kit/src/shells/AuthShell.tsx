import type { ReactNode } from 'react';
import type { AppBarProps } from '../patterns/AppBar.types';
import { FlowShell } from './FlowShell';
import type { ShellCommonProps } from './shell-props';

type AuthShellProps = ShellCommonProps & {
  title: ReactNode;
  back?: AppBarProps['back'];
  /** Text above the form on mobile (AUTH-01 intro, AUTH-02 «کد به … ارسال شد.»). */
  lead?: ReactNode;
  /** Text below the form on mobile (help line, resend countdown). */
  note?: ReactNode;
  /** In-content secondary actions under the note (AUTH-02 «تغییر شماره» / «ارسال دوباره کد»). */
  footer?: ReactNode;
};

/**
 * Sign-in and account screens: no navigation before login (F01).
 * Mobile (358:478/479): lead → form → note → footer in one column. Desktop (358:5341/5342): the form and footer
 * fill the main column, lead + note move into a side card at the end edge. One DOM; `contents` + order switch it.
 */
export function AuthShell({ lead, note, footer, children, ...props }: AuthShellProps) {
  const aside = lead != null || note != null;
  return (
    <FlowShell appBar={{ title: props.title, back: props.back }} {...props}>
      {aside || footer != null ? (
        <div className="flex flex-col gap-4 desktop:grid desktop:grid-cols-[minmax(0,1fr)_340px] desktop:items-start desktop:gap-6">
          <div className="contents desktop:col-start-1 desktop:row-start-1 desktop:flex desktop:flex-col desktop:gap-4">
            <div className="order-2 flex flex-col gap-4">{children}</div>
            {footer != null ? (
              <div className="order-4 flex flex-col gap-3 desktop:items-start desktop:*:w-auto">{footer}</div>
            ) : null}
          </div>
          {aside ? (
            <div className="contents text-body-m text-fg-secondary desktop:col-start-2 desktop:row-start-1 desktop:flex desktop:flex-col desktop:gap-2 desktop:rounded-md desktop:bg-surface desktop:p-4">
              {lead != null ? <div className="order-1">{lead}</div> : null}
              {note != null ? <div className="order-3">{note}</div> : null}
            </div>
          ) : null}
        </div>
      ) : (
        children
      )}
    </FlowShell>
  );
}
