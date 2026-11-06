import React from 'react';

const ALL_FACTORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export interface ControlsProps {
  /** Selected fixed factors (aliases supported: selectedFactors, factors). */
  fixedFactors?: number[];
  selectedFactors?: number[];
  factors?: number[];
  /** Called with the new factor list when selection changes. */
  onChange?: (factors: number[]) => void;
  onFactorsChange?: (factors: number[]) => void;
  /** Optional granular callbacks. */
  onToggleFactor?: (factor: number) => void;
  onSelectAll?: () => void;
  onClear?: () => void;
  onRandomize?: () => void;
  onDownload?: () => void;
  randomizeDisabled?: boolean;
  downloadDisabled?: boolean;
  disabled?: boolean;
}

function normalizeFactors(props: ControlsProps): number[] {
  return props.fixedFactors ?? props.selectedFactors ?? props.factors ?? [];
}

function changeHandler(props: ControlsProps): ((f: number[]) => void) | undefined {
  return props.onChange ?? props.onFactorsChange;
}

export function Controls(props: ControlsProps): React.ReactElement {
  const factors = normalizeFactors(props);
  const selected = new Set(factors);
  const onChange = changeHandler(props);

  const toggle = (factor: number) => {
    if (props.onToggleFactor) {
      props.onToggleFactor(factor);
      return;
    }
    if (!onChange) return;
    const next = selected.has(factor)
      ? factors.filter((f) => f !== factor)
      : [...factors, factor];
    // preserve sorted order for cleanliness
    next.sort((a, b) => a - b);
    onChange(next);
  };

  const selectAll = () => {
    if (props.onSelectAll) {
      props.onSelectAll();
      return;
    }
    if (onChange) onChange([...ALL_FACTORS]);
  };

  const clear = () => {
    if (props.onClear) {
      props.onClear();
      return;
    }
    if (onChange) onChange([]);
  };

  const noFactors = factors.length === 0;
  const randomizeDisabled =
    props.randomizeDisabled ?? props.disabled ?? noFactors;

  return (
    <div className="controls">
      <div className="controls__group">
        <span className="controls__label">Fixed factor:</span>
        <div className="controls__checkboxes">
          {ALL_FACTORS.map((f) => (
            <label key={f} className="controls__checkbox">
              <input
                type="checkbox"
                checked={selected.has(f)}
                onChange={() => toggle(f)}
              />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="controls__actions">
        <button type="button" onClick={selectAll}>
          Select all
        </button>
        <button type="button" onClick={clear}>
          Clear
        </button>
      </div>

      <div className="controls__readonly">
        Other factor: 1-12
      </div>

      {noFactors && (
        <div className="controls__message">Select at least one operand.</div>
      )}

      <div className="controls__buttons">
        <button
          type="button"
          className="controls__randomize"
          onClick={props.onRandomize}
          disabled={randomizeDisabled}
        >
          Randomize
        </button>
        <button
          type="button"
          className="controls__download"
          onClick={props.onDownload}
          disabled={props.downloadDisabled}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default Controls;
