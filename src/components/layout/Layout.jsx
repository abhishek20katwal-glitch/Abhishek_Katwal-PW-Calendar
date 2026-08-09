import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children }) {

    return (

        <div className="flex h-screen">

            <Sidebar />


            <div className="flex flex-1 flex-col">

                <Header />


                <main className="flex-1 overflow-auto bg-gray-50 p-6">

                    {children}

                </main>


            </div>


        </div>

    );

}

export default Layout;