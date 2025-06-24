import React, { lazy, Suspense } from "react";
import TaskBar from "./components/TaskBar";
import Opened from "./components/Opened";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import Background from "./components/Background";
import { useStateContext } from "./state/StateContext";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { ToastContainer } from "react-toastify";
import Admin from "./pages/Admin";
import AddApp from "./pages/AddApp";
import AdminIndex from "./pages/AdminIndex";
import Login from "./pages/authPages/Login";
import FileManager from "./apps/fsmanager/FileManager";
import FsContext from "./state/FsContext";
import MainSection from "./apps/fsmanager/MainSection";
import SysAdminIndex from "./pages/SysAdminIndex";
import Loader from "./components/Loader";
const TouchPad = lazy(() => import("./apps/touchpad/Index"));

const Layout = () => {
  const { pop } = useStateContext();
  const location = useLocation();

  return (
    <>
        <ToastContainer progressStyle={{ opacity: "0" }} />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* File Explorer */}
          <Route
            path="fsexplorer"
            element={
              <FsContext>
                <FileManager />
              </FsContext>
            }
          >
            <Route index element={<MainSection />} />
            <Route path="*" element={<MainSection />} />
          </Route>

          <Route
            path="/touchpad"
            element={
              <>
                {location.pathname.includes("touchpad") && (
                  <Suspense fallback={<Loader animate={true} />}>
                    <Admin >
                      <TouchPad />
                    </Admin>
                  </Suspense>
                )}
              </>
            }
          />

          {/* Home */}
          <Route path="/admin" element={<Admin sudo={true} />}>
            <Route index element={<SysAdminIndex />} />
            <Route path="app" element={<AddApp />} />
          </Route>

          {/* Home */}
          <Route path="/" element={<Admin />}>
            <Route index element={<AdminIndex />} />
            <Route path="app/add" element={<AddApp />} />
          </Route>

          {/* Desktop UI Replical */}
          <Route
            path="/os"
            element={
              <>
                <Background />
                <Opened />
                <Outlet />
              </>
            }
          >
            <Route index element={<TaskBar />} />
            <Route path="/os:page" element={<TaskBar />} />
          </Route>
        </Routes>
      {pop && (
        <div
          className="d-flex w-100"
          style={{
            position: "fixed",
            top: "0px",
            bottom: "0px",
            right: "0px",
            leftt: "0px",
            backgroundColor: "#afefff10",
            zIndex: "10000",
          }}
        >
          {pop}
        </div>
      )}
    </>
  );
};

export default Layout;
