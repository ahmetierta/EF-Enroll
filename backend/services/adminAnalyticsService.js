async function getScalar(manager, query, params = []) {
  const rows = await manager.query(query, params);
  const firstRow = rows?.[0] || {};
  const firstValue = Object.values(firstRow)[0];

  return Number(firstValue || 0);
}

async function getAdminDashboardSummary(manager) {
  const [
    totalStudents,
    totalProfessors,
    pendingProfessors,
    totalCourses,
    scheduledCourses,
    activeEnrollments,
    unpaidEnrollments,
    waitingListCount,
    paidPayments,
    refundedPayments,
    totalRevenue,
    refundAmount,
    coursesNearCapacity,
    topCourses,
    recentPayments,
  ] = await Promise.all([
    getScalar(manager, "SELECT COUNT(*) AS total FROM students"),
    getScalar(manager, "SELECT COUNT(*) AS total FROM professors"),
    getScalar(
      manager,
      "SELECT COUNT(*) AS total FROM users WHERE role = 'professor' AND status = 'pending'"
    ),
    getScalar(manager, "SELECT COUNT(*) AS total FROM courses"),
    getScalar(
      manager,
      "SELECT COUNT(DISTINCT course_id) AS total FROM schedules"
    ),
    getScalar(
      manager,
      "SELECT COUNT(*) AS total FROM enrollments WHERE statusi = 'active'"
    ),
    getScalar(
      manager,
      `SELECT COUNT(*) AS total
       FROM enrollments e
       WHERE e.statusi = 'active'
         AND NOT EXISTS (
           SELECT 1
           FROM payments p
           WHERE p.enrollment_id = e.id
             AND p.statusi = 'paid'
         )`
    ),
    getScalar(manager, "SELECT COUNT(*) AS total FROM waiting_list"),
    getScalar(
      manager,
      "SELECT COUNT(*) AS total FROM payments WHERE statusi = 'paid'"
    ),
    getScalar(
      manager,
      "SELECT COUNT(*) AS total FROM payments WHERE statusi = 'refunded'"
    ),
    getScalar(
      manager,
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE statusi = 'paid'"
    ),
    getScalar(
      manager,
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE statusi = 'refunded'"
    ),
    manager.query(`
      SELECT
        c.id,
        c.emertimi AS course_name,
        c.kapaciteti AS capacity,
        COUNT(e.id) AS active_enrollments,
        GREATEST(c.kapaciteti - COUNT(e.id), 0) AS available_seats
      FROM courses c
      LEFT JOIN enrollments e
        ON e.course_id = c.id
       AND e.statusi = 'active'
      WHERE c.kapaciteti > 0
      GROUP BY c.id, c.emertimi, c.kapaciteti
      HAVING available_seats <= 3
      ORDER BY available_seats ASC, active_enrollments DESC
      LIMIT 5
    `),
    manager.query(`
      SELECT
        c.id,
        c.emertimi AS course_name,
        COUNT(e.id) AS enrollments_count,
        COALESCE(SUM(CASE WHEN p.statusi = 'paid' THEN p.amount ELSE 0 END), 0) AS revenue
      FROM courses c
      LEFT JOIN enrollments e
        ON e.course_id = c.id
       AND e.statusi = 'active'
      LEFT JOIN payments p
        ON p.enrollment_id = e.id
      GROUP BY c.id, c.emertimi
      ORDER BY enrollments_count DESC, revenue DESC
      LIMIT 5
    `),
    manager.query(`
      SELECT
        p.id,
        p.amount,
        p.statusi,
        p.payment_method,
        p.invoice_number,
        p.data_pageses,
        u.username AS student_name,
        c.emertimi AS course_name
      FROM payments p
      INNER JOIN enrollments e ON e.id = p.enrollment_id
      INNER JOIN students s ON s.id = e.student_id
      INNER JOIN users u ON u.id = s.user_id
      INNER JOIN courses c ON c.id = e.course_id
      ORDER BY p.data_pageses DESC, p.id DESC
      LIMIT 5
    `),
  ]);

  return {
    totals: {
      students: totalStudents,
      professors: totalProfessors,
      pending_professors: pendingProfessors,
      courses: totalCourses,
      scheduled_courses: scheduledCourses,
      active_enrollments: activeEnrollments,
      unpaid_enrollments: unpaidEnrollments,
      waiting_list: waitingListCount,
      paid_payments: paidPayments,
      refunded_payments: refundedPayments,
      total_revenue: totalRevenue,
      refunded_amount: refundAmount,
    },
    courses_near_capacity: coursesNearCapacity.map((course) => ({
      ...course,
      capacity: Number(course.capacity || 0),
      active_enrollments: Number(course.active_enrollments || 0),
      available_seats: Number(course.available_seats || 0),
    })),
    top_courses: topCourses.map((course) => ({
      ...course,
      enrollments_count: Number(course.enrollments_count || 0),
      revenue: Number(course.revenue || 0),
    })),
    recent_payments: recentPayments,
  };
}

module.exports = {
  getAdminDashboardSummary,
};
