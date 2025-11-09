import { AppSidebar } from "@/components/app-sidebar"
import { CustomTrigger } from "@/components/custom-sidebat-trigger"
import Header from "@/components/sharded/header"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="">
        <Header/>
        {children}
      </main>
    </SidebarProvider>
  )
}