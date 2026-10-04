import { ScreenHeader } from '../patterns/ScreenHeader';
import { Section } from '../patterns/Section';
import { TwoColumnWorkspace } from '../patterns/TwoColumnWorkspace';
import type { AuthShellProps } from './AuthShell.types';
import { FlowShell } from './FlowShell';

/**
 * Sign-in screens (F01 / F33). One contract, two product layouts chosen by the app (`layout`), so the auth
 * screens never branch on the product themselves.
 */
export function AuthShell({ layout = 'split', ...props }: AuthShellProps) {
  return layout === 'cards' ? <AuthShellCards {...props} /> : <AuthShellSplit {...props} />;
}

/**
 * Seller: no navigation before login, so no sidebar. Mobile (358:478/479): lead → form → note → footer in one
 * column. Desktop (358:5341/5342) is Figma «Content columns»: the form and footer fill «Details», lead + note
 * move into the 340px «Summary» card, 12px apart. One DOM; `contents` + order switch it.
 */
function AuthShellSplit({ lead, note, footer, children, title, back, ...props }: Omit<AuthShellProps, 'layout'>) {
  const aside = lead != null || note != null;
  return (
    <FlowShell appBar={{ title, back }} nav={false} actions={props.actions} banner={props.banner} contentClassName={props.contentClassName}>
      {aside || footer != null ? (
        <div className="desktop:grid desktop:grid-cols-[minmax(0,1fr)_340px] desktop:items-start desktop:gap-3 flex flex-col gap-4">
          <div className="desktop:col-start-1 desktop:row-start-1 desktop:flex desktop:flex-col desktop:gap-3 contents">
            <div className="order-2 flex flex-col gap-4">{children}</div>
            {footer != null ? (
              <div className="desktop:items-start desktop:*:w-auto order-4 flex flex-col gap-3">{footer}</div>
            ) : null}
          </div>
          {aside ? (
            // desktop = Figma «Summary» (same look as ContentColumns' SUMMARY_CARD)
            <div className="text-body-m text-fg-secondary desktop:col-start-2 desktop:row-start-1 desktop:flex desktop:flex-col desktop:gap-3 desktop:rounded-md desktop:bg-surface desktop:p-6 contents">
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

/**
 * Customer (Figma 20b 310:379/310:396, desktop 20 310:3/310:34): page header (Heading/L + context line), the form
 * in a card («Primary»), the resend card («Secondary», countdown as its heading) below it on mobile and beside it
 * on desktop. The app's ShellNav provides the «Auth branding» sidebar (brand only, no menu).
 */
function AuthShellCards({ lead, note, footer, children, title, subtitle, cardTitle, ...props }: Omit<AuthShellProps, 'layout'>) {
  const second = note != null || footer != null;
  return (
    <FlowShell
      header={<ScreenHeader title={title} subtitle={subtitle} />}
      actions={props.actions}
      banner={props.banner}
      contentClassName={props.contentClassName}
    >
      <TwoColumnWorkspace
        secondaryOnMobile
        primary={
          <Section title={cardTitle}>
            {lead != null ? <div className="text-body-m text-fg-secondary">{lead}</div> : null}
            {children}
          </Section>
        }
        secondary={
          second ? (
            <Section title={note}>
              {footer != null ? <div className="desktop:items-start desktop:*:w-auto flex flex-col gap-3">{footer}</div> : null}
            </Section>
          ) : undefined
        }
      />
    </FlowShell>
  );
}
