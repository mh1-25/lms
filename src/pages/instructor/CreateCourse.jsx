import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./instructor.css";
import axios from "axios";
import { useEffect } from "react";
import BASE_URL from "../../config/url";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const LEVEL_LABEL = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };

const user = JSON.parse(localStorage.getItem("user"));
const instructorId = user?.id;
const STEPS = [
  { id: 1, label: "Basics", icon: "" },
  { id: 2, label: "Media", icon: "" },
  { id: 3, label: "Pricing", icon: "" },
  { id: 4, label: "Publish", icon: "" },
];

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  description: "",
  category: "",
  categoryId: "",
  level: "BEGINNER",
  language: "English",
  tags: "",
  thumbnailFile: null,
  thumbnailPreview: null,
  promoVideoUrl: "",
  price: "",
  isFree: false,
  published: false,
  totalLessons: "",
  totalDuration: "",
};

const EMPTY_LESSON = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  duration: "",
  lessonOrder: "",
  preview: false,
};


function AddLessonModal({ course, onClose, token }) {
  const [lesson, setLesson] = useState(EMPTY_LESSON);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const onChange = (key, value) => {
    setLesson((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!lesson.title.trim()) e.title = "Title is required";
    if (!lesson.description.trim()) e.description = "Description is required";
    if (!lesson.videoUrl.trim()) e.videoUrl = "Video URL is required";
    if (!lesson.duration) e.duration = "Duration is required";
    if (!lesson.lessonOrder) e.lessonOrder = "Lesson order is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await axios.post(
        `${BASE_URL}api/lessons/create`,
        {
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.videoUrl,
          thumbnailUrl: lesson.thumbnailUrl || lesson.videoUrl,
          duration: parseInt(lesson.duration),
          lessonOrder: parseInt(lesson.lessonOrder),
          instructorid: 6,
          courseId: course.id,
          Preview: lesson.preview,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Error creating lesson: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cf-overlay" onClick={onClose}>
      <div className="cf-modal" onClick={(e) => e.stopPropagation()}>

        <div className="cf-modal__header">
          <div>
            <p className="cf-modal__kicker">Course: {course.title}</p>
            <h2 className="cf-modal__title"> Add New Lesson</h2>
          </div>
          <button className="cf-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="cf-modal__body">
          <div className="cf-step-body">

            <div className="cf-field">
              <label className="cf-label">Lesson Title <span className="cf-required">*</span></label>
              <input
                className={`cf-input ${errors.title ? "cf-input--error" : ""}`}
                placeholder="e.g. Introduction to Spring Boot"
                value={lesson.title}
                onChange={(e) => onChange("title", e.target.value)}
              />
              {errors.title && <p className="cf-error">{errors.title}</p>}
            </div>

            <div className="cf-field">
              <label className="cf-label">Description <span className="cf-required">*</span></label>
              <textarea
                className={`cf-textarea ${errors.description ? "cf-input--error" : ""}`}
                placeholder="What will students learn in this lesson?"
                rows={3}
                value={lesson.description}
                onChange={(e) => onChange("description", e.target.value)}
              />
              {errors.description && <p className="cf-error">{errors.description}</p>}
            </div>

            <div className="cf-field">
              <label className="cf-label">Video URL <span className="cf-required">*</span></label>
              <input
                className={`cf-input ${errors.videoUrl ? "cf-input--error" : ""}`}
                placeholder="https://youtube.com/watch?v=..."
                value={lesson.videoUrl}
                onChange={(e) => onChange("videoUrl", e.target.value)}
              />
              {errors.videoUrl && <p className="cf-error">{errors.videoUrl}</p>}
            </div>

            <div className="cf-field">
              <label className="cf-label">Thumbnail URL</label>
              <input
                className="cf-input"
                placeholder="https://example.com/images/thumb.png (optional)"
                value={lesson.thumbnailUrl}
                onChange={(e) => onChange("thumbnailUrl", e.target.value)}
              />
              <p className="cf-hint">Leave empty to use the video URL as fallback</p>
            </div>

            <div className="cf-row">
              <div className="cf-field">
                <label className="cf-label">Duration (minutes) <span className="cf-required">*</span></label>
                <input
                  type="number"
                  className={`cf-input ${errors.duration ? "cf-input--error" : ""}`}
                  placeholder="15"
                  min="1"
                  value={lesson.duration}
                  onChange={(e) => onChange("duration", e.target.value)}
                />
                {errors.duration && <p className="cf-error">{errors.duration}</p>}
              </div>

              <div className="cf-field">
                <label className="cf-label">Lesson Order <span className="cf-required">*</span></label>
                <input
                  type="number"
                  className={`cf-input ${errors.lessonOrder ? "cf-input--error" : ""}`}
                  placeholder="1"
                  min="1"
                  value={lesson.lessonOrder}
                  onChange={(e) => onChange("lessonOrder", e.target.value)}
                />
                {errors.lessonOrder && <p className="cf-error">{errors.lessonOrder}</p>}
              </div>
            </div>

            <div className="cf-field">
              <label className="cf-label">Preview</label>
              <div className="cf-publish-toggle-row">
                <label className={`cf-publish-opt ${!lesson.preview ? "cf-publish-opt--active" : ""}`}>
                  <input type="radio" name="preview" checked={!lesson.preview} onChange={() => onChange("preview", false)} style={{ display: "none" }} />
                  <span> Members Only</span>
                  <span className="cf-publish-opt__desc">Only enrolled students can watch</span>
                </label>
                <label className={`cf-publish-opt ${lesson.preview ? "cf-publish-opt--active" : ""}`}>
                  <input type="radio" name="preview" checked={lesson.preview} onChange={() => onChange("preview", true)} style={{ display: "none" }} />
                  <span>Free Preview</span>
                  <span className="cf-publish-opt__desc">Anyone can watch this lesson</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        <div className="cf-modal__footer">
          <button className="ins-btn-ghost" onClick={onClose}>Cancel</button>
          <div style={{ flex: 1 }} />
          <button
            className="ins-btn-primary cf-save-btn"
            onClick={handleSave}
            disabled={saving || success}
          >
            {success ? "✓ Lesson Added!" : saving ? "Saving…" : "➕ Add Lesson"}
          </button>
        </div>

      </div>
    </div>
  );
}


// ── Step 1: Basics ────────────────────────────────────────────────────────────
function StepBasics({ form, onChange, errors, categories }) {
  return (
    <div className="cf-step-body">
      <div className="cf-field">
        <label className="cf-label">Course Title <span className="cf-required">*</span></label>
        <input
          className={`cf-input ${errors.title ? "cf-input--error" : ""}`}
          placeholder="e.g. React from Zero to Hero"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
        {errors.title && <p className="cf-error">{errors.title}</p>}
      </div>

      <div className="cf-field">
        <label className="cf-label">Subtitle</label>
        <input
          className="cf-input"
          placeholder="A short tagline for your course"
          value={form.subtitle}
          onChange={(e) => onChange("subtitle", e.target.value)}
        />
      </div>

      <div className="cf-field">
        <label className="cf-label">Description <span className="cf-required">*</span></label>
        <textarea
          className={`cf-textarea ${errors.description ? "cf-input--error" : ""}`}
          placeholder="Describe what students will learn…"
          rows={5}
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
        />
        {errors.description && <p className="cf-error">{errors.description}</p>}
      </div>

      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-label">Category <span className="cf-required">*</span></label>
          <select
            className={`cf-select ${errors.category ? "cf-input--error" : ""}`}
            value={form.categoryId}
            onChange={(e) => {
              const selected = categories.find((c) => c.id === Number(e.target.value));
              onChange("categoryId", e.target.value);
              onChange("category", selected?.name || "");
            }}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="cf-error">{errors.category}</p>}
        </div>

        <div className="cf-field">
          <label className="cf-label">Level</label>
          <div className="cf-level-pills">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                className={`cf-level-pill ${form.level === l ? "cf-level-pill--active" : ""}`}
                onClick={() => onChange("level", l)}
              >
                {LEVEL_LABEL[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-label">Language</label>
          <input
            className="cf-input"
            placeholder="English"
            value={form.language}
            onChange={(e) => onChange("language", e.target.value)}
          />
        </div>
      </div>

      {/* ── NEW: Total Lessons & Total Duration ── */}
      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-label">Total Lessons <span className="cf-required">*</span></label>
          <input
            type="number"
            className={`cf-input ${errors.totalLessons ? "cf-input--error" : ""}`}
            placeholder="e.g. 10"
            min="1"
            value={form.totalLessons}
            onChange={(e) => onChange("totalLessons", e.target.value)}
          />
          {errors.totalLessons && <p className="cf-error">{errors.totalLessons}</p>}
        </div>

        <div className="cf-field">
          <label className="cf-label">Total Duration (minutes) <span className="cf-required">*</span></label>
          <input
            type="number"
            className={`cf-input ${errors.totalDuration ? "cf-input--error" : ""}`}
            placeholder="e.g. 120"
            min="1"
            value={form.totalDuration}
            onChange={(e) => onChange("totalDuration", e.target.value)}
          />
          {errors.totalDuration && <p className="cf-error">{errors.totalDuration}</p>}
        </div>
      </div>

    </div>
  );
}

// ── Step 2: Media ─────────────────────────────────────────────────────────────
function StepMedia({ form, onChange }) {
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onChange("thumbnailFile", file);
      onChange("thumbnailPreview", URL.createObjectURL(file));
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange("thumbnailFile", file);
      onChange("thumbnailPreview", URL.createObjectURL(file));
    }
  };

  return (
    <div className="cf-step-body">
      <div className="cf-field">
        <label className="cf-label">Course Thumbnail</label>
        <div
          className={`cf-dropzone ${dragging ? "cf-dropzone--drag" : ""} ${form.thumbnailPreview ? "cf-dropzone--has-file" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          {form.thumbnailPreview ? (
            <div className="cf-thumb-preview-wrap">
              <img src={form.thumbnailPreview} alt="Thumbnail preview" className="cf-thumb-preview" />
              <button
                type="button"
                className="cf-thumb-remove"
                onClick={(e) => { e.stopPropagation(); onChange("thumbnailFile", null); onChange("thumbnailPreview", null); }}
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <>
              <p className="cf-dropzone__main">Drag & drop or click to upload</p>
              <p className="cf-dropzone__sub">PNG, JPG, WEBP · Recommended 1280×720</p>
            </>
          )}
        </div>
      </div>

      <div className="cf-field">
        <label className="cf-label">Promo Video URL</label>
        <input
          className="cf-input"
          placeholder="https://youtube.com/embed/... or Vimeo link"
          value={form.promoVideoUrl}
          onChange={(e) => onChange("promoVideoUrl", e.target.value)}
        />
        <p className="cf-hint">A short preview video shown on the course detail page (optional)</p>
      </div>
    </div>
  );
}

// ── Step 3: Pricing ───────────────────────────────────────────────────────────
function StepPricing({ form, onChange }) {
  return (
    <div className="cf-step-body">
      <div className="cf-field">
        <label className="cf-label">Pricing Model</label>
        <div className="cf-pricing-cards">
          <label className={`cf-pricing-card ${form.isFree ? "cf-pricing-card--active" : ""}`}>
            <input
              type="radio"
              name="pricing"
              checked={form.isFree}
              onChange={() => { onChange("isFree", true); onChange("price", ""); }}
              style={{ display: "none" }}
            />
            <span className="cf-pricing-card__label">Free</span>
            <span className="cf-pricing-card__desc">Anyone can enroll at no cost</span>
          </label>

          <label className={`cf-pricing-card ${!form.isFree ? "cf-pricing-card--active" : ""}`}>
            <input
              type="radio"
              name="pricing"
              checked={!form.isFree}
              onChange={() => onChange("isFree", false)}
              style={{ display: "none" }}
            />
            <span className="cf-pricing-card__label">Paid</span>
            <span className="cf-pricing-card__desc">Set a price for enrollment</span>
          </label>
        </div>
      </div>

      {!form.isFree && (
        <div className="cf-field cf-field--anim">
          <label className="cf-label">Price (USD) <span className="cf-required">*</span></label>
          <div className="cf-price-input-wrap">
            <span className="cf-price-input-wrap__symbol">$</span>
            <input
              type="number"
              className="cf-input cf-input--price"
              placeholder="29.99"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => onChange("price", e.target.value)}
            />
          </div>
          <p className="cf-hint">Set to 0 to offer for free with a paid label.</p>
        </div>
      )}
    </div>
  );
}

// ── Step 4: Publish ───────────────────────────────────────────────────────────
function StepPublish({ form, onChange }) {
  const tags = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="cf-step-body">
      <div className="cf-summary-card">
        {form.thumbnailPreview && (
          <img src={form.thumbnailPreview} className="cf-summary-card__thumb" alt="thumbnail" />
        )}
        <div className="cf-summary-card__info">
          <p className="cf-summary-card__category">{form.category || "No category"}</p>
          <h3 className="cf-summary-card__title">{form.title || "Untitled Course"}</h3>
          {form.subtitle && <p className="cf-summary-card__subtitle">{form.subtitle}</p>}
          <div className="cf-summary-card__meta">
            <span>{LEVEL_LABEL[form.level]}</span>
            <span>·</span>
            <span>{form.language}</span>
            <span>·</span>
            <span>{form.isFree ? "Free" : form.price ? `$${form.price}` : "Paid (no price set)"}</span>
            <span>·</span>
            <span>{form.totalLessons || 0} lessons</span>
            <span>·</span>
            <span>{form.totalDuration || 0} min</span>
          </div>
          {tags.length > 0 && (
            <div className="cf-summary-tags">
              {tags.map((t) => <span key={t} className="cf-summary-tag">{t}</span>)}
            </div>
          )}
        </div>
      </div>

      <div className="cf-field">
        <label className="cf-label">Publish status</label>
        <div className="cf-publish-toggle-row">
          <label className={`cf-publish-opt ${!form.published ? "cf-publish-opt--active" : ""}`}>
            <input type="radio" name="pub" checked={!form.published} onChange={() => onChange("published", false)} style={{ display: "none" }} />
            <span> Save as Draft</span>
            <span className="cf-publish-opt__desc">Visible only to you until published</span>
          </label>
          <label className={`cf-publish-opt ${form.published ? "cf-publish-opt--active" : ""}`}>
            <input type="radio" name="pub" checked={form.published} onChange={() => onChange("published", true)} style={{ display: "none" }} />
            <span>Publish Now</span>
            <span className="cf-publish-opt__desc">Make it live to all students</span>
          </label>
        </div>
      </div>
    </div>
  );
}


// ── Create Course Modal ───────────────────────────────────────────────────────
function CreateCourseModal({ onClose, onSave, categories }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.title.trim()) e.title = "Title is required";
      if (!form.description.trim()) e.description = "Description is required";
      if (!form.categoryId) e.category = "Please select a category";
      if (!form.totalLessons) e.totalLessons = "Total lessons is required";
      if (!form.totalDuration) e.totalDuration = "Total duration is required";
    }
    if (step === 3 && !form.isFree && !form.price) {
      e.price = "Please enter a price or select Free";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    onSave(form);
    onClose();
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="cf-overlay" onClick={onClose}>
      <div className="cf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cf-modal__header">
          <div>
            <p className="cf-modal__kicker">New Course</p>
            <h2 className="cf-modal__title">
              {STEPS[step - 1].icon} {STEPS[step - 1].label}
            </h2>
          </div>
          <button className="cf-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="cf-step-track">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`cf-step-dot ${step === s.id ? "cf-step-dot--active" : ""} ${step > s.id ? "cf-step-dot--done" : ""}`}
              onClick={() => step > s.id && setStep(s.id)}
            >
              <span className="cf-step-dot__num">{step > s.id ? "✓" : s.id}</span>
              <span className="cf-step-dot__label">{s.label}</span>
            </div>
          ))}
          <div className="cf-step-line">
            <div className="cf-step-line__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="cf-modal__body">
          {step === 1 && <StepBasics form={form} onChange={onChange} errors={errors} categories={categories} />}
          {step === 2 && <StepMedia form={form} onChange={onChange} />}
          {step === 3 && <StepPricing form={form} onChange={onChange} errors={errors} />}
          {step === 4 && <StepPublish form={form} onChange={onChange} />}
        </div>

        <div className="cf-modal__footer">
          {step > 1 && (
            <button className="ins-btn-ghost" onClick={handleBack}>← Back</button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length ? (
            <button className="ins-btn-primary" onClick={handleNext}>
              Next: {STEPS[step].label} →
            </button>
          ) : (
            <button className="ins-btn-primary cf-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : form.published ? " Publish Course" : " Save Draft"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CreateCourse() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saved, setSaved] = useState(false);
  const [lessonTarget, setLessonTarget] = useState(null);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/courses/my-courses/${instructorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      setCourses(
        (Array.isArray(res.data) ? res.data : []).map((c) => ({
          ...c,
          published: !!c.published,
          free: !!c.free,
        }))
      );
    } catch (err) {
      console.error(err);
      setCourses([]);
    }
  };

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

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const handleSave = async (form) => {
    try {
      const courseRes = await axios.post(
        `${BASE_URL}api/courses/createcourses`,
        {
          title: form.title,
          description: form.description,
          thumbnailUrl: form.thumbnailPreview || "thumb.jpg",
          free: form.isFree,
          totalLessons: parseInt(form.totalLessons),   // ← from form
          totalDuration: parseInt(form.totalDuration), // ← from form
          INSTRUCTOR: instructorId,
          categoryId: form.categoryId,
          published: form.published,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdCourse = courseRes.data;

      await axios.post(
        `${BASE_URL}api/lessons/create`,
        {
          title: form.title,
          description: form.description,
          videoUrl: form.promoVideoUrl || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&q=60",
          thumbnailUrl: form.thumbnailPreview || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&q=60",
          duration: 15,
          lessonOrder: 1,
          instructorid: instructorId,
          courseId: createdCourse.id,
          Preview: form.published,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchCourses();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error creating course: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}api/courses/${id}/${instructorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const LEVEL_STYLE = {
    BEGINNER: { color: "#15803d", bg: "#dcfce7" },
    INTERMEDIATE: { color: "#92400e", bg: "#fef3c7" },
    ADVANCED: { color: "#991b1b", bg: "#fee2e2" },
  };

  return (
    <div className="ins-page">
      <div className="pg-header">
        <div>
          <h1 className="pg-header__title">Courses</h1>
          <p className="pg-header__sub">
            {courses.length} courses · {courses.filter((c) => c.published).length} published
          </p>
        </div>
        <button className="ins-btn-primary" onClick={() => setShowModal(true)}>
          + Create New Course
        </button>
      </div>

      {saved && <div className="cf-toast">✓ Course saved successfully!</div>}

      <div className="cf-course-list">
        {courses.map((c) => {
          const lvl = LEVEL_STYLE[c.level] || LEVEL_STYLE.BEGINNER;
          return (
            <div key={c.id} className="cf-course-row">
              <div className="cf-course-row__thumb">
                <img src={c.thumbnailUrl} alt={c.title} />
              </div>
              <div className="cf-course-row__info">
                <p className="cf-course-row__cat">{c.category}</p>
                <h3 className="cf-course-row__title">{c.title}</h3>
                <div className="cf-course-row__badges">
                  <span className={`ins-course-card__status ${c.published ? "ins-status--live" : "ins-status--draft"}`}>
                    {c.published ? "● Live" : "○ Draft"}
                  </span>
                  <span className="cf-level-tag" style={{ background: lvl.bg, color: lvl.color }}>
                    {LEVEL_LABEL[c.level]}
                  </span>
                </div>
              </div>

              <div className="cf-course-row__actions">
                <button
                  className="ins-btn-card-primary"
                  onClick={() => navigate(`/instructor/edit?course=${c.id}`)}
                >
                  Edit
                </button>
                <button
                  className="ins-btn-card-primary"
                  onClick={() => setLessonTarget(c)}
                >
                  + Add Lesson
                </button>
                <button
                  className="ins-btn-card-ghost"
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          categories={categories}
        />
      )}

      {lessonTarget && (
        <AddLessonModal
          course={lessonTarget}
          token={token}
          onClose={() => setLessonTarget(null)}
        />
      )}
    </div>
  );
}