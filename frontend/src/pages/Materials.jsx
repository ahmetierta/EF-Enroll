import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FormCard from "../components/layout/FormCard";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import TextArea from "../components/ui/TextArea";
import TextInput from "../components/ui/TextInput";
import { courseService } from "../services/courseService";
import { materialService } from "../services/materialService";
import { getAuthUser } from "../utils/authStorage";
import { materialSchema, validateForm } from "../validation/schemas";

const initialFormData = {
  course_id: "",
  titulli: "",
  file_url: "",
  material_type: "video",
  pershkrimi: "",
  moduli: "",
  java: "",
  duration_minutes: "",
  is_required: "true",
  order_index: "",
};

const initialFilters = {
  search: "",
  material_type: "",
  required: "",
};

const materialTypes = [
  { value: "video", label: "Video" },
  { value: "reading", label: "Reading" },
  { value: "slides", label: "Slides" },
  { value: "assignment", label: "Assignment" },
  { value: "quiz", label: "Quiz" },
  { value: "resource", label: "Resource" },
  { value: "link", label: "External link" },
];

const typeStyles = {
  video: "bg-blue-50 text-blue-700",
  reading: "bg-emerald-50 text-emerald-700",
  slides: "bg-violet-50 text-violet-700",
  assignment: "bg-orange-50 text-orange-700",
  quiz: "bg-pink-50 text-pink-700",
  resource: "bg-slate-100 text-slate-700",
  link: "bg-cyan-50 text-cyan-700",
};

function getTypeLabel(type) {
  return materialTypes.find((item) => item.value === type)?.label || "Resource";
}

