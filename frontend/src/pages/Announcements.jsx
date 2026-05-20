import { useEffect, useState } from "react";
import FormCard from "../components/layout/FormCard";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import TextArea from "../components/ui/TextArea";
import TextInput from "../components/ui/TextInput";
import { announcementService } from "../services/announcementService";
import { courseService } from "../services/courseService";
import { getAuthUser } from "../utils/authStorage";
import { announcementSchema, validateForm } from "../validation/schemas";

const initialFormData = {
  course_id: "",
  titulli: "",
  permbajtja: "",
};

const Announcements = () => {
  const authUser = getAuthUser();
  const canAddAnnouncement = ["admin", "professor"].includes(authUser?.role);
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function fetchAnnouncements() {
    announcementService
      .getAll()
      .then((res) => setAnnouncements(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Announcements could not be loaded.");
      });
  }

  function fetchCourses() {
    courseService
      .getAll()
      .then((res) => setCourses(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Courses could not be loaded.");
      });
  }

  useEffect(() => {
    fetchAnnouncements();
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addAnnouncement = async () => {
    setMessage("");
    setError("");

    const validationError = await validateForm(announcementSchema, formData);

    if (validationError) {
      setError(validationError);
      return;
    }

    announcementService
      .create(formData)
      .then((res) => {
        setMessage(res.data.message || "Announcement created successfully.");
        setFormData(initialFormData);
        fetchAnnouncements();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Announcement could not be created.");
      });
  };

  return (
    <PageContainer title="Announcements">
      <div className={`grid gap-8 ${canAddAnnouncement ? "lg:grid-cols-3" : ""}`}>
        {canAddAnnouncement && (
          <FormCard title="Add Announcement">
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
                placeholder="Title"
                value={formData.titulli}
                onChange={handleChange}
              />

              <TextArea
                name="permbajtja"
                placeholder="Announcement"
                value={formData.permbajtja}
                onChange={handleChange}
              />
            </div>

            <Button onClick={addAnnouncement} className="mt-6" fullWidth>
              Add Announcement
            </Button>
          </FormCard>
        )}

        <TableCard title="Course Announcements">
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
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Professor</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <tr
                    key={announcement.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">{announcement.course_name}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {announcement.titulli}
                    </td>
                    <td className="px-4 py-3">{announcement.permbajtja}</td>
                    <td className="px-4 py-3">
                      {announcement.professor_name || "Admin"}
                    </td>
                    <td className="px-4 py-3">
                      {announcement.data
                        ? new Date(announcement.data).toLocaleDateString()
                        : "Not set"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan="5">
                    No announcements found.
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

export default Announcements;
