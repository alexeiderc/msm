export type ActionResult = {
  ok: boolean;
  message: string;
  code?: string;
  retryAfterSeconds?: number;
  id?: string;
  orderNumber?: string;
};

export const emptyActionResult: ActionResult = {
  ok: false,
  message: ""
};
