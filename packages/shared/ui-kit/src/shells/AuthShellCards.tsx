import { Alert } from '../feedback/Alert';
import { ScreenHeader } from '../patterns/ScreenHeader';
import { Section } from '../patterns/Section';
import { TwoColumnWorkspace } from '../patterns/TwoColumnWorkspace';
import type { AuthCardsProps } from './AuthShell.types';
import { FlowShell } from './FlowShell';

/**
 * Customer (Figma 20b 310:379/310:396, desktop 20 310:3/310:34): page header (Heading/L + context line), the form
 * in a card («Primary»), the resend card («Secondary», countdown as its heading) below it on mobile and beside it
 * on desktop. The app's ShellNav provides the «Auth branding» sidebar (brand only, no menu).
 */
export function AuthShellCards({
  introduction,
  identity,
  notice,
  note,
  footer,
  children,
  title,
  subtitle,
  cardTitle,
  ...props
}: AuthCardsProps) {
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
            {introduction ? <p className="text-body-m text-fg-secondary">{introduction}</p> : null}
            {identity != null ? <div className="text-body-m text-fg-secondary">{identity}</div> : null}
            {notice ? <Alert {...notice} /> : null}
            {children}
          </Section>
        }
        secondary={
          second ? (
            <Section title={note}>
              {footer != null ? (
                <div className="desktop:items-start desktop:*:w-auto flex flex-col gap-3">{footer}</div>
              ) : null}
            </Section>
          ) : undefined
        }
      />
    </FlowShell>
  );
}
