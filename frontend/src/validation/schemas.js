import * as yup from "yup";

const requiredText = (label) =>
  yup.string().trim().required(`${label} is required.`);

const optionalPassword = yup
  .string()
  .transform((value) => (value ? value : undefined))
  .min(6, "Password must be at least 6 characters.");

const password = yup
  .string()
  .required("Password is required.")
  .min(6, "Password must be at least 6 characters.");

const email = yup
  .string()
  .trim()
  .email("Enter a valid email address.")
  .required("Email is required.");

const positiveInteger = (label) =>
  yup
    .number()
    .typeError(`${label} must be a number.`)
    .integer(`${label} must be a whole number.`)
    .positive(`${label} must be greater than 0.`)
    .required(`${label} is required.`);

export async function validateForm(schema, values) {
  try {
    await schema.validate(values, { abortEarly: false });
    return null;
  } catch (err) {
    return err.inner?.[0]?.message || err.message || "Please check the form.";
  }
}

export const loginSchema = yup.object({
  email,
  password: yup.string().required("Password is required."),
});

export const forgotPasswordSchema = yup.object({
  email,
});

export const resetPasswordSchema = yup.object({
  password,
  confirmPassword: yup
    .string()
    .required("Confirm password is required.")
    .oneOf([yup.ref("password")], "Passwords do not match."),
});

export const studentRegisterSchema = yup.object({
  username: requiredText("Username"),
  email,
  password,
  programi: requiredText("Program"),
  viti_studimit: positiveInteger("Year of study"),
});

export const professorRegisterSchema = yup.object({
  username: requiredText("Username"),
  email,
  password,
  titulli: requiredText("Title"),
  departamenti: requiredText("Department"),
});

export const studentManagementSchema = (isEdit = false) =>
  yup.object({
    username: requiredText("Username"),
    email,
    password: isEdit ? optionalPassword : password,
    numri_studentit: requiredText("Student number"),
    programi: requiredText("Program"),
    viti_studimit: positiveInteger("Year of study"),
  });

export const professorProfileSchema = yup.object({
  username: requiredText("Username"),
  email,
  titulli: requiredText("Title"),
  departamenti: requiredText("Department"),
});

export const departmentSchema = yup.object({
  emertimi: requiredText("Department name"),
  pershkrimi: requiredText("Description"),
  shefi_departamentit: requiredText("Head of department"),
});

export const semesterSchema = yup.object({
  emertimi: requiredText("Semester name"),
  data_fillimit: requiredText("Start date"),
  data_perfundimit: requiredText("End date").test(
    "after-start",
    "End date must be after start date.",
    function (value) {
      const { data_fillimit } = this.parent;

      if (!value || !data_fillimit) {
        return true;
      }

      return new Date(value) >= new Date(data_fillimit);
    }
  ),
  statusi: requiredText("Status"),
});

export const courseSchema = yup.object({
  emertimi: requiredText("Course name"),
  pershkrimi: requiredText("Description"),
  kredite: positiveInteger("Credits"),
  professor_id: requiredText("Professor"),
  semester_id: requiredText("Semester"),
  kapaciteti: positiveInteger("Capacity"),
  cmimi: yup
    .number()
    .typeError("Price must be a number.")
    .min(0, "Price cannot be negative.")
    .required("Price is required."),
});

export const scheduleSchema = yup.object({
  course_id: requiredText("Course"),
  dita: requiredText("Day"),
  ora_fillimit: requiredText("Start time"),
  ora_perfundimit: requiredText("End time").test(
    "after-start-time",
    "End time must be after start time.",
    function (value) {
      const { ora_fillimit } = this.parent;

      if (!value || !ora_fillimit) {
        return true;
      }

      return value > ora_fillimit;
    }
  ),
  salla: requiredText("Room"),
});

export const materialSchema = yup.object({
  course_id: requiredText("Course"),
  titulli: requiredText("Material title"),
  file_url: requiredText("File link or path"),
  material_type: requiredText("Material type"),
  pershkrimi: yup.string().nullable(),
  moduli: yup.string().nullable(),
  java: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .integer("Week must be a whole number.")
    .min(1, "Week must be greater than 0."),
  duration_minutes: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? 0 : value))
    .integer("Duration must be a whole number.")
    .min(0, "Duration cannot be negative."),
  order_index: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? 0 : value))
    .integer("Order must be a whole number.")
    .min(0, "Order cannot be negative."),
});

export const announcementSchema = yup.object({
  course_id: requiredText("Course"),
  titulli: requiredText("Title"),
  permbajtja: requiredText("Comment"),
});
