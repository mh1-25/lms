import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import BASE_URL from "../../config/url";

const token = localStorage.getItem("token");

const LEVELS = ["All", "BEGINNER", "INTERMEDIATE", "ADVANCED"];

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatCount(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;
}

const LEVEL_LABEL = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

function CourseCard({ course }) {
  const studentCount = course.enrollments?.length ?? 0;

  return (
    <article className="course-card">
      <div className="course-card__thumb">
        <img src={course.thumbnailUrl} alt={course.title} loading="lazy" />
        <div className="course-card__badges">
          {course.free && <span className="badge badge--free">Free</span>}
          <span className={`badge badge--level badge--${course.level.toLowerCase()}`}>
            {LEVEL_LABEL[course.level]}
          </span>
        </div>
      </div>

      <div className="course-card__body">
        <p className="course-card__category">{course.category.name}</p>
        <h3 className="course-card__title">{course.title}</h3>
        <p className="course-card__desc">{course.description}</p>

        <p className="course-card__instructor">
          {course.instructor.firstName} {course.instructor.lastName}
        </p>

        <div className="course-card__meta">
          <span className="meta-item">
            <span className="meta-icon">▶</span>
            {course.totalLessons} lessons
          </span>
          <span className="meta-item">
            <span className="meta-icon">⏱</span>
            {formatDuration(course.totalDuration)}
          </span>
          <span className="meta-item">
            <span className="meta-icon">👤</span>
            {formatCount(studentCount)}
          </span>
        </div>

        <div className="course-card__footer">
          <Link
            className="btn-enroll db-btn-continue"
            to={`/student/details/${course.id}`}
          >
            {course.free ? "Enroll Free" : "View Course"}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function CourseCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [freeOnly, setFreeOnly] = useState(false);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const formatted = res.data.map((c) => ({
          id: c.id,
          title: c.title || "",
          description: c.description || "",
          thumbnailUrl: ` ${c.thumbnailUrl}`,
          free: c.free,
          totalLessons: c.totalLessons || 0,
          totalDuration: c.totalDuration || 0,
          level: c.level || "BEGINNER",
          instructor: {
            firstName: c.instructorName?.split(" ")[0] || "Unknown",
            lastName: c.instructorName?.split(" ")[1] || "",
          },
          category: {
            name: c.categoryName || "Unknown",
          },
          enrollments: [],
        }));
        setCourses(formatted);
      } catch (err) {
        console.log("Error fetching courses:", err);
      }
    };

    fetchCourses();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}api/categories/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
      } catch (e) {
        console.log(e);
      }
    };

    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        c.title.toLowerCase().includes(keyword) ||
        `${c.instructor.firstName} ${c.instructor.lastName}`
          .toLowerCase()
          .includes(keyword) ||
        c.category.name.toLowerCase().includes(keyword);

      const matchesCategory =
        category === "All" || c.category.name === category;

      const matchesLevel = level === "All" || c.level === level;

      const matchesFree = !freeOnly || c.free === true;

      return (
        (!search || matchesSearch) &&
        matchesCategory &&
        matchesLevel &&
        matchesFree
      );
    });
  }, [courses, search, category, level, freeOnly]);

  return (
    <div className="cd-page">
      <div className="db-hero">
        <div>
          <h1 className="db-hero__name">Course Catalog</h1>
          <p className="catalog-header__sub">
            {filtered.length} course{filtered.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      <div className="catalog-filters">
        <div className="filter-search">
          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-search__input"
          />
          {search && (
            <button className="filter-search__clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        <div className="filter-pills">
          {/* "All" pill is always first */}
          <button
            className={`pill${category === "All" ? " pill--active" : ""}`}
            onClick={() => setCategory("All")}
          >
            All
          </button>

          {/* Dynamic categories from API */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`pill${category === cat.name ? " pill--active" : ""}`}
              onClick={() => setCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <select
          className="filter-select"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l === "All" ? "All levels" : LEVEL_LABEL[l]}
            </option>
          ))}
        </select>

        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={freeOnly}
            onChange={(e) => setFreeOnly(e.target.checked)}
          />
          <span className="filter-toggle__track" />
          <span className="filter-toggle__label">Free only</span>
        </label>
      </div>

      {filtered.length > 0 ? (
        <div className="catalog-grid">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="catalog-empty">
          <p>No courses match your filters.</p>
          <button
            className="btn-reset"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setLevel("All");
              setFreeOnly(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}