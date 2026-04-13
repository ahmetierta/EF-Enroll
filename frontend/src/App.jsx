import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Students from "./pages/Students";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/students" element={<Students />} />
      </Routes>
    </Router>
  );
}

export default App;