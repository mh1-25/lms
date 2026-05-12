import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./instructor.css";
import BASE_URL from "../../config/url";

/* ─────────────────────────────────────────
   SHARED CONSTANTS
───────────────────────────────────────── */
const LEVELS      = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const LEVEL_LABEL = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };
const LEVEL_STYLE = {
  BEGINNER:     { color: "#15803d", bg: "#dcfce7" },
  INTERMEDIATE: { color: "#92400e", bg: "#fef3c7" },
  ADVANCED:     { color: "#991b1b", bg: "#fee2e2" },
};

const user = JSON.parse(localStorage.getItem("user") || "null");
const INSTRUCTOR_ID = user?.id;

const STEPS = [
  { id: 1, label: "Basics",  icon: "" },
  { id: 2, label: "Media",   icon: "" },
  { id: 3, label: "Pricing", icon: "" },
  { id: 4, label: "Publish", icon: "" },
];

/* ─────────────────────────────────────────
   STEP COMPONENTS
───────────────────────────────────────── */

// ── Step 1: Basics ─────────────────────────────────────────────────────────
function StepBasics({ form, onChange, errors, categories }) {
  return (
    <div className="cf-step-body">
      <div className="cf-field">
        <label className="cf-label">Course Title <span className="cf-required">*</span></label>
        <input
          className={`cf-input ${errors.title ? "cf-input--error" : ""}`}
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
        {errors.title && <p className="cf-error">{errors.title}</p>}
      </div>

      <div className="cf-field">
        <label className="cf-label">Subtitle</label>
        <input
          className="cf-input"
          value={form.subtitle}
          onChange={(e) => onChange("subtitle", e.target.value)}
        />
      </div>

      <div className="cf-field">
        <label className="cf-label">Description <span className="cf-required">*</span></label>
        <textarea
          className={`cf-textarea ${errors.description ? "cf-input--error" : ""}`}
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
            value={form.categoryId || ""}
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
              <button key={l} type="button"
                className={`cf-level-pill ${form.level === l ? "cf-level-pill--active" : ""}`}
                onClick={() => onChange("level", l)}
              >
                {LEVEL_LABEL[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEW: Lessons & Duration ── */}
      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-label">Total Lessons</label>
          <input
            type="number"
            min="0"
            className={`cf-input ${errors.totalLessons ? "cf-input--error" : ""}`}
            value={form.totalLessons ?? ""}
            onChange={(e) =>
              onChange("totalLessons", e.target.value === "" ? "" : Number(e.target.value))
            }
          />
          {errors.totalLessons && <p className="cf-error">{errors.totalLessons}</p>}
        </div>

        <div className="cf-field">
          <label className="cf-label">
            Total Duration{" "}
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 400 }}>(minutes)</span>
          </label>
          <input
            type="number"
            min="0"
            className={`cf-input ${errors.totalDuration ? "cf-input--error" : ""}`}
            value={form.totalDuration ?? ""}
            onChange={(e) =>
              onChange("totalDuration", e.target.value === "" ? "" : Number(e.target.value))
            }
          />
          {errors.totalDuration && <p className="cf-error">{errors.totalDuration}</p>}
        </div>
      </div>
      <p className="cf-hint">These values help students understand the course scope before enrolling.</p>
    </div>
  );
}

// ── Step 2: Media ──────────────────────────────────────────────────────────
function StepMedia({ form, onChange }) {
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);
  const preview = form.thumbnailPreview || form.thumbnailUrl;

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      onChange("thumbnailFile", file);
      onChange("thumbnailPreview", URL.createObjectURL(file));
    }
  };

  return (
    <div className="cf-step-body">
      <div className="cf-field">
        <label className="cf-label">Course Thumbnail</label>
        <div
          className={`cf-dropzone ${dragging ? "cf-dropzone--drag" : ""} ${preview ? "cf-dropzone--has-file" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {preview ? (
            <div className="cf-thumb-preview-wrap">
              <img src={preview} alt="Thumbnail" className="cf-thumb-preview" />
              <button
                type="button"
                className="cf-thumb-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("thumbnailFile", null);
                  onChange("thumbnailPreview", null);
                }}
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <>
              <span className="cf-dropzone__icon"></span>
              <p className="cf-dropzone__main">Drag & drop or click to replace</p>
              <p className="cf-dropzone__sub">PNG, JPG, WEBP · 1280×720 recommended</p>
            </>
          )}
        </div>
      </div>

      <div className="cf-field">
        <label className="cf-label">Promo Video URL</label>
        <input
          className="cf-input"
          placeholder="https://youtube.com/embed/..."
          value={form.promoVideoUrl}
          onChange={(e) => onChange("promoVideoUrl", e.target.value)}
        />
        <p className="cf-hint">Optional preview video shown to potential students.</p>
      </div>
    </div>
  );
}

// ── Step 3: Pricing ────────────────────────────────────────────────────────
function StepPricing({ form, onChange, errors }) {
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
            <span className="cf-pricing-card__icon"></span>
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
            <span className="cf-pricing-card__icon"></span>
            <span className="cf-pricing-card__label">Paid</span>
            <span className="cf-pricing-card__desc">Set a price for enrollment</span>
          </label>
        </div>
      </div>

      {!form.isFree && (
        <div className="cf-field cf-field--anim">
          <label className="cf-label">Price (USD)</label>
          <div className="cf-price-input-wrap">
            <span className="cf-price-input-wrap__symbol">$</span>
            <input
              type="number"
              className="cf-input cf-input--price"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => onChange("price", e.target.value)}
            />
          </div>
          {errors?.price && <p className="cf-error">{errors.price}</p>}
        </div>
      )}
    </div>
  );
}

// ── Step 4: Publish ────────────────────────────────────────────────────────
function StepPublish({ form, onChange }) {
  const tags = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const preview = form.thumbnailPreview || form.thumbnailUrl;

  return (
    <div className="cf-step-body">
      <div className="cf-summary-card">
        {preview && <img src={preview} className="cf-summary-card__thumb" alt="thumbnail" />}
        <div className="cf-summary-card__info">
          <p className="cf-summary-card__category">{form.category}</p>
          <h3 className="cf-summary-card__title">{form.title}</h3>
          {form.subtitle && <p className="cf-summary-card__subtitle">{form.subtitle}</p>}
          <div className="cf-summary-card__meta">
            <span>{LEVEL_LABEL[form.level]}</span>
            <span>·</span>
            <span>{form.language}</span>
            <span>·</span>
            <span>{form.isFree ? "Free" : `$${form.price}`}</span>
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
            <input
              type="radio"
              name="pub"
              checked={!form.published}
              onChange={() => onChange("published", false)}
              style={{ display: "none" }}
            />
            <span> Save as Draft</span>
            <span className="cf-publish-opt__desc">Visible only to you until published</span>
          </label>
          <label className={`cf-publish-opt ${form.published ? "cf-publish-opt--active" : ""}`}>
            <input
              type="radio"
              name="pub"
              checked={form.published}
              onChange={() => onChange("published", true)}
              style={{ display: "none" }}
            />
            <span> Published</span>
            <span className="cf-publish-opt__desc">Live to all students</span>
          </label>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   EDIT MODAL
───────────────────────────────────────── */
function EditCourseModal({ course, onClose, onSave, token, categories }) {
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState({ ...course, thumbnailFile: null, thumbnailPreview: null });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.title?.trim())       e.title       = "Title is required";
      if (!form.description?.trim()) e.description = "Description is required";
      if (!form.categoryId)          e.category    = "Please select a category";
      if (form.totalLessons === "" || form.totalLessons < 0)
        e.totalLessons = "Enter a valid number of lessons (0 or more)";
      if (form.totalDuration === "" || form.totalDuration < 0)
        e.totalDuration = "Enter a valid duration (0 or more minutes)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = {
        title:         form.title,
        description:   form.description,
        thumbnailUrl:  form.thumbnailPreview || form.thumbnailUrl || "",
        free:          !!form.isFree,
        publiched:     !!form.published,
        totalLessons:  Number(form.totalLessons)  || 0,
        totalDuration: Number(form.totalDuration) || 0,
        INSTRUCTOR:    INSTRUCTOR_ID,
        categoryId:    form.categoryId || 1,
      };

      await axios.put(
        `${BASE_URL}api/courses/updatecourses/${form.id}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSave(form);
      onClose();
    } catch (err) {
      console.error("Failed to update course:", err);
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="cf-overlay" onClick={onClose}>
      <div className="cf-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cf-modal__header cf-modal__header--edit">
          <div>
            <p className="cf-modal__kicker">Editing Course</p>
            <h2 className="cf-modal__title cf-modal__title--edit">
              {STEPS[step - 1].icon} {STEPS[step - 1].label}
            </h2>
          </div>
          <div className="cf-modal__header-actions">
            {!showDeleteConfirm ? (
              <button
                className="cf-delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete this course"
              >
                🗑 Delete
              </button>
            ) : (
              <div className="cf-delete-confirm">
                <span>Are you sure?</span>
                <button className="cf-delete-confirm__yes" onClick={() => { onClose(); }}>Yes, delete</button>
                <button className="cf-delete-confirm__no" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              </div>
            )}
            <button className="cf-modal__close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Step track */}
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

        {/* Body */}
        <div className="cf-modal__body">
          {step === 1 && <StepBasics  form={form} onChange={onChange} errors={errors} categories={categories} />}
          {step === 2 && <StepMedia   form={form} onChange={onChange} />}
          {step === 3 && <StepPricing form={form} onChange={onChange} errors={errors} />}
          {step === 4 && <StepPublish form={form} onChange={onChange} />}
        </div>

        {/* Footer */}
        <div className="cf-modal__footer">
          {step > 1 && (
            <button className="ins-btn-ghost" onClick={() => setStep((s) => s - 1)}>← Back</button>
          )}
          <div style={{ flex: 1 }} />
          <button className="ins-btn-ghost" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {step < STEPS.length && (
            <button className="ins-btn-primary" onClick={() => { if (validate()) setStep((s) => s + 1); }}>
              Next: {STEPS[step].label} →
            </button>
          )}
          {step === STEPS.length && (
            <button className="ins-btn-primary cf-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : form.published ? " Update & Publish" : " Save Draft"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function EditCourse() {
  const navigate = useNavigate();
  const [courses,    setCourses]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editing,    setEditing]    = useState(null);
  const [saved,      setSaved]      = useState(false);
  const [savedId,    setSavedId]    = useState(null);

  const token = localStorage.getItem("token");

  /* ── Fetch courses ── */
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}api/courses/my-courses/${INSTRUCTOR_ID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(
        (Array.isArray(res.data) ? res.data : []).map((c) => ({
          ...c,
          published: !!c.published,
          isFree:    !!c.free,
        }))
      );
    } catch (err) {
      console.error(err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Fetch categories from API ── */
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}api/categories/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const handleSave = (updated) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
    );
    setSavedId(updated.id);
    setSaved(true);
    setTimeout(() => { setSaved(false); setSavedId(null); }, 3000);
  };

  return (
    <div className="ins-page">
      <div className="pg-header">
        <div>
          <h1 className="pg-header__title">Edit Courses</h1>
          <p className="pg-header__sub">Select a course to edit its details</p>
        </div>
        <button className="ins-btn-ghost" onClick={() => navigate("/instructor/create")}>
          + Create New Course
        </button>
      </div>

      {saved && <div className="cf-toast">✓ Course updated successfully!</div>}

      {loading && (
        <p style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading courses…</p>
      )}

      {!loading && (
        <div className="cf-edit-grid">
          {courses.length === 0 && (
            <p style={{ color: "#64748b" }}>No courses found.</p>
          )}
          {courses.map((c) => {
            const lvl = LEVEL_STYLE[c.level] || LEVEL_STYLE.BEGINNER;
            return (
              <div key={c.id} className={`cf-edit-card ${savedId === c.id ? "cf-edit-card--saved" : ""}`}>
                <div className="cf-edit-card__thumb">
                  <img src={c.thumbnailUrl} alt={c.title} />
                  <div className="cf-edit-card__thumb-overlay">
                    <button
                      className="cf-edit-card__edit-btn"
                      onClick={() => setEditing(c)}
                    >
                      ✏ Edit Course
                    </button>
                  </div>
                  <span className={`ins-course-card__status ${c.published ? "ins-status--live" : "ins-status--draft"}`}>
                    {c.published ? "● Live" : "○ Draft"}
                  </span>
                </div>

                <div className="cf-edit-card__body">
                  <div className="cf-edit-card__top">
                    <span className="ins-course-card__cat">{c.category}</span>
                    <span className="cf-level-tag" style={{ background: lvl.bg, color: lvl.color }}>
                      {LEVEL_LABEL[c.level] || c.level}
                    </span>
                  </div>
                  <h3 className="cf-edit-card__title">{c.title}</h3>
                  {c.subtitle && <p className="cf-edit-card__subtitle">{c.subtitle}</p>}

                  <div className="cf-edit-card__stats">
                    <span> {c.totalLessons} lessons</span>
                    <span>{c.isFree ? "Free" : `$${c.price ?? ""}`}</span>
                  </div>

                  <div className="cf-edit-card__actions">
                    <button className="ins-btn-card-primary" onClick={() => setEditing(c)}>
                       Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <EditCourseModal
          course={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          token={token}
          categories={categories}
        />
      )}
    </div>
  );
}