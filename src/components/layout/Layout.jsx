import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children }) {

    return (
        <div className="flex min-h-screen overflow-x-hidden bg-[#090b12]">
            <Sidebar />

            <div className="min-w-0 flex-1 overflow-x-hidden">
                <Header />

                <main className="p-6">

                    {children}

                </main>

            </div>

        </div>
    );
}

export default Layout;