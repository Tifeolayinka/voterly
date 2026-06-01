import { DashboardSidebar, MobileTopBar } from '@/components/dashboard/sidebar'
import { DrawerProvider } from '@/components/dashboard/drawer-provider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DrawerProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <MobileTopBar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </DrawerProvider>
  )
}
