import { useRef, useState } from "react";
import { isQtiAttemptStateV1, type QtiAttemptStateV1 } from "@longsightgroup/qti3-core";
import type { QtiPlayerLoadOptions } from "@longsightgroup/qti3-player";
import {
  QtiAssessmentItemPlayer,
  type QtiAssessmentItemPlayerHandle,
} from "@longsightgroup/qti3-player-react";
import xml from "@longsightgroup/qti3-fixtures/xml/choice-reference.xml?raw";

const storageKey = "qti3-react-starter.attempt.v1";
const loadOptions: QtiPlayerLoadOptions = {
  status: "interacting",
  sessionControl: { validateResponses: true, showFeedback: true },
};

/** Local preview host with explicit scoring, browser-local save, and state restoration. */
export default function App() {
  const player = useRef<QtiAssessmentItemPlayerHandle>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Loading question…");
  const [state, setState] = useState<QtiAttemptStateV1>();

  function scoreResponse(): void {
    const result = player.current?.scoreAttempt();
    if (!result) return;
    const errors = result.diagnostics.filter((entry) => entry.severity === "error");
    const score = result.outcomes.SCORE;
    setMessage(
      errors.length > 0
        ? errors.map((entry) => entry.message).join("; ")
        : `Score: ${typeof score === "number" ? score : "requires external grading"}`,
    );
  }

  function saveAttempt(): void {
    const attempt = player.current?.serialize();
    if (!attempt) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(attempt));
      setMessage("Attempt saved in this browser. Reload the page, then restore it to continue.");
    } catch {
      setMessage("This browser could not save the attempt. Check its storage permissions.");
    }
  }

  function restoreAttempt(): void {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) {
        setMessage("No saved attempt in this browser.");
        return;
      }
      const parsed: unknown = JSON.parse(saved);
      if (!isQtiAttemptStateV1(parsed) || parsed.itemIdentifier !== "choice-reference") {
        setMessage(
          "The saved attempt is not valid for this question. Save a new attempt to replace it.",
        );
        return;
      }
      player.current?.restore(parsed);
      setMessage("Saved attempt restored.");
    } catch {
      setMessage("The saved attempt could not be restored. Save a new attempt to replace it.");
    }
  }

  return (
    <main>
      <header>
        <p className="project-name">
          <a href="https://qflowlearn.github.io/qti3/">qti3</a> / React example
        </p>
        <h1>Render, score, and resume a QTI question</h1>
        <p>
          This starter uses the published qti3 React adapter. Choose an answer, score it, then save
          and restore your attempt.
        </p>
      </header>
      <section aria-labelledby="question-heading">
        <h2 id="question-heading">Question preview</h2>
        <QtiAssessmentItemPlayer
          ref={player}
          xml={xml}
          loadOptions={loadOptions}
          onReady={() => {
            setReady(true);
            setMessage("Choose an answer, then score your response.");
          }}
          onStateChange={({ state: nextState }) => setState(nextState)}
          onResponseChange={() => setMessage("Response changed. Score it to see the result.")}
          onLoadError={(error) => {
            setReady(false);
            setMessage(error.message);
          }}
        />
      </section>
      <div className="actions" aria-label="Attempt actions">
        <button type="button" disabled={!ready} onClick={scoreResponse}>
          Score response
        </button>
        <button type="button" disabled={!ready} onClick={saveAttempt}>
          Save attempt
        </button>
        <button type="button" disabled={!ready} onClick={restoreAttempt}>
          Restore saved attempt
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            player.current?.reset();
            setMessage("Response reset. Saved browser data is unchanged.");
          }}
        >
          Reset response
        </button>
      </div>
      <p role="status" className="status">
        {message}
      </p>
      <details>
        <summary>Inspect attempt JSON</summary>
        <pre tabIndex={0} aria-label="Attempt JSON">
          {state ? JSON.stringify(state, null, 2) : "No attempt loaded."}
        </pre>
      </details>
      <footer>
        <p>
          This is a local preview with an answer key. Browser storage belongs to this origin and is
          not a backup. For graded delivery, keep authoritative XML and scoring on the server.
        </p>
        <a href="https://qflowlearn.github.io/qti3/guides/render-qti-react.html">
          Read the React integration guide
        </a>
      </footer>
    </main>
  );
}
