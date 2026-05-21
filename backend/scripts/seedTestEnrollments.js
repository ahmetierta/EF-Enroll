const crypto = require("crypto");
const AppDataSource = require("../data-source");
const { calculateEnrollmentPricing } = require("../utils/pricing");

const testCourseName = "Small Capacity Testing Course";

const extraCourses = [
  {
    name: "Python for Data Science",
    description:
      "Python, notebooks, data cleaning, visualization, and practical analysis projects.",
    credits: 6,
    capacity: 24,
    price: 160,
    professorEmail: "nora.professor@ef-enroll.test",
    schedule: {
      day: "Monday",
      startsAt: "14:00:00",
      endsAt: "15:30:00",
      room: "Data Lab",
    },
  },
  {
    name: "UI UX Design",
    description:
      "User research, wireframes, prototypes, usability testing, and interface design.",
    credits: 5,
    capacity: 18,
    price: 140,
    professorEmail: "elira.professor@ef-enroll.test",
    schedule: {
      day: "Tuesday",
      startsAt: "12:00:00",
      endsAt: "13:30:00",
      room: "Design Studio",
    },
  },
  {
    name: "Cybersecurity Fundamentals",
    description:
      "Security basics, authentication, network risks, OWASP concepts, and safe systems.",
    credits: 6,
    capacity: 20,
    price: 180,
    professorEmail: "arben.professor@ef-enroll.test",
    schedule: {
      day: "Wednesday",
      startsAt: "15:00:00",
      endsAt: "16:30:00",
      room: "Security Lab",
    },
  },
  {
    name: "Cloud Computing",
    description:
      "Cloud services, deployment models, scaling, storage, containers, and monitoring.",
    credits: 5,
    capacity: 22,
    price: 190,
    professorEmail: "ilir.professor@ef-enroll.test",
    schedule: {
      day: "Thursday",
      startsAt: "10:00:00",
      endsAt: "11:30:00",
      room: "Cloud Lab",
    },
  },
  {
    name: "Digital Marketing",
    description:
      "Campaign planning, audience research, SEO, analytics, and marketing funnels.",
    credits: 4,
    capacity: 28,
    price: 110,
    professorEmail: "besart.professor@ef-enroll.test",
    schedule: {
      day: "Friday",
      startsAt: "12:00:00",
      endsAt: "13:30:00",
      room: "Room 6",
    },
  },
];

const materials = [
  {
    courseName: "Introduction to Programming",
    title: "Week 1 Slides - Variables and Control Flow",
    url: "https://example.com/materials/programming-week-1-slides.pdf",
    type: "slides",
    module: "Programming Basics",
    week: 1,
    duration: 45,
    required: true,
    order: 1,
  },
  {
    courseName: "Introduction to Programming",
    title: "Assignment - Build a Console Calculator",
    url: "https://example.com/materials/programming-calculator-assignment.pdf",
    type: "assignment",
    module: "Practice",
    week: 2,
    duration: 120,
    required: true,
    order: 2,
  },
  {
    courseName: "Web Development",
    title: "HTML CSS Starter Pack",
    url: "https://example.com/materials/web-html-css-starter.zip",
    type: "resource",
    module: "Frontend Foundations",
    week: 1,
    duration: 60,
    required: true,
    order: 1,
  },
  {
    courseName: "Web Development",
    title: "React Components Reading",
    url: "https://example.com/materials/react-components-reading.pdf",
    type: "reading",
    module: "React",
    week: 3,
    duration: 50,
    required: true,
    order: 2,
  },
  {
    courseName: "Database Systems",
    title: "ER Diagram Workshop",
    url: "https://example.com/materials/database-er-diagram-workshop.pdf",
    type: "slides",
    module: "Data Modeling",
    week: 2,
    duration: 70,
    required: true,
    order: 1,
  },
  {
    courseName: "Database Systems",
    title: "SQL Joins Quiz",
    url: "https://example.com/materials/sql-joins-quiz",
    type: "quiz",
    module: "SQL",
    week: 4,
    duration: 30,
    required: true,
    order: 2,
  },
  {
    courseName: "Data Analytics",
    title: "Dashboard Design Checklist",
    url: "https://example.com/materials/dashboard-design-checklist.pdf",
    type: "resource",
    module: "Dashboards",
    week: 3,
    duration: 40,
    required: false,
    order: 1,
  },
  {
    courseName: "Business Management",
    title: "Case Study - Team Planning",
    url: "https://example.com/materials/business-team-planning-case.pdf",
    type: "reading",
    module: "Management Cases",
    week: 2,
    duration: 55,
    required: true,
    order: 1,
  },
  {
    courseName: "Python for Data Science",
    title: "Python Notebook Setup",
    url: "https://example.com/materials/python-notebook-setup.pdf",
    type: "resource",
    module: "Environment Setup",
    week: 1,
    duration: 35,
    required: true,
    order: 1,
  },
  {
    courseName: "Python for Data Science",
    title: "Pandas Cleaning Assignment",
    url: "https://example.com/materials/pandas-cleaning-assignment.ipynb",
    type: "assignment",
    module: "Data Cleaning",
    week: 3,
    duration: 120,
    required: true,
    order: 2,
  },
  {
    courseName: "UI UX Design",
    title: "Wireframe Template Pack",
    url: "https://example.com/materials/wireframe-template-pack.fig",
    type: "resource",
    module: "Wireframes",
    week: 2,
    duration: 45,
    required: false,
    order: 1,
  },
  {
    courseName: "UI UX Design",
    title: "Usability Testing Guide",
    url: "https://example.com/materials/usability-testing-guide.pdf",
    type: "reading",
    module: "Testing",
    week: 4,
    duration: 65,
    required: true,
    order: 2,
  },
  {
    courseName: "Cybersecurity Fundamentals",
    title: "OWASP Top 10 Overview",
    url: "https://example.com/materials/owasp-top-10-overview.pdf",
    type: "slides",
    module: "Web Security",
    week: 3,
    duration: 75,
    required: true,
    order: 1,
  },
  {
    courseName: "Cloud Computing",
    title: "Deployment Architecture Video",
    url: "https://example.com/materials/cloud-deployment-architecture-video",
    type: "video",
    module: "Cloud Architecture",
    week: 2,
    duration: 50,
    required: true,
    order: 1,
  },
  {
    courseName: "Digital Marketing",
    title: "SEO Audit Checklist",
    url: "https://example.com/materials/seo-audit-checklist.pdf",
    type: "resource",
    module: "SEO",
    week: 3,
    duration: 40,
    required: true,
    order: 1,
  },
];

const paidScenarios = [
  {
    studentEmail: "arta.student@ef-enroll.test",
    courseName: "Introduction to Programming",
    durationMonths: 3,
    paymentMethod: "card",
  },
  {
    studentEmail: "diona.student@ef-enroll.test",
    courseName: "Data Analytics",
    durationMonths: 1,
    paymentMethod: "bank_transfer",
  },
  {
    studentEmail: "blerta.student@ef-enroll.test",
    courseName: "Database Systems",
    durationMonths: 6,
    paymentMethod: "cash",
  },
];

const unpaidScenarios = [
  {
    studentEmail: "luan.student@ef-enroll.test",
    courseName: "Web Development",
    durationMonths: 6,
  },
  {
    studentEmail: "erion.student@ef-enroll.test",
    courseName: "Business Management",
    durationMonths: 12,
  },
];

const smallCourseEnrollments = [
  "arta.student@ef-enroll.test",
  "luan.student@ef-enroll.test",
];

const smallCourseWaitingList = [
  "diona.student@ef-enroll.test",
  "erion.student@ef-enroll.test",
  "blerta.student@ef-enroll.test",
];

function createInvoiceNumber(enrollmentId) {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `INV-${year}-${String(enrollmentId).padStart(6, "0")}-${randomPart}`;
}

function createTransactionId(method) {
  return `${String(method || "SIM").toUpperCase()}-${crypto
    .randomBytes(6)
    .toString("hex")
    .toUpperCase()}`;
}

async function getStudentByEmail(manager, email) {
  return manager.getRepository("Student").findOne({
    where: { user: { email } },
    relations: { user: true },
  });
}

async function getCourseByName(manager, courseName) {
  return manager.getRepository("Course").findOne({
    where: { emertimi: courseName },
    relations: {
      professor: {
        user: true,
      },
      semester: true,
    },
  });
}

async function ensureSmallCapacityCourse(manager) {
  const courseRepository = manager.getRepository("Course");
  const scheduleRepository = manager.getRepository("Schedule");
  const existingCourse = await getCourseByName(manager, testCourseName);

  if (existingCourse) {
    return existingCourse;
  }

  const professor = await manager.getRepository("Professor").findOne({
    where: { user: { email: "elira.professor@ef-enroll.test" } },
    relations: { user: true },
  });
  const semester = await manager.getRepository("Semester").findOneBy({
    emertimi: "Spring 2026",
  });

  if (!professor || !semester) {
    throw new Error("Demo professor or semester is missing. Run backend/database.sql first.");
  }

  const course = await courseRepository.save({
    emertimi: testCourseName,
    pershkrimi:
      "Short test course with capacity 2, used for enrollment and waiting list testing.",
    kredite: 3,
    kapaciteti: 2,
    cmimi: 80,
    professor,
    semester,
  });

  await scheduleRepository.save({
    course,
    dita: "Saturday",
    ora_fillimit: "10:00:00",
    ora_perfundimit: "12:00:00",
    salla: "Lab Test",
  });

  return course;
}

async function ensureCourse(manager, courseData) {
  const existingCourse = await getCourseByName(manager, courseData.name);

  if (existingCourse) {
    return existingCourse;
  }

  const professor = await manager.getRepository("Professor").findOne({
    where: { user: { email: courseData.professorEmail } },
    relations: { user: true },
  });
  const semester = await manager.getRepository("Semester").findOneBy({
    emertimi: "Spring 2026",
  });

  if (!professor || !semester) {
    throw new Error(`Missing professor or semester for course: ${courseData.name}`);
  }

  const course = await manager.getRepository("Course").save({
    emertimi: courseData.name,
    pershkrimi: courseData.description,
    kredite: courseData.credits,
    kapaciteti: courseData.capacity,
    cmimi: courseData.price,
    professor,
    semester,
  });

  await manager.getRepository("Schedule").save({
    course,
    dita: courseData.schedule.day,
    ora_fillimit: courseData.schedule.startsAt,
    ora_perfundimit: courseData.schedule.endsAt,
    salla: courseData.schedule.room,
  });

  return course;
}

async function ensureMaterial(manager, materialData) {
  const course = await getCourseByName(manager, materialData.courseName);

  if (!course) {
    throw new Error(`Course missing for material: ${materialData.courseName}`);
  }

  const materialRepository = manager.getRepository("CourseMaterial");
  const existingMaterial = await materialRepository.findOne({
    where: {
      course: { id: course.id },
      titulli: materialData.title,
    },
  });

  if (existingMaterial) {
    return existingMaterial;
  }

  return materialRepository.save({
    course,
    professor: course.professor,
    titulli: materialData.title,
    file_url: materialData.url,
    material_type: materialData.type,
    pershkrimi: `${materialData.module} material for ${materialData.courseName}.`,
    moduli: materialData.module,
    java: materialData.week,
    duration_minutes: materialData.duration,
    is_required: materialData.required,
    order_index: materialData.order,
  });
}

async function ensureEnrollment(manager, studentEmail, courseName, durationMonths) {
  const student = await getStudentByEmail(manager, studentEmail);
  const course = await getCourseByName(manager, courseName);

  if (!student) {
    throw new Error(`Student missing: ${studentEmail}`);
  }

  if (!course) {
    throw new Error(`Course missing: ${courseName}`);
  }

  const enrollmentRepository = manager.getRepository("Enrollment");
  const existingEnrollment = await enrollmentRepository.findOne({
    where: {
      student: { id: student.id },
      course: { id: course.id },
    },
    relations: {
      student: {
        user: true,
      },
      course: true,
    },
  });

  if (existingEnrollment) {
    return existingEnrollment;
  }

  const existingStudentEnrollments = await enrollmentRepository.count({
    where: {
      student: { id: student.id },
    },
  });
  const pricing = calculateEnrollmentPricing(
    course,
    durationMonths,
    existingStudentEnrollments > 0
  );

  return enrollmentRepository.save({
    student,
    course,
    data_regjistrimit: new Date().toISOString().slice(0, 10),
    statusi: "active",
    kohezgjatja_muaj: durationMonths,
    cmimi_baze: pricing.baseAmount,
    zbritja_perqindje: pricing.discountPercent,
    cmimi_final: pricing.finalAmount,
    oferta_fillestare: pricing.isFirstTimeOffer,
  });
}

async function ensurePaidPayment(manager, enrollment, paymentMethod) {
  const paymentRepository = manager.getRepository("Payment");
  const existingPayment = await paymentRepository.findOne({
    where: {
      enrollment: { id: enrollment.id },
      statusi: "paid",
    },
  });

  if (existingPayment) {
    return existingPayment;
  }

  return paymentRepository.save({
    enrollment,
    amount: Number(enrollment.cmimi_final || 0),
    statusi: "paid",
    payment_method: paymentMethod,
    invoice_number: createInvoiceNumber(enrollment.id),
    transaction_id: createTransactionId(paymentMethod),
    currency: "EUR",
    payer_name: enrollment.student?.user?.username,
    payer_email: enrollment.student?.user?.email,
    notes: "Seeded payment for backend test flow",
  });
}

async function ensureWaitingListItem(manager, studentEmail, courseName) {
  const student = await getStudentByEmail(manager, studentEmail);
  const course = await getCourseByName(manager, courseName);

  if (!student || !course) {
    throw new Error(`Missing student or course for waiting list: ${studentEmail}`);
  }

  const waitingRepository = manager.getRepository("WaitingList");
  const enrollmentRepository = manager.getRepository("Enrollment");
  const existingEnrollment = await enrollmentRepository.findOne({
    where: {
      student: { id: student.id },
      course: { id: course.id },
    },
  });

  if (existingEnrollment) {
    return null;
  }

  const existingWaitingListItem = await waitingRepository.findOne({
    where: {
      student: { id: student.id },
      course: { id: course.id },
    },
  });

  if (existingWaitingListItem) {
    return existingWaitingListItem;
  }

  const pozicioni =
    (await waitingRepository.count({
      where: { course: { id: course.id } },
    })) + 1;

  return waitingRepository.save({
    student,
    course,
    data: new Date().toISOString().slice(0, 10),
    pozicioni,
    statusi: "waiting",
    prioriteti: pozicioni === 1 ? "high" : "normal",
    arsyeja: "Seeded waiting list entry for capacity testing",
    njofto_me_email: true,
  });
}

async function seedTestData() {
  await AppDataSource.initialize();

  try {
    await AppDataSource.transaction(async (manager) => {
      await ensureSmallCapacityCourse(manager);

      for (const course of extraCourses) {
        await ensureCourse(manager, course);
      }

      for (const material of materials) {
        await ensureMaterial(manager, material);
      }

      for (const scenario of paidScenarios) {
        const enrollment = await ensureEnrollment(
          manager,
          scenario.studentEmail,
          scenario.courseName,
          scenario.durationMonths
        );

        await ensurePaidPayment(manager, enrollment, scenario.paymentMethod);
      }

      for (const scenario of unpaidScenarios) {
        await ensureEnrollment(
          manager,
          scenario.studentEmail,
          scenario.courseName,
          scenario.durationMonths
        );
      }

      for (const studentEmail of smallCourseEnrollments) {
        await ensureEnrollment(manager, studentEmail, testCourseName, 1);
      }

      for (const studentEmail of smallCourseWaitingList) {
        await ensureWaitingListItem(manager, studentEmail, testCourseName);
      }
    });

    console.log(
      "Test courses, materials, enrollments, payments, and waiting list data seeded."
    );
  } finally {
    await AppDataSource.destroy();
  }
}

seedTestData().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
