/** Sub-steps reachable from «تماس و نشانی» (Figma 358:481 actions). */
export type ContactStepTarget = 'location' | 'hours' | 'private';

/** Host flow of a step: F02 pending setup (nothing is sent yet) or F03 edit of an existing store. */
export type StepContext = 'setup' | 'edit';
