import React, { useEffect, useState } from "react";
import axios from "axios";
import FormCard from "../components/layout/FormCard";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";

const initialFormData = {
  username: "",
  email: "",
  password_hash: "",
  numri_studentit: "",
  programi: "",
  viti_studimit: "",
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);

  function fetchStudents() {
    axios
      .get("http://localhost:5000/students")
      .then((res) => setStudents(res.data))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditId(null);
  };

  const addStudent = () => {
    axios
      .post("http://localhost:5000/students", formData)
      .then(() => {
        fetchStudents();
        resetForm();
        alert("Student added successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to add student.");
      });
  };

  const updateStudent = () => {
    axios
      .put(`http://localhost:5000/students/${editId}`, formData)
      .then(() => {
        fetchStudents();
        resetForm();
        alert("Student updated successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to update student.");
      });
  };

  const deleteStudent = (id) => {
    if (!window.confirm("Do you want to delete this student?")) return;

    axios
      .delete(`http://localhost:5000/students/${id}`)
      .then(() => {
        fetchStudents();
        if (editId === id) resetForm();
        alert("Student deleted successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to delete student.");
      });
  };

  const editStudent = (student) => {
    setEditId(student.id);
    setFormData({
      username: student.username || "",
      email: student.email || "",
      password_hash: "",
      numri_studentit: student.numri_studentit || "",
      programi: student.programi || "",
      viti_studimit: student.viti_studimit || "",
    });
  };

  return (
    <PageContainer title="Students Management">
      <div className="grid gap-8 lg:grid-cols-3">
        <FormCard title={editId ? "Edit Student" : "Add Student"}>
          <div className="space-y-4">
            <TextInput
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />

            <TextInput
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />

            <TextInput
              name="password_hash"
              placeholder="Password"
              value={formData.password_hash}
              onChange={handleChange}
            />

            <TextInput
              name="numri_studentit"
              placeholder="Student Number"
              value={formData.numri_studentit}
              onChange={handleChange}
            />

            <TextInput
              name="programi"
              placeholder="Program"
              value={formData.programi}
              onChange={handleChange}
            />

            <TextInput
              type="number"
              name="viti_studimit"
              placeholder="Year"
              value={formData.viti_studimit}
              onChange={handleChange}
            />
          </div>

          <div className="mt-6 flex gap-3">
            {editId ? (
              <>
                <Button onClick={updateStudent} className="flex-1">
                  Update
                </Button>
                <Button
                  onClick={resetForm}
                  className="flex-1"
                  variant="secondary"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={addStudent} fullWidth>
                Add Student
              </Button>
            )}
          </div>
        </FormCard>

        <TableCard title="Students List">
          <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-blue-700">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Student Number</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">{student.id}</td>
                      <td className="px-4 py-3">{student.username}</td>
                      <td className="px-4 py-3">{student.email}</td>
                      <td className="px-4 py-3">{student.numri_studentit}</td>
                      <td className="px-4 py-3">{student.programi}</td>
                      <td className="px-4 py-3">{student.viti_studimit}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => editStudent(student)}
                            className="px-3 py-2"
                            variant="ghost"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteStudent(student.id)}
                            className="px-3 py-2"
                            variant="danger"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan="7">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
          </table>
        </TableCard>
      </div>
    </PageContainer>
  );
};

export default Students;
