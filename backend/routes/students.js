const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");

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

// GET all students with user info
router.get("/", async (req, res) => {
  try {
    const students = await AppDataSource.getRepository("Student").find({
      relations: { user: true },
      order: { id: "DESC" },
    });

    res.json(students.map(mapStudent));
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET student by id with user info
router.get("/:id", async (req, res) => {
  try {
    const student = await AppDataSource.getRepository("Student").findOne({
      where: { id: Number(req.params.id) },
      relations: { user: true },
    });

    res.json(student ? [mapStudent(student)] : []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create user + student
router.post("/", async (req, res) => {
  const {
    username,
    email,
    password_hash,
    numri_studentit,
    programi,
    viti_studimit,
  } = req.body;

  try {
    const { user, student } = await AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository("User");
      const studentRepository = manager.getRepository("Student");

      const savedUser = await userRepository.save({
        username,
        email,
        password_hash,
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
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const {
    username,
    email,
    password_hash,
    numri_studentit,
    programi,
    viti_studimit,
  } = req.body;

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

      const userResult = await userRepository.update(student.user.id, {
        username,
        email,
        password_hash,
      });
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
router.delete("/:id", async (req, res) => {
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
