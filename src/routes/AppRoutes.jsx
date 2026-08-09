import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Batches from "../pages/Batches";
import CalendarPage from "../pages/CalendarPage";
import Faculty from "../pages/Faculty";
import Tests from "../pages/Tests";
import Settings from "../pages/Settings";

function AppRoutes() {
    return (
        <Routes>

            {/* Dashboard */}
            <Route
                path="/"
                element={<Dashboard />}
            />

            {/* Calendar */}
            <Route
                path="/calendar"
                element={<CalendarPage />}
            />

            {/* Batches */}
            <Route
                path="/batches"
                element={<Batches />}
            />

            {/* Faculty */}
            <Route
                path="/faculty"
                element={<Faculty />}
            />

            {/* Tests */}
            <Route
                path="/tests"
                element={<Tests />}
            />

            {/* Settings */}
            <Route
                path="/settings"
                element={<Settings />}
            />

        </Routes>
    );
}

export default AppRoutes;