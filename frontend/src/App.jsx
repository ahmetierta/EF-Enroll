import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Students from "./pages/Students";
import Professors from "./pages/Professors";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/students" element={<Students />} />
        <Route path="/professors" element={<Professors />} />
      </Routes>
    </Router>
  );
}

export default App;