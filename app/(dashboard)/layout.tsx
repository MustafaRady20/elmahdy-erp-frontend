import { AppSidebar } from "@/components/app-sidebar"
import Header from "@/components/sharded/header"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen flex flex-col">
        <Header/>
        <div className="p-5">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}