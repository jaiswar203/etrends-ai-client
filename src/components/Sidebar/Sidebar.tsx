"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import Typography from "../ui/typography"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Text, MessageSquare, NotepadText } from 'lucide-react'

// Menu items.
const items = [
    {
        title: "Report Generator",
        url: "report",
        icon: Text
    },
    {
        title: "Summary Generator",
        url: "summary",
        icon: NotepadText
    },
    {
        title: "QNA Chat",
        url: "chat",
        icon: MessageSquare
    }
]

export function AppSidebar() {
    const pathname = usePathname()

    const isActive = (url: string) => {
        return pathname.startsWith(`/${url}`)
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <Image src="/images/logo.png" width={250} height={100} alt="logo" />
            </SidebarHeader>
            <SidebarContent className="md:mt-4 p-2">
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                className="[&>svg]:size-5 !data-[active=true]:bg-[#C42728] hover:bg-[#F5A846]/20 [data-active=true] group/item"
                                isActive={isActive(item.url)}
                            >
                                <Link href={`/${item.url}`} className="mb-2">
                                    <item.icon
                                        size={20}
                                        className={`text-3xl ${isActive(item.url) ? "text-white" : "text-[#C42728]"} group-hover/item:text-[#C42728]`}
                                    />
                                    <Typography
                                        variant="h4"
                                        className={`font-normal ${isActive(item.url) ? "text-white font-medium" : "text-[#C42728]"} group-hover/item:text-[#C42728]`}
                                    >
                                        {item.title}
                                    </Typography>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                {/* <div className="flex gap-2 cursor-pointer">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="">
                        <Typography variant="h3">{user.name}</Typography>
                        <Typography variant="p" className="text-xs">
                            {user.designation}
                        </Typography>
                    </div>
                </div> */}
            </SidebarFooter>
        </Sidebar>
    )
}