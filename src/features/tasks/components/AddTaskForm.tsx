import { useState, type FormEvent } from 'react';
import type { CreateTaskInput } from '../types/task';
import styles from './AddTaskForm.module.css';

interface AddTaskFormProps {
  apiError: string;
  isSubmitting: boolean;
  onCreate: (task: CreateTaskInput) => Promise<unknown>;
}

interface FormValues {
  title: string;
  description: string;
  category: string;
  dueDate: string;
}

const initialFormValues: FormValues = {
  title: '',
  description: '',
  category: '',
  dueDate: '',
};

export function AddTaskForm({
  apiError,
  isSubmitting,
  onCreate,
}: AddTaskFormProps) {
  const [values, setValues] = useState<FormValues>(initialFormValues);
  const [formError, setFormError] = useState('');

  function updateField(field: keyof FormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = values.title.trim();

    if (!title) {
      setFormError('A task title is required.');
      return;
    }

    setFormError('');

    try {
      await onCreate({
        title,
        description: values.description.trim(),
        category: values.category.trim(),
        dueDate: values.dueDate || null,
      });
      setValues(initialFormValues);
    } catch {
      // The page displays API errors. Keep entered values so the user can retry.
    }
  }

  return (
    <section className={styles.card} aria-labelledby='add-task-heading'>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>NEW TASK</p>
          <h2 id='add-task-heading'>Add a task</h2>
        </div>
        <span className={styles.required}>* Required</span>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.titleField}>
          Title *
          <input
            autoFocus
            maxLength={200}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder='Type a task name'
            value={values.title}
          />
        </label>

        <label>
          Category
          <input
            maxLength={100}
            onChange={(event) => updateField('category', event.target.value)}
            placeholder='e.g. Work'
            value={values.category}
          />
        </label>

        <label>
          Due date
          <input
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => updateField('dueDate', event.target.value)}
            type='date'
            value={values.dueDate}
          />
        </label>

        <label className={styles.descriptionField}>
          Description
          <textarea
            maxLength={1000}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder='Add optional details'
            rows={3}
            value={values.description}
          />
        </label>

        {(formError || apiError) && (
          <p className={styles.error} role='alert'>
            {formError || apiError}
          </p>
        )}

        <button
          className={styles.submitButton}
          disabled={isSubmitting}
          type='submit'
        >
          {isSubmitting ? 'Adding task…' : 'Add task'}
        </button>
      </form>
    </section>
  );
}
