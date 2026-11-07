/** Dev Sanctum login — chỉ bật khi `NEXT_PUBLIC_ENABLE_DEV_LOGIN=true` (API vẫn cần `APP_ENV=local`). */
export const DEV_LOGIN_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true";
