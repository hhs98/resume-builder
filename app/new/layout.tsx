import { BuilderShell } from "@/components/resume/builder-shell"

export default function NewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <BuilderShell>{children}</BuilderShell>
}
