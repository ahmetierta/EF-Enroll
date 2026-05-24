const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MIN_STUDY_YEAR = 1;
const MAX_STUDY_YEAR = 5;

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeStudentPayload(body) {
  return {
    username: String(body.username || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    password: body.password || body.password_hash || "",
    numri_studentit: String(body.numri_studentit || "").trim(),
    programi: String(body.programi || "").trim(),
    viti_studimit:
      body.viti_studimit === "" || body.viti_studimit === null
        ? null
        : Number(body.viti_studimit),
  };
}

function validateStudentPayload(payload, requirePassword = true) {
  if (!payload.username || !payload.email) {
    return "Username and email are required";
  }

  if (!EMAIL_PATTERN.test(payload.email)) {
    return "Enter a valid student email address";
  }

  if (requirePassword && !payload.password) {
    return "Password is required";
  }

  if (payload.password && payload.password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  if (!payload.numri_studentit || !payload.programi) {
    return "Student number and program are required";
  }

  if (
    !Number.isInteger(payload.viti_studimit) ||
    payload.viti_studimit < MIN_STUDY_YEAR ||
    payload.viti_studimit > MAX_STUDY_YEAR
  ) {
    return `Year of study must be between ${MIN_STUDY_YEAR} and ${MAX_STUDY_YEAR}`;
  }

  return null;
}

async function assertStudentUniqueness(
  manager,
  { email, numri_studentit },
  { excludeUserId = null, excludeStudentId = null } = {}
) {
  const userRepository = manager.getRepository("User");
  const studentRepository = manager.getRepository("Student");

  const emailQuery = userRepository
    .createQueryBuilder("user")
    .where("LOWER(user.email) = LOWER(:email)", { email });

  if (excludeUserId) {
    emailQuery.andWhere("user.id != :excludeUserId", { excludeUserId });
  }

  const existingUser = await emailQuery.getOne();

  if (existingUser) {
    throw createHttpError(409, "A user with this email already exists");
  }

  const numberQuery = studentRepository
    .createQueryBuilder("student")
    .where("LOWER(student.numri_studentit) = LOWER(:studentNumber)", {
      studentNumber: numri_studentit,
    });

  if (excludeStudentId) {
    numberQuery.andWhere("student.id != :excludeStudentId", {
      excludeStudentId,
    });
  }

  const existingStudent = await numberQuery.getOne();

  if (existingStudent) {
    throw createHttpError(409, "A student with this student number already exists");
  }
}

function mapStudent(student) {
  return {
    id: student.id,
    user_id: student.user?.id || null,
    numri_studentit: student.numri_studentit,
    programi: student.programi,
    viti_studimit: student.viti_studimit,
    username: student.user?.username || null,
    email: student.user?.email || null,
  };
}

function getQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function addStudentFilters(query, filters) {
  const search = getQueryValue(filters.search)?.trim();
  const courseId = getQueryValue(filters.course_id);
  const program = getQueryValue(filters.programi);
  const studyYear = getQueryValue(filters.viti_studimit);
  const enrollmentStatus = getQueryValue(filters.statusi);
  const paymentStatus = getQueryValue(filters.payment_status);

  if (search) {
    query.andWhere(
      "(user.username LIKE :search OR user.email LIKE :search OR student.numri_studentit LIKE :search)",
      { search: `%${search}%` }
    );
  }

  if (courseId) {
    query.andWhere("course.id = :courseId", { courseId: Number(courseId) });
  }

  if (program) {
    query.andWhere("student.programi = :program", { program });
  }

  if (studyYear) {
    query.andWhere("student.viti_studimit = :studyYear", {
      studyYear: Number(studyYear),
    });
  }

  if (enrollmentStatus) {
    query.andWhere("enrollment.statusi = :enrollmentStatus", {
      enrollmentStatus,
    });
  }

  if (paymentStatus === "paid") {
    query
      .andWhere("enrollment.id IS NOT NULL")
      .andWhere("payment.statusi = :paymentStatus", { paymentStatus: "paid" });
  }

  if (paymentStatus === "unpaid") {
    query
      .andWhere("enrollment.id IS NOT NULL")
      .andWhere("(payment.id IS NULL OR payment.statusi != :paymentStatus)", {
        paymentStatus: "paid",
      });
  }
}

function addStudentSorting(query, filters) {
  const sortBy = getQueryValue(filters.sort_by) || "newest";
  const sortOrder = getQueryValue(filters.sort_order) === "asc" ? "ASC" : "DESC";
  const sortColumns = {
    newest: "student.id",
    username: "user.username",
    student_number: "student.numri_studentit",
    program: "student.programi",
    year: "student.viti_studimit",
  };

  query.orderBy(sortColumns[sortBy] || sortColumns.newest, sortOrder);
}

// GET all students for admin, or only enrolled students for professor
router.get("/", requireRole("admin", "professor"), async (req, res) => {
  try {
    const studentRepository = AppDataSource.getRepository("Student");
    const query = studentRepository
      .createQueryBuilder("student")
      .leftJoinAndSelect("student.user", "user")
      .leftJoin("student.enrollments", "enrollment")
      .leftJoin("enrollment.course", "course")
      .leftJoin("course.professor", "professor")
      .leftJoin("professor.user", "professorUser")
      .leftJoin("enrollment.payments", "payment")
      .distinct(true)
      .where("1 = 1");

    if (req.user.role === "professor") {
      query.andWhere("professorUser.id = :userId", { userId: req.user.id });
    }

    addStudentFilters(query, req.query);
    addStudentSorting(query, req.query);

    const students = await query.getMany();

    res.json(students.map(mapStudent));
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET student by id with user info
router.get("/:id", requireRole("admin", "professor"), async (req, res) => {
  try {
    const studentRepository = AppDataSource.getRepository("Student");
    let student;

    if (req.user.role === "professor") {
      student = await studentRepository
        .createQueryBuilder("student")
        .leftJoinAndSelect("student.user", "user")
        .innerJoin("student.enrollments", "enrollment")
        .innerJoin("enrollment.course", "course")
        .innerJoin("course.professor", "professor")
        .innerJoin("professor.user", "professorUser")
        .where("student.id = :studentId", { studentId: Number(req.params.id) })
        .andWhere("professorUser.id = :userId", { userId: req.user.id })
        .getOne();
    } else {
      student = await studentRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: { user: true },
      });
    }

    res.json(student ? [mapStudent(student)] : []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create user + student
router.post("/", requireRole("admin"), async (req, res) => {
  const payload = normalizeStudentPayload(req.body);
  const validationError = validateStudentPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const { user, student } = await AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository("User");
      const studentRepository = manager.getRepository("Student");

      await assertStudentUniqueness(manager, payload);

      const savedUser = await userRepository.save({
        username: payload.username,
        email: payload.email,
        password_hash: bcrypt.hashSync(payload.password, 10),
        role: "student",
        status: "approved",
      });

      const savedStudent = await studentRepository.save({
        user: savedUser,
        numri_studentit: payload.numri_studentit,
        programi: payload.programi,
        viti_studimit: payload.viti_studimit,
      });

      return { user: savedUser, student: savedStudent };
    });

    res.json({
      message: "User dhe studenti u krijuan me sukses",
      user_id: user.id,
      student_id: student.id,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Failed to create student",
    });
  }
});

// PUT update user + student
router.put("/:id", requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizeStudentPayload(req.body);
  const validationError = validateStudentPayload(payload, false);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Student id is not valid" });
  }

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const result = await AppDataSource.transaction(async (manager) => {
      const studentRepository = manager.getRepository("Student");
      const userRepository = manager.getRepository("User");
      const student = await studentRepository.findOne({
        where: { id },
        relations: { user: true },
      });

      if (!student) {
        return null;
      }

      await assertStudentUniqueness(manager, payload, {
        excludeUserId: student.user?.id,
        excludeStudentId: id,
      });

      const userUpdateData = {
        username: payload.username,
        email: payload.email,
      };

      if (payload.password) {
        userUpdateData.password_hash = bcrypt.hashSync(payload.password, 10);
      }

      const userResult = await userRepository.update(student.user.id, userUpdateData);
      const studentResult = await studentRepository.update(id, {
        numri_studentit: payload.numri_studentit,
        programi: payload.programi,
        viti_studimit: payload.viti_studimit,
      });

      return { userResult, studentResult };
    });

    if (!result) {
      return res.status(404).json({ message: "Studenti nuk u gjet" });
    }

    res.json({
      message: "User dhe studenti u perditesuan me sukses",
      ...result,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Failed to update student",
    });
  }
});

// DELETE student + user
router.delete("/:id", requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await AppDataSource.transaction(async (manager) => {
      const studentRepository = manager.getRepository("Student");
      const userRepository = manager.getRepository("User");
      const student = await studentRepository.findOne({
        where: { id },
        relations: { user: true },
      });

      if (!student) {
        return null;
      }

      const userId = student.user?.id;
      const studentResult = await studentRepository.delete(id);
      const userResult = userId ? await userRepository.delete(userId) : null;

      return { studentResult, userResult };
    });

    if (!result) {
      return res.status(404).json({ message: "Studenti nuk u gjet" });
    }

    res.json({
      message: "Studenti dhe user-i u fshine me sukses",
      ...result,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
