import { useCallback, useEffect, useMemo, useState } from "react";
import FormCard from "../components/layout/FormCard";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import StatusMessage from "../components/ui/StatusMessage";
import TextArea from "../components/ui/TextArea";
import TextInput from "../components/ui/TextInput";
import { announcementService } from "../services/announcementService";
import { courseService } from "../services/courseService";
import { getApiErrorMessage } from "../utils/apiErrors";
import { getAuthUser } from "../utils/authStorage";
import { announcementSchema, validateForm } from "../validation/schemas";

const initialFormData = {
  course_id: "",
  titulli: "",
  permbajtja: "",
};

const initialFilters = {
  search: "",
  course_id: "",
};

const Announcements = () => {
  const authUser = getAuthUser();
  const canManageAnnouncements = ["admin", "professor"].includes(authUser?.role);
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [filters, setFilters] = useState(initialFilters);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((type, message) => {
    setNotice({ type, message });
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await announcementService.getAll();
      setAnnouncements(res.data);
    } catch (err) {
      showNotice(
        "error",
        getApiErrorMessage(err, "Announcements could not be loaded.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [showNotice]);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await courseService.getAll();
      setCourses(res.data);
    } catch (err) {
      showNotice("error", getApiErrorMessage(err, "Courses could not be loaded."));
    }
  }, [showNotice]);

  useEffect(() => {
    fetchAnnouncements();
    fetchCourses();
  }, [fetchAnnouncements, fetchCourses]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditId(null);
  };

  const saveAnnouncement = async () => {
    const validationError = await validateForm(announcementSchema, formData);

    if (validationError) {
      showNotice("error", validationError);
      return;
    }

    setIsSaving(true);

    try {
      if (editId) {
        await announcementService.update(editId, formData);
        showNotice("success", "Announcement updated successfully.");
      } else {
        await announcementService.create(formData);
        showNotice("success", "Announcement created successfully.");
      }

      resetForm();
      await fetchAnnouncements();
    } catch (err) {
      showNotice(
        "error",
        getApiErrorMessage(err, "Announcement could not be saved.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const editAnnouncement = (announcement) => {
    setEditId(announcement.id);
    setFormData({
      course_id: announcement.course_id || "",
      titulli: announcement.titulli || "",
      permbajtja: announcement.permbajtja || "",
    });
  };

  const deleteAnnouncement = async (announcementId) => {
    if (confirmDeleteId !== announcementId) {
      setConfirmDeleteId(announcementId);
      showNotice("info", "Click Delete again to confirm.");
      return;
    }

    setDeletingId(announcementId);

    try {
      await announcementService.remove(announcementId);
      await fetchAnnouncements();
      if (editId === announcementId) {
        resetForm();
      }
      setConfirmDeleteId(null);
      showNotice("success", "Announcement deleted successfully.");
    } catch (err) {
      showNotice(
        "error",
        getApiErrorMessage(err, "Announcement could not be deleted.")
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return announcements.filter((announcement) => {
      const matchesSearch = search
        ? [
            announcement.course_name,
            announcement.titulli,
            announcement.permbajtja,
            announcement.professor_name || "Admin",
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(search))
        : true;

      const matchesCourse = filters.course_id
        ? Number(announcement.course_id) === Number(filters.course_id)
        : true;

      return matchesSearch && matchesCourse;
    });
  }, [announcements, filters]);

  const summary = useMemo(() => {
    const courseIds = new Set(
      announcements.map((announcement) => announcement.course_id).filter(Boolean)
    );
    const professorCount = announcements.filter((announcement) =>
      Boolean(announcement.professor_name)
    ).length;

    return {
      total: announcements.length,
      shown: filteredAnnouncements.length,
      courses: courseIds.size,
      professorCount,
    };
  }, [announcements, filteredAnnouncements]);

  return (
    <PageContainer title="Announcements">
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">All announcements</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{summary.total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Shown now</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {summary.shown}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Courses covered</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {summary.courses}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Professor posts</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.professorCount}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <StatusMessage message={notice?.message} type={notice?.type} />
      </div>

      <div className={`grid gap-8 ${canManageAnnouncements ? "lg:grid-cols-3" : ""}`}>
        {canManageAnnouncements && (
          <FormCard title={editId ? "Edit Announcement" : "Add Announcement"}>
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

            <div className="mt-6 flex gap-3">
              <Button onClick={saveAnnouncement} disabled={isSaving} fullWidth>
                {isSaving
                  ? "Saving..."
                  : editId
                    ? "Update Announcement"
                    : "Add Announcement"}
              </Button>
              {editId && (
                <Button onClick={resetForm} disabled={isSaving} variant="secondary">
                  Cancel
                </Button>
              )}
            </div>
          </FormCard>
        )}

        <div className={canManageAnnouncements ? "lg:col-span-2" : ""}>
          <FormCard title="Filter Announcements">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                name="search"
                placeholder="Search course, title, professor, or text"
                value={filters.search}
                onChange={handleFilterChange}
              />

              <SelectInput
                name="course_id"
                value={filters.course_id}
                onChange={handleFilterChange}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.emertimi}
                  </option>
                ))}
              </SelectInput>
            </div>
          </FormCard>
        </div>

        <TableCard title="Course Announcements">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-blue-700">
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Announcement</th>
                <th className="px-4 py-3">Professor</th>
                <th className="px-4 py-3">Date</th>
                {canManageAnnouncements && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-6 text-slate-500"
                    colSpan={canManageAnnouncements ? "6" : "5"}
                  >
                    Loading announcements...
                  </td>
                </tr>
              ) : filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((announcement) => (
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
                    {canManageAnnouncements && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => editAnnouncement(announcement)}
                            className="px-3 py-2"
                            variant="ghost"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteAnnouncement(announcement.id)}
                            className="px-3 py-2"
                            disabled={deletingId === announcement.id}
                            variant="danger"
                          >
                            {deletingId === announcement.id
                              ? "Deleting..."
                              : confirmDeleteId === announcement.id
                                ? "Confirm"
                              : "Delete"}
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-6 text-slate-500"
                    colSpan={canManageAnnouncements ? "6" : "5"}
                  >
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
