import getCurrentUser from "@/app/actions/getCurrentUser";
import DesktopSidebar from "./DesktopSidebar";
import MobileFooter from "./MobileFooter";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const currentUser = await getCurrentUser();
    return (
        <Sidebar currentUser={currentUser!}>
            {children}
        </Sidebar>
    );
}

function Sidebar({ children, currentUser }: { children: React.ReactNode; currentUser: any }) {
    return (
        <div className="h-full">
            <DesktopSidebar currentUser={currentUser} />
            <MobileFooter />
            <main className="lg:pl-20 h-full">{children}</main>
        </div>
    );
}
