import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Students from "./pages/Students";
import Professors from "./pages/Professors";
import Semesters from "./pages/Semesters";
import Departments from "./pages/Departments";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/students" element={<Students />} />
        <Route path="/professors" element={<Professors />} />
        <Route path="/semesters" element={<Semesters />} />
        <Route path="/departments" element={<Departments />} />
      </Routes>
    </Router>
  );
}

export default App;