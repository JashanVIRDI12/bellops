"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { currentVisit, track } from "@/lib/analytics/client";
import { trackMeta } from "@/lib/analytics/meta";
import { enquiryForm, services } from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";
import {
  sendEnquiry,
  type EnquiryField,
  type EnquiryState,
} from "@/lib/leads/enquiry";
import { WhatsAppIcon } from "./icons";

/*
 * The contact form, set straight on the scene: underlined fields, white text,
 * no panel. It submits to a Server Action, so it also works before the page's
 * JavaScript loads. Enquiries appear in /admin.
 */

const initialState: EnquiryState = { status: "idle" };

// Where this visit came from, sent with the enquiry (empty on the server).
const noop = () => () => {};
let visitJson = "";
const useVisitJson = () =>
  useSyncExternalStore(
    noop,
    () => (visitJson ||= JSON.stringify(currentVisit())),
    () => "",
  );

export function EnquiryForm() {
  // A new key starts a fresh form after "Send another enquiry".
  const [round, setRound] = useState(0);
  return <EnquiryFormRound key={round} onRestart={() => setRound(round + 1)} />;
}

function EnquiryFormRound({ onRestart }: { onRestart: () => void }) {
  const [state, formAction, pending] = useActionState(
    sendEnquiry,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);
  const reported = useRef(false);
  const visit = useVisitJson();

  // Move focus to what changed: the first problem, or the confirmation.
  useEffect(() => {
    if (state.status === "sent") {
      sentRef.current?.focus();
      if (!reported.current) {
        reported.current = true;
        track("action", "enquiry-sent");
        trackMeta("Lead", {
          content_name: "Start a project enquiry",
          content_category: "enquiry-form",
        });
      }
    }
    if (state.status === "invalid")
      formRef.current
        ?.querySelector<HTMLElement>("[aria-invalid='true']")
        ?.focus();
  }, [state]);

  if (state.status === "sent") {
    return (
      <div className="enquiry-sent">
        <h3
          ref={sentRef}
          tabIndex={-1}
          className="text-title font-heading font-medium"
        >
          {enquiryForm.sentHeading}
        </h3>
        <p className="mt-3 max-w-[40ch] font-medium text-white/90">
          {state.firstName ? `Thanks, ${state.firstName}. ` : "Thanks. "}
          {enquiryForm.sentBody}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-button contact-button--light"
            data-track="whatsapp-form"
          >
            <WhatsAppIcon />
            WhatsApp
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <button type="button" onClick={onRestart} className="enquiry-link">
            {enquiryForm.sendAnother}
          </button>
        </div>
      </div>
    );
  }

  const values =
    state.status === "invalid" || state.status === "failed"
      ? state.values
      : undefined;
  const errors: Partial<Record<EnquiryField, string>> =
    state.status === "invalid" ? state.errors : {};

  /** Accessibility wiring for a field's error message, if it has one. */
  const describe = (field: EnquiryField) => ({
    "aria-invalid": errors[field] ? ("true" as const) : undefined,
    "aria-describedby": errors[field] ? `enquiry-${field}-error` : undefined,
  });
  const contactError = errors.contact ? "enquiry-contact-error" : undefined;

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      aria-label={enquiryForm.label}
      className="enquiry"
      onFocus={() => {
        if (started.current) return;
        started.current = true;
        track("action", "enquiry-started");
      }}
    >
      <input type="hidden" name="visit" value={visit} readOnly />
      <div className="enquiry-grid">
        <div className="enquiry-field">
          <label htmlFor="enquiry-name">{enquiryForm.name}</label>
          <input
            id="enquiry-name"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            defaultValue={values?.name}
            {...describe("name")}
          />
          <FieldError field="name" errors={errors} />
        </div>

        <div className="enquiry-field">
          <label htmlFor="enquiry-email">{enquiryForm.email}</label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={200}
            defaultValue={values?.email}
            aria-invalid={errors.email || errors.contact ? "true" : undefined}
            aria-describedby={
              [
                "enquiry-contact-hint",
                contactError,
                errors.email && "enquiry-email-error",
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
          <FieldError field="email" errors={errors} />
        </div>

        <div className="enquiry-field">
          <label htmlFor="enquiry-phone">{enquiryForm.phone}</label>
          <input
            id="enquiry-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={30}
            defaultValue={values?.phone}
            aria-invalid={errors.phone ? "true" : undefined}
            aria-describedby={
              [
                "enquiry-contact-hint",
                contactError,
                errors.phone && "enquiry-phone-error",
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
          <FieldError field="phone" errors={errors} />
        </div>

        <div className="enquiry-field enquiry-budget">
          <label htmlFor="enquiry-budget">
            {enquiryForm.budget}{" "}
            <span className="enquiry-optional">optional</span>
          </label>
          <select
            id="enquiry-budget"
            name="budget"
            defaultValue={values?.budget ?? ""}
          >
            <option value="">{enquiryForm.budgetPlaceholder}</option>
            {enquiryForm.budgets.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </div>

        <p
          id="enquiry-contact-hint"
          className={`enquiry-hint enquiry-span ${errors.contact ? "sr-only" : ""}`}
        >
          {enquiryForm.contactHint}
        </p>
        {errors.contact && (
          <p id="enquiry-contact-error" className="enquiry-error enquiry-span">
            {errors.contact}
          </p>
        )}
      </div>

      <fieldset className="enquiry-services">
        <legend>
          {enquiryForm.services}{" "}
          <span className="enquiry-optional">optional</span>
        </legend>
        <div className="enquiry-chips">
          {services.items.map((item) => (
            <label key={item.title} className="enquiry-chip">
              <input
                type="checkbox"
                name="services"
                value={item.title}
                defaultChecked={values?.services.includes(item.title)}
              />
              <span>{item.title}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="enquiry-field">
        <label htmlFor="enquiry-message">{enquiryForm.message}</label>
        <textarea
          id="enquiry-message"
          name="message"
          rows={3}
          required
          maxLength={4000}
          placeholder={enquiryForm.messagePlaceholder}
          defaultValue={values?.message}
          data-lenis-prevent
          {...describe("message")}
        />
        <FieldError field="message" errors={errors} />
      </div>

      {/* Hidden from people; bots that fill it in are ignored. */}
      <div className="enquiry-trap" aria-hidden="true">
        <label htmlFor="enquiry-website">Website</label>
        <input
          id="enquiry-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.status === "failed" && (
        <p role="alert" className="enquiry-error enquiry-alert">
          {state.reason === "busy" ? enquiryForm.busy : enquiryForm.failed}{" "}
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
            data-track="whatsapp-form"
          >
            WhatsApp<span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
      )}

      <div className="enquiry-submit">
        <button type="submit" disabled={pending} className="intro-cta">
          {pending ? enquiryForm.pending : enquiryForm.submit}
        </button>
        <p className="enquiry-hint">{enquiryForm.privacy}</p>
      </div>
    </form>
  );
}

function FieldError({
  field,
  errors,
}: {
  field: EnquiryField;
  errors: Partial<Record<EnquiryField, string>>;
}) {
  if (!errors[field]) return null;
  return (
    <p id={`enquiry-${field}-error`} className="enquiry-error">
      {errors[field]}
    </p>
  );
}
