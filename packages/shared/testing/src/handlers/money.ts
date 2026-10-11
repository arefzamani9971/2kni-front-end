/** Money is kept to two fraction digits, like numeric(18,2) in the backend. */
export const round2 = (v: number) => Math.round(v * 100) / 100;
