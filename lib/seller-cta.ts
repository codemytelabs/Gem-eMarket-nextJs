// Pure href/label mapping used by useSellerCta — kept separate so the rule
// itself lives in one place even though every caller today is client-side.
export function getSellerCta(isSeller: boolean): {
  href: string;
  label: string;
} {
  return isSeller
    ? { href: "/dashboard", label: "Seller Dashboard" }
    : { href: "/seller-registration", label: "Start Selling" };
}
