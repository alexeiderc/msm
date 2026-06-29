export type ActionResult = {
  ok: boolean;
  message: string;
  id?: string;
  orderNumber?: string;
};

export const emptyActionResult: ActionResult = {
  ok: false,
  message: ""
};
