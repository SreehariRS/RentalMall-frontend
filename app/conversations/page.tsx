"use client";
import clsx from "clsx";
import useConversation from "../hooks/useConversation";
import Empty from "../components/Empty";

function Home() {
    const { isOpen } = useConversation();
    return (
        <div className={clsx("lg:pl-80 h-full lg:block", isOpen ? "block" : "hidden")}>
            <Empty />
        </div>
    );
}

export default Home;
