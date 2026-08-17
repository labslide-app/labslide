import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PresentationUpload from "./pages/PresentationUpload";
import CreateGroup from "./pages/CreateGroup";
import JoinGroup from "./pages/JoinGroup";
import GroupDetail from "./pages/GroupDetail";
import PresentationView from "./pages/PresentationView";
import MeetingList from "./pages/MeetingList";
import MeetingDetail from "./pages/MeetingDetail";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<PresentationUpload />} />
        <Route path="/groups/create" element={<CreateGroup />} />
        <Route path="/groups/join" element={<JoinGroup />} />
        <Route path="/groups/:groupId" element={<GroupDetail />} />
        <Route path="/meetings" element={<MeetingList />} />
        <Route path="/meetings/:meetingId" element={<MeetingDetail />} />
        <Route path="/presentations/:presentationId" element={<PresentationView />} />
      </Route>
    </Routes>
  );
}

export default App;