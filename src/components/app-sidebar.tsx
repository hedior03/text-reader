import { useQuery } from "@tanstack/react-query";
import { Link, useMatch } from "@tanstack/react-router";
import { LogOutIcon, MessageSquareIcon, MessageSquarePlusIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useConversations } from "@/hooks/use-conversations";
import { authQueryOptions } from "@/lib/auth/queries";

export function AppSidebar() {
  const { data: conversations, isPending } = useConversations();
  const { data: user } = useQuery(authQueryOptions());

  // Safely get current chatId without throwing when not on chat route
  const chatMatch = useMatch({
    from: "/_auth/app/chat/{-$chatId}",
    shouldThrow: false,
  });
  const currentChatId = chatMatch?.params.chatId;

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link to="/app/chat" />} size="lg">
              <MessageSquarePlusIcon className="size-5" />
              <span className="font-semibold">New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {isPending ? (
                <div className="px-2 py-4 text-sm text-muted-foreground">
                  Loading conversations...
                </div>
              ) : conversations?.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                conversations?.map((conv) => (
                  <SidebarMenuItem key={conv.id}>
                    <SidebarMenuButton
                      render={
                        <Link to="/app/chat/{-$chatId}" params={{ chatId: conv.id }} />
                      }
                      isActive={currentChatId === conv.id}
                    >
                      <MessageSquareIcon className="size-4" />
                      <span className="truncate">{conv.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <Avatar className="size-8">
                  <AvatarImage src={user?.image || undefined} />
                  <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="truncate text-sm font-medium">
                    {user?.name || "User"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email || ""}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <a href="/api/auth/sign-out" className="flex w-full items-center">
                    <LogOutIcon className="mr-2 size-4" />
                    <span>Sign out</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
