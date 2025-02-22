import { useEffect, useState } from "react";
import { HamburgerButton } from "./Button";
import { SearchBar } from "./Input";

interface NavbarProps {
    title: string;
    searchHint: string;
    dropDownName: string;
    dropDownList: string[];
}

// this is using daisyUI example code
export default function Navbar({
    title,
    searchHint,
    dropDownName,
    dropDownList,
}: NavbarProps) {
    const [showSideBar, setShowSideBar] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const onSelectDropdown = (item: string) => {
        console.log(item);
    };

    const onClickHamburger = () => {
        const prevShowSideBar = showSideBar;
        setShowSideBar(!prevShowSideBar);
    };

    useEffect(() => {
        console.log(searchTerm);
    }, [searchTerm]);

    return (
        <>
            {/**The navigation bar */}
            <div className="navbar bg-base-100 justify-between">
                {/**Hamburger button and the title as the first piece in the nav bar*/}
                <div className="flex items-center gap-2">
                    <HamburgerButton onClickFunc={onClickHamburger} />
                    {/**Title */}
                    <a className="btn btn-ghost text-xl">{title}</a>
                </div>

                {/**Search bar */}
                <div className="flex-1 flex justify-center">
                    <SearchBar
                        searchHint={searchHint}
                        onSearchLaungh={setSearchTerm}
                    />
                </div>

                {/**Drop down */}
                <details className="dropdown">
                    <summary className="btn m-1">{dropDownName}</summary>
                    <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                        {dropDownList.map((d) => {
                            return (
                                <li key={d}>
                                    <a onClick={() => onSelectDropdown(d)}>
                                        {d}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </details>
            </div>
        </>
    );
}
