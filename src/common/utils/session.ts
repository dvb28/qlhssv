import { getSession } from "next-auth/react";

// Get Cookie Data
export const getCookie = async () => {
  // Get Cookie
  const result: any = await getSession();

  // Return
  return result;
};