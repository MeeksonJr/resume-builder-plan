import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TopLevelSignupPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, val]) => {
    if (typeof val === "string") {
      urlParams.set(key, val);
    } else if (Array.isArray(val) && val[0]) {
      urlParams.set(key, val[0]);
    }
  });

  const query = urlParams.toString();
  redirect(query ? `/auth/sign-up?${query}` : "/auth/sign-up");
}
