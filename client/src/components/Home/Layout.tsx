import React from 'react'
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
const Layout =() => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    return (
        <div className='flex h-screen white'>
            {/*Mobile Overlay*/}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}


            <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
        <div>
            {/*Top bar*/}
            <header>

            </header>
            <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 xl"p-12>
                <Outlet />
            </main>
        </div>
        </div>
    )
}

export default Layout