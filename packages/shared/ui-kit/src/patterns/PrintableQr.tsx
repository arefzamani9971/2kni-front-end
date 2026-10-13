import type { PrintableQrProps } from './PrintableQr.types';

/** The printable surface intentionally contains only public, user-facing information. */
export function PrintableQr({ src, title, address, url, label }: PrintableQrProps) {
  return (
    <section data-printable-qr className="flex flex-col gap-4">
      <div className="bg-surface flex justify-center rounded-md p-6">
        <img src={src} width={200} height={200} alt={label} className="size-[200px] shrink-0" />
      </div>
      <div className="bg-surface border-line flex flex-col gap-3 rounded-md border p-4">
        <h2 className="text-heading-m text-fg-primary">{title}</h2>
        {address ? <p className="text-body-s text-fg-secondary">{address}</p> : null}
        <p className="text-body-s text-fg-secondary">{label}</p>
        <p dir="ltr" className="text-body-s text-fg-secondary break-all">
          {url}
        </p>
      </div>
    </section>
  );
}