function formatDuration(minutes) {
  const value = Number(minutes || 0);

  if (!value) {
    return "No duration";
  }

  if (value < 60) {
    return `${value} min`;
  }

  const hours = Math.floor(value / 60);
  const rest = value % 60;

  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

const Materials = () => {
  const [searchParams] = useSearchParams();
  const authUser = getAuthUser();
  const authRole = authUser?.role;
  const selectedCourseId = searchParams.get("course_id");
  const canManageMaterials = authRole === "professor";
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [filters, setFilters] = useState(initialFilters);
  const [editId, setEditId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMaterials = useCallback(() => {
    if (authRole === "admin" && !selectedCourseId) {
      return;
    }

    const params = {
      ...(selectedCourseId ? { course_id: selectedCourseId } : {}),
      ...(filters.material_type ? { material_type: filters.material_type } : {}),
      ...(filters.required ? { required: filters.required } : {}),
      ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
    };

    materialService
      .getAll(params)
      .then((res) => setMaterials(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Materials could not be loaded.");
      });
  }, [authRole, filters, selectedCourseId]);

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

  const selectedCourse = courses.find(
    (course) => String(course.id) === String(selectedCourseId)
  );
  const formCourseId = selectedCourseId || formData.course_id;

  const stats = useMemo(() => {
    const requiredCount = materials.filter((material) => material.is_required).length;
    const totalMinutes = materials.reduce(
      (sum, material) => sum + Number(material.duration_minutes || 0),
      0
    );
    const courseCount = new Set(materials.map((material) => material.course_id)).size;

    return {
      requiredCount,
      optionalCount: Math.max(materials.length - requiredCount, 0),
      totalMinutes,
      courseCount,
    };
  }, [materials]);

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
    setFormData({
      ...initialFormData,
      course_id: selectedCourseId || "",
    });
    setEditId(null);
  };

  const buildPayload = () => ({
    ...formData,
    course_id: formCourseId,
    java: formData.java ? Number(formData.java) : "",
    duration_minutes: formData.duration_minutes
      ? Number(formData.duration_minutes)
      : 0,
    order_index: formData.order_index ? Number(formData.order_index) : 0,
    is_required: formData.is_required === "true",
  });

  const saveMaterial = async () => {
    setMessage("");
    setError("");

    const payload = buildPayload();
    const validationError = await validateForm(materialSchema, payload);

    if (validationError) {
      setError(validationError);
      return;
    }

    const request = editId
      ? materialService.update(editId, payload)
      : materialService.create(payload);

    request
      .then((res) => {
        setMessage(res.data.message || "Material saved successfully.");
        resetForm();
        fetchMaterials();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Material could not be saved.");
      });
  };

  const editMaterial = (material) => {
    setEditId(material.id);
    setFormData({
      course_id: material.course_id || "",
      titulli: material.titulli || "",
      file_url: material.file_url || "",
      material_type: material.material_type || "resource",
      pershkrimi: material.pershkrimi || "",
      moduli: material.moduli || "",
      java: material.java || "",
      duration_minutes: material.duration_minutes || "",
      is_required: material.is_required ? "true" : "false",
      order_index: material.order_index || "",
    });
  };

  const deleteMaterial = (materialId) => {
    if (!window.confirm("Do you want to delete this material?")) {
      return;
    }

    setProcessingId(materialId);
    setMessage("");
    setError("");

    materialService
      .remove(materialId)
      .then((res) => {
        setMessage(res.data.message || "Material deleted successfully.");
        fetchMaterials();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Material could not be deleted.");
      })
      .finally(() => setProcessingId(null));
  };

  const applyFilters = () => {
    fetchMaterials();
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <PageContainer
      title={
        selectedCourse
          ? `${selectedCourse.emertimi} Materials`
          : "Course Materials"
      }
    >
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Materials</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {materials.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Required</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {stats.requiredCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Optional</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {stats.optionalCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Study Time</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatDuration(stats.totalMinutes)}
          </p>
        </div>
      </div>

      <div className={`grid gap-8 ${canManageMaterials ? "lg:grid-cols-3" : ""}`}>
        {canManageMaterials && (
          <FormCard title={editId ? "Edit Material" : "Add Material"}>
            <div className="space-y-4">
              <SelectInput
                name="course_id"
                value={formCourseId}
                onChange={handleChange}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.emertimi}
                  </option>
                ))}
              </SelectInput>

              <SelectInput
                name="material_type"
                value={formData.material_type}
                onChange={handleChange}
              >
                {materialTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
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

              <TextArea
                name="pershkrimi"
                placeholder="Short description"
                value={formData.pershkrimi}
                onChange={handleChange}
              />

              <TextInput
                name="moduli"
                placeholder="Module or section"
                value={formData.moduli}
                onChange={handleChange}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  type="number"
                  name="java"
                  placeholder="Week"
                  value={formData.java}
                  onChange={handleChange}
                  min="1"
                />
                <TextInput
                  type="number"
                  name="duration_minutes"
                  placeholder="Duration minutes"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <SelectInput
                  name="is_required"
                  value={formData.is_required}
                  onChange={handleChange}
                >
                  <option value="true">Required</option>
                  <option value="false">Optional</option>
                </SelectInput>
                <TextInput
                  type="number"
                  name="order_index"
                  placeholder="Order"
                  value={formData.order_index}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={saveMaterial} className="flex-1">
                {editId ? "Update" : "Add Material"}
              </Button>
              {editId && (
                <Button onClick={resetForm} className="flex-1" variant="secondary">
                  Cancel
                </Button>
              )}
            </div>
          </FormCard>
        )}

        <div className={canManageMaterials ? "lg:col-span-2" : ""}>
          <TableCard title="Learning Materials">
            {!canManageMaterials && !selectedCourseId && authRole === "admin" && (
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

            <div className="mb-5 grid gap-3 md:grid-cols-4">
              <TextInput
                name="search"
                placeholder="Search materials"
                value={filters.search}
                onChange={handleFilterChange}
              />
              <SelectInput
                name="material_type"
                value={filters.material_type}
                onChange={handleFilterChange}
              >
                <option value="">All types</option>
                {materialTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </SelectInput>
              <SelectInput
                name="required"
                value={filters.required}
                onChange={handleFilterChange}
              >
                <option value="">Required and optional</option>
                <option value="required">Required only</option>
                <option value="optional">Optional only</option>
              </SelectInput>
              <div className="flex gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  Filter
                </Button>
                <Button onClick={clearFilters} variant="secondary">
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {materials.length > 0 ? (
                materials.map((material) => (
                  <article
                    key={material.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              typeStyles[material.material_type] || typeStyles.resource
                            }`}
                          >
                            {getTypeLabel(material.material_type)}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              material.is_required
                                ? "bg-red-50 text-red-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {material.is_required ? "Required" : "Optional"}
                          </span>
                          {material.java && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              Week {material.java}
                            </span>
                          )}
                        </div>

                        <h2 className="mt-3 text-lg font-semibold text-slate-950">
                          {material.titulli}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                          {material.pershkrimi || "No description added."}
                        </p>

                        <dl className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                          <div>
                            <dt className="font-semibold text-slate-950">Course</dt>
                            <dd>{material.course_name || "No course"}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-slate-950">
                              Professor
                            </dt>
                            <dd>{material.professor_name || "Admin"}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-slate-950">Module</dt>
                            <dd>{material.moduli || "No module"}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-slate-950">
                              Duration
                            </dt>
                            <dd>{formatDuration(material.duration_minutes)}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="flex min-w-40 flex-col gap-2">
                        <a
                          className="rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
                          href={material.file_url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open
                        </a>
                        {canManageMaterials && (
                          <>
                            <Button
                              onClick={() => editMaterial(material)}
                              variant="secondary"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => deleteMaterial(material.id)}
                              disabled={processingId === material.id}
                              variant="danger"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-600">
                  No materials found.
                </div>
              )}
            </div>
          </TableCard>
        </div>
      </div>
    </PageContainer>
  );
};

export default Materials;
