import getUsers from "@/app/actions/getUsers";
import UserList from "../components/UserList";
import Sidebar from "@/app/components/sidebar/Sidebar";

export default async function UserLayout({
    children
}:{
    children :React.ReactNode;
}) {
    const users = await getUsers()
    return (
        <Sidebar>
       
        <div className="h-full"> 
            <UserList items={users}
            />
                  {children}
          
        </div>
      </Sidebar>
    )
}