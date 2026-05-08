"use client";

import type { CollectionDefinition, FieldDefinition } from "@adminforge/core";
import { useCallback, useRef, useState, useEffect } from "react";
import { RichTextEditor } from "./RichTextEditor.js";
import { ImageUpload } from "./ImageUpload.js";
import { RelationInput } from "./RelationInput.js";

interface FormEngineProps {
  collection: CollectionDefinition;
  record?: Record<string, unknown> | null;
  isNew: boolean;
}

interface FieldError {
  path: string;
  message: string;
}

function FieldRenderer({
  name,
  field,
  value,
  onChange,
  error,
}: {
  name: string;
  field: FieldDefinition;
  value?: unknown;
  onChange?: (val: string) => void;
  error?: string;
}) {
  const { component, props } = field.ui;
  if (props?.hidden) return null;

  const errorClass = error ? "adminforge-input-error" : "";
  const resolvedValue = value !== undefined ? value : field.db?.default;
  const isReadOnly = Boolean(props?.readOnly);

  switch (component) {
    case "text":
    case "slug":
    case "date":
      return (
        <div className="adminforge-field">
          <label htmlFor={name}>{(props?.label as string) ?? name}</label>
          <input
            id={name}
            name={name}
            type={component === "date" ? "datetime-local" : "text"}
            className={`adminforge-input ${errorClass}`}
            required={!field.db?.nullable}
            defaultValue={typeof resolvedValue === "string" ? resolvedValue : ""}
            readOnly={isReadOnly}
          />
          {error && <span className="adminforge-field-err">{error}</span>}
        </div>
      );
    case "boolean":
      return (
        <div className="adminforge-field adminforge-field-checkbox">
          <label htmlFor={name}>
            <input
              id={name}
              name={name}
              type="checkbox"
              defaultChecked={resolvedValue === true}
              disabled={isReadOnly}
            />
            {(props?.label as string) ?? name}
          </label>
          {error && <span className="adminforge-field-err">{error}</span>}
        </div>
      );
    case "relation":
      return (
        <div className="adminforge-field">
          <label>{(props?.label as string) ?? name}</label>
          <RelationInput
            name={name}
            to={props?.to as string}
            value={typeof resolvedValue === "string" ? resolvedValue : undefined}
            error={error}
            disabled={isReadOnly}
          />
          {error && <span className="adminforge-field-err">{error}</span>}
        </div>
      );
    case "richText":
      return (
        <div className="adminforge-field">
          <label>{(props?.label as string) ?? name}</label>
          <RichTextEditor
            name={name}
            value={typeof resolvedValue === "string" ? resolvedValue : ""}
            onChange={(val) => !isReadOnly && onChange?.(val)}
          />
          <input type="hidden" name={name} id={`${name}-hidden`} defaultValue={typeof resolvedValue === "string" ? resolvedValue : ""} />
          {error && <span className="adminforge-field-err">{error}</span>}
        </div>
      );
    case "image":
      return (
        <ImageUpload name={name} value={typeof resolvedValue === "string" ? resolvedValue : ""} onChange={(val) => !isReadOnly && onChange?.(val)} />
      );
    default:
      return (
        <div className="adminforge-field">
          <label htmlFor={name}>{(props?.label as string) ?? name}</label>
          <input
            id={name}
            name={name}
            type="text"
            className={`adminforge-input ${errorClass}`}
            defaultValue={typeof resolvedValue === "string" ? resolvedValue : ""}
            readOnly={isReadOnly}
          />
          {error && <span className="adminforge-field-err">{error}</span>}
        </div>
      );
  }
}

export function FormEngine({ collection, record, isNew }: FormEngineProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [richTextValues, setRichTextValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (record && !isNew) {
      const rt: Record<string, string> = {};
      for (const [key, value] of Object.entries(record)) {
        const field = collection.fields[key];
        if (field?.type === "richText" && typeof value === "string") {
          rt[key] = value;
        }
      }
      setRichTextValues(rt);
    }
  }, [record, isNew, collection.fields]);

  useEffect(() => {
    if (!isNew) return;
    const form = formRef.current;
    if (!form) return;

    const listeners: { input: HTMLInputElement; fn: EventListener }[] = [];
    Object.entries(collection.fields).forEach(([name, field]) => {
      if (field.type === "slug" && field.ui.props?.from) {
        const fromField = field.ui.props.from as string;
        const sourceInput = form.querySelector(`[name="${fromField}"]`) as HTMLInputElement | null;
        const slugInput = form.querySelector(`[name="${name}"]`) as HTMLInputElement | null;

        if (sourceInput && slugInput) {
          const fn = (e: Event) => {
            const val = (e.target as HTMLInputElement).value;
            slugInput.value = val.toLowerCase().replace(/\\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          };
          sourceInput.addEventListener("input", fn);
          listeners.push({ input: sourceInput, fn });
        }
      }
    });

    return () => listeners.forEach((l) => l.input.removeEventListener("input", l.fn));
  }, [isNew, collection.fields]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) continue;
      if (richTextValues[key]) {
        data[key] = richTextValues[key];
      } else {
        const stringValue = value.toString();
        const field = collection.fields[key];
        if (field?.type === "boolean") {
          data[key] = stringValue === "on";
        } else {
          data[key] = stringValue;
        }
      }
    }

    const url = isNew
      ? `/api/${collection.name}`
      : `/api/${collection.name}/${record?.id}`;
    const method = isNew ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      window.location.href = `/admin/${collection.name}`;
    } else {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      if (err.fields) {
        const errors: Record<string, string> = {};
        for (const f of err.fields as { path: string; message: string }[]) {
          errors[f.path] = f.message;
        }
        setFieldErrors(errors);
      }
      setSubmitError(err.error ?? "An error occurred");
    }
  }, [collection, isNew, record?.id, richTextValues]);

  const handleRichTextChange = useCallback((name: string, value: string) => {
    setRichTextValues((prev) => {
      const next = { ...prev, [name]: value };
      const hiddenInput = formRef.current?.querySelector(`#${name}-hidden`) as HTMLInputElement | null;
      if (hiddenInput) hiddenInput.value = value;
      return next;
    });
  }, []);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="adminforge-form">
      {submitError && <div className="adminforge-form-error">{submitError}</div>}
      {Object.entries(collection.fields).map(([name, field]) => (
        <FieldRenderer
          key={name}
          name={name}
          field={field}
          value={record?.[name]}
          onChange={(val) => handleRichTextChange(name, val)}
          error={fieldErrors[name]}
        />
      ))}
      <div className="adminforge-form-actions">
        <button type="submit" className="adminforge-btn adminforge-btn-primary">
          {isNew ? "Create" : "Save"}
        </button>
      </div>
    </form>
  );
}
