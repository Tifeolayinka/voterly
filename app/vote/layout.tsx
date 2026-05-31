export default function VoteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="voter-flow bg-background text-foreground min-h-screen">
      {children}
    </div>
  )
}
