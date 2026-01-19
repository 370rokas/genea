import { type ClassValue, clsx } from "clsx";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getIP(headerList: ReadonlyHeaders) {
  return (headerList.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];
}