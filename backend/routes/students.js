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

// GET all students for admin, or only enrolled students for professor
router.get("/", requireRole("admin", "professor"), async (req, res) => {
  try {
    const studentRepository = AppDataSource.getRepository("Student");
    let students;

    if (req.user.role === "professor") {
      students = await studentRepository
        .createQueryBuilder("student")
        .leftJoinAndSelect("student.user", "user")
        .innerJoin("student.enrollments", "enrollment")
        .innerJoin("enrollment.course", "course")
        .innerJoin("course.professor", "professor")
        .innerJoin("professor.user", "professorUser")
        .where("professorUser.id = :userId", { userId: req.user.id })
        .distinct(true)
        .orderBy("student.id", "DESC")
        .getMany();
    } else {
      students = await studentRepository.find({
        relations: { user: true },
        order: { id: "DESC" },
      });
    }

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
