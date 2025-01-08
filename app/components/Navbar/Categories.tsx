'use client'
import Container from "../Container";
import { IoHomeOutline } from "react-icons/io5";
import { ImOffice } from "react-icons/im";
import { PiOfficeChairDuotone } from "react-icons/pi";
import { RiMotorbikeFill } from "react-icons/ri";
import { SiHomeassistantcommunitystore } from "react-icons/si";
import CategoryBox from "../CategoryBox";
import { FaCar } from "react-icons/fa";
import { BsTools } from "react-icons/bs";
import { IoBicycleSharp } from "react-icons/io5";
import { usePathname, useSearchParams } from "next/navigation";

export const categories = [
    {
        label: "home",
        icon: IoHomeOutline,
        description: "this property is close to the beach",
    },
    {
        label: "flat",
        icon: ImOffice,
        description: "this property is close to the city",
    },
    {
        label: "rooms",
        icon: SiHomeassistantcommunitystore,
        description: "two bed property",
    },
    {
        label: "Office",
        icon: PiOfficeChairDuotone,
        description: "no disturbance",
    },
    {
        label: "Bike",
        icon: RiMotorbikeFill,
        description: "perfect conditions",
    },
    {
        label: "car",
        icon: FaCar,
        description: "perfect conditions",
    },
    {
        label: "Tools",
        icon: BsTools,
        description: "rent tools",
    },
    {
        label: "cycle",
        icon: IoBicycleSharp,
        description: "rent tools",
    },
];

function Categories() {
    const params = useSearchParams();
    const category = params?.get('category'); // Optional chaining removed
    const pathname = usePathname();

    const isMainPage = pathname === '/';
    if (!isMainPage) {
        return null;
    }

    return (
        <Container>
            <div className="pt-4 flex flex-row items-center justify-between overflow-x-auto">
                {categories.map((item) => (
                    <CategoryBox
                        key={item.label}
                        label={item.label}
                        selected={category === item.label}
                        icon={item.icon}
                    />
                ))}
            </div>
        </Container>
    );
}

export default Categories;
