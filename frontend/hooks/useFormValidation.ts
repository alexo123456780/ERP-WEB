import { useState, useCallback, useRef } from 'react';
import { validationMessages as vm } from '../lib/validationMessages';

export type ValidationRule =
  | { type: 'required' }
  | { type: 'email' }
  | { type: 'onlyNumbers' }
  | { type: 'maxLength'; value: number }
  | { type: 'minLength'; value: number }
  | { type: 'exactLength'; value: number }
  | { type: 'phone' }
  | { type: 'custom'; validate: (value: string) => string | undefined };

export type FieldRules<T> = Partial<Record<keyof T, ValidationRule[]>>;

function applyRules(value: string, rules: ValidationRule[]): string | undefined {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!value.trim()) return vm.required;
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return vm.email;
        break;
      case 'onlyNumbers':
        if (value && !/^\d+$/.test(value)) return vm.onlyNumbers;
        break;
      case 'maxLength':
        if (value.length > rule.value) return vm.maxLength(rule.value);
        break;
      case 'minLength':
        if (value && value.length < rule.value) return vm.minLength(rule.value);
        break;
      case 'exactLength':
        if (value && value.length !== rule.value) return vm.exactLength(rule.value);
        break;
      case 'phone':
        if (value && !/^\d{10}$/.test(value)) return vm.phone;
        break;
      case 'custom': {
        const msg = rule.validate(value);
        if (msg) return msg;
        break;
      }
    }
  }
  return undefined;
}

export function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  rules: FieldRules<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string | undefined>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  // Stable refs so callbacks always use the latest values/rules without stale closures
  const rulesRef = useRef(rules);
  rulesRef.current = rules;

  const valuesRef = useRef(values);
  valuesRef.current = values;

  const touchedRef = useRef(touched);
  touchedRef.current = touched;

  const validateOne = useCallback((field: keyof T, value: string): string | undefined => {
    const fieldRules = rulesRef.current[field];
    if (!fieldRules) return undefined;
    return applyRules(value, fieldRules);
  }, []);

  const handleChange = useCallback((field: keyof T, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // Re-validate live only if the field has already been touched
    if (touchedRef.current[field]) {
      const error = validateOne(field, value);
      setErrors((e) => ({ ...e, [field]: error }));
    }
  }, [validateOne]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const error = validateOne(field, valuesRef.current[field] ?? '');
    setErrors((e) => ({ ...e, [field]: error }));
  }, [validateOne]);

  /** Validates all rule-bound fields, marks them all as touched. Returns true if form is valid. */
  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string | undefined>> = {};
    const newTouched: Partial<Record<keyof T, boolean>> = {};
    for (const field of Object.keys(rulesRef.current) as (keyof T)[]) {
      newTouched[field] = true;
      const error = applyRules(valuesRef.current[field] ?? '', rulesRef.current[field]!);
      if (error) newErrors[field] = error;
    }
    setErrors(newErrors);
    setTouched((t) => ({ ...t, ...newTouched }));
    return Object.keys(newErrors).length === 0;
  }, []);

  const reset = useCallback((newValues?: Partial<T>) => {
    setValues(newValues ? { ...initialValues, ...newValues } as T : initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /** Returns the error message for a field only if it has been touched. */
  const fieldError = (field: keyof T): string | undefined =>
    touched[field] ? (errors[field] ?? undefined) : undefined;

  const hasErrors = Object.values(errors).some(Boolean);
  const hasBeenTouched = Object.values(touched).some(Boolean);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    fieldError,
    reset,
    setValues,
    /** True when there are no validation errors (may include untouched fields). */
    isValid: !hasErrors,
    /** True when the user has touched at least one field AND there are active errors. Use to disable the submit button. */
    submitDisabled: hasBeenTouched && hasErrors,
  };
}
