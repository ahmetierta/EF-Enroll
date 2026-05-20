import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FormCard from "../components/layout/FormCard";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import TextInput from "../components/ui/TextInput";
import { courseService } from "../services/courseService";
import { materialService } from "../services/materialService";
import { getAuthUser } from "../utils/authStorage";
import { materialSchema, validateForm } from "../validation/schemas";

const initialFormData = {
  course_id: "",
  titulli: "",
  file_url: "",
};

const Materials = () => {
  const [searchParams] = useSearchParams();
  const authUser = getAuthUser();
  const authRole = authUser?.role;
  const selectedCourseId = searchParams.get("course_id");
  const canAddMaterial = authRole === "professor";
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMaterials = useCallback(() => {
    if (authRole === "admin" && !selectedCourseId) {
      return;
    }

    const params = selectedCourseId ? { course_id: selectedCourseId } : {};

    materialService
      .getAll(params)
      .then((res) => setMaterials(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Materials could not be loaded.");
      });
  }, [authRole, selectedCourseId]);

  const fetchCourses = useCallback(() => {
    courseService
      .getAll()
      .then((res) => setCourses(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Courses could not be loaded.");
      });
  }, []);

  useEffect(() => {
    fetchMaterials();
    fetchCourses();
  }, [fetchCourses, fetchMaterials]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addMaterial = async () => {
    setMessage("");
    setError("");

    const validationError = await validateForm(materialSchema, formData);

    if (validationError) {
      setError(validationError);
      return;
    }

    materialService
      .create(formData)
      .then((res) => {
        setMessage(res.data.message || "Material added successfully.");
        setFormData(initialFormData);
        fetchMaterials();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Material could not be added.");
      });
  };

  const selectedCourse = courses.find(
    (course) => String(course.id) === String(selectedCourseId)
  );

  return (
    <PageContainer
      title={
        selectedCourse
          ? `${selectedCourse.emertimi} Materials`
          : "Course Materials"
      }
    >
      <div className={`grid gap-8 ${canAddMaterial ? "lg:grid-cols-3" : ""}`}>
        {canAddMaterial && (
          <FormCard title="Add Material">
          <div className="space-y-4">
            <SelectInput
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.emertimi}
                </option>
              ))}
            </SelectInput>

            <TextInput
              name="titulli"
              placeholder="Material title"
              value={formData.titulli}
              onChange={handleChange}
            />

            <TextInput
              name="file_url"
              placeholder="File link or path"
              value={formData.file_url}
              onChange={handleChange}
            />
          </div>

          <Button onClick={addMaterial} className="mt-6" fullWidth>
            Add Material
          </Button>
          </FormCard>
        )}

        <TableCard title="Materials List">
          {!canAddMaterial && !selectedCourseId && authRole === "admin" && (
            <p className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Select a course from the courses page to review its materials.
            </p>
          )}

          {selectedCourseId && (
            <Link
              to="/courses"
              className="mb-4 inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to courses
            </Link>
          )}

          {message && (
            <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-blue-700">
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Professor</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">File</th>
              </tr>
            </thead>

            <tbody>
              {materials.length > 0 ? (
                materials.map((material) => (
                  <tr
                    key={material.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">{material.course_name}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {material.titulli}
                    </td>
                    <td className="px-4 py-3">
                      {material.professor_name || "Admin"}
                    </td>
                    <td className="px-4 py-3">
                      {material.data
                        ? new Date(material.data).toLocaleDateString()
                        : "Not set"}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        className="font-semibold text-blue-700 hover:text-blue-900"
                        href={material.file_url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan="5">
                    No materials found.
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

export default Materials;
