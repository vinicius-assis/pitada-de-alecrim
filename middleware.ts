export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/orders/:path*", "/dishes/:path*", "/cashier/:path*"],
};

