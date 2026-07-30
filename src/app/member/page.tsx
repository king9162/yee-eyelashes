import { redirect } from "next/navigation";

export default async function MemberPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  redirect(ref ? `/member/login?ref=${encodeURIComponent(ref)}` : "/member/login");
}
