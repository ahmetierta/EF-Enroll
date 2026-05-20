const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

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
  const {
    username,
    email,
    password,
    password_hash,
    numri_studentit,
    programi,
    viti_studimit,
  } = req.body;
  const rawPassword = password || password_hash;

  if (!username || !email || !rawPassword) {
    return res.status(400).json({
      message: "Username, email and password are required",
    });
  }

  try {
    const { user, student } = await AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository("User");
      const studentRepository = manager.getRepository("Student");

      const savedUser = await userRepository.save({
        username,
        email,
        password_hash: bcrypt.hashSync(rawPassword, 10),
        role: "student",
        status: "approved",
      });

      const savedStudent = await studentRepository.save({
        user: savedUser,
        numri_studentit,
        programi,
        viti_studimit,
      });

      return { user: savedUser, student: savedStudent };
    });

    res.json({
      message: "User dhe studenti u krijuan me sukses",
      user_id: user.id,
      student_id: student.id,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// PUT update user + student
router.put("/:id", requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const {
    username,
    email,
    password,
    password_hash,
    numri_studentit,
    programi,
    viti_studimit,
  } = req.body;
  const rawPassword = password || password_hash;

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

      const userUpdateData = {
        username,
        email,
      };

      if (rawPassword) {
        userUpdateData.password_hash = bcrypt.hashSync(rawPassword, 10);
      }

      const userResult = await userRepository.update(student.user.id, userUpdateData);
      const studentResult = await studentRepository.update(id, {
        numri_studentit,
        programi,
        viti_studimit,
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
    res.status(500).json(err);
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
