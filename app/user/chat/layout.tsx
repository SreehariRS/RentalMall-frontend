import getCurrentUser from "@/app/actions/getCurrentUser"; // Import getCurrentUser to identify the current user
import UserList from "../components/UserList";
import Sidebar from "@/app/components/sidebar/Sidebar";
import getConversations from "@/app/actions/getConversation";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the current user
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return (
      <Sidebar>
        <div className="h-full">
          <UserList items={[]} /> {/* Empty list if no current user */}
          {children}
        </div>
      </Sidebar>
    );
  }

  // Fetch conversations for the current user
  const conversations = await getConversations();

  // Extract users from conversations (excluding the current user)
  const chattedUsers = conversations
    .flatMap((conversation) =>
      conversation.users.filter((user) => user.id !== currentUser.id)
    )
    // Remove duplicates by user ID (in case a user appears in multiple conversations)
    .filter(
      (user, index, self) => index === self.findIndex((u) => u.id === user.id)
    );

  return (
    <Sidebar>
      <div className="h-full">
        <UserList items={chattedUsers} />
        {children}
      </div>
    </Sidebar>
  );
}