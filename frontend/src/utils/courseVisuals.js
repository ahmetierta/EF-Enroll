export const courseImages = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
];

export function getCourseImage(course, fallbackIndex = 0) {
  const numericId = Number(course?.id || fallbackIndex);
  const index = Math.abs(numericId || fallbackIndex) % courseImages.length;

  return courseImages[index];
}

export function formatCoursePrice(course) {
  return Number(course?.cmimi || 0) === 0
    ? "Free"
    : `${Number(course?.cmimi || 0).toFixed(2)} EUR`;
}

export function formatSchedule(schedule) {
  const start = String(schedule?.ora_fillimit || "").slice(0, 5);
  const end = String(schedule?.ora_perfundimit || "").slice(0, 5);
  const time = start && end ? `${start}-${end}` : "Time not set";

  return [schedule?.dita, time, schedule?.salla].filter(Boolean).join(", ");
}

export function getCourseScheduleLabel(course) {
  if (course?.schedule_summary) {
    return course.schedule_summary;
  }

  if (course?.schedules?.length) {
    return course.schedules.map(formatSchedule).join("; ");
  }

  return "No schedule set";
}
