import type { AttachmentRecordTitleProps } from '../types/AttachmentRecordTitle.types';

export function AttachmentRecordTitle({ item }: AttachmentRecordTitleProps) {
  return (
    <div>
      <p className="text-label-m font-semibold">{item.title}</p>
      <p className="text-body-s text-fg-secondary">
        {[item.productTypeName, item.keyAttributes].filter(Boolean).join(' · ')}
      </p>
    </div>
  );
}
