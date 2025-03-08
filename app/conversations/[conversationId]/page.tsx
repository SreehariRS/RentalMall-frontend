import getConversationById from "@/app/actions/getConversationById";
import getMesssages from "@/app/actions/getmessages";
import Empty from "@/app/components/Empty";
import Header from "./components/Header";
import Body from "./components/Body";
import Form from "./components/Form";

interface IParams {
    conversationId: string;
}

const ConversationId = async ({ params }: { params: IParams }) => {
    const conversation = await getConversationById(params.conversationId);
    const messages = await getMesssages(params.conversationId);

    if (!conversation) {
        return (
            <div className="lg:pl-80 h-full flex flex-col">
                <Empty />
            </div>
        );
    }

    return (
        <div className="lg:pl-80 h-screen flex flex-col">
            <Header conversation={conversation} />
            <div className="flex-1 overflow-y-auto">
                <Body initialMessages = {messages}/>
            </div>
            <Form />
        </div>
    );
};

export default ConversationId;
