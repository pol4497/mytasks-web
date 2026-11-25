import { useState, type FormEvent } from 'react';
import { useSession } from '../hooks/useSession';
import styles from './AuthPanel.module.css';

type AuthMode = 'login' | 'register';

interface AuthPanelProps {
  onClose: () => void;
  onComplete: () => void;
}

interface AuthFormValues {
  username: string;
  email: string;
  password: string;
}

const emptyValues: AuthFormValues = {
  username: '',
  email: '',
  password: '',
};

export function AuthPanel({ onClose, onComplete }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [values, setValues] = useState<AuthFormValues>(emptyValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error: sessionError, login, register } = useSession();

  const isRegisterMode = mode === 'register';

  function updateField(field: keyof AuthFormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await register({
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password,
        });
      } else {
        await login({
          username: values.username.trim(),
          password: values.password,
        });
      }

      onComplete();
    } catch {
      // SessionProvider exposes the API error below the form.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby='auth-panel-title'>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>ACCOUNT</p>
          <h2 id='auth-panel-title'>
            {isRegisterMode ? 'Create an account' : 'Sign in'}
          </h2>
        </div>
        <button className={styles.closeButton} onClick={onClose} type='button'>
          Close
        </button>
      </div>

      <p className={styles.description}>
        {isRegisterMode
          ? 'Your guest tasks will move to your new account.'
          : 'Sign in to continue with your saved tasks.'}
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Username
          <input
            autoComplete='username'
            autoFocus
            minLength={3}
            onChange={(event) => updateField('username', event.target.value)}
            required
            value={values.username}
          />
        </label>

        {isRegisterMode && (
          <label>
            Email
            <input
              autoComplete='email'
              onChange={(event) => updateField('email', event.target.value)}
              required
              type='email'
              value={values.email}
            />
          </label>
        )}

        <label>
          Password
          <input
            autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
            minLength={8}
            onChange={(event) => updateField('password', event.target.value)}
            required
            type='password'
            value={values.password}
          />
        </label>

        {sessionError && (
          <p className={styles.error} role='alert'>
            {sessionError}
          </p>
        )}

        <button
          className={styles.submitButton}
          disabled={isSubmitting}
          type='submit'
        >
          {isSubmitting
            ? 'Please wait…'
            : isRegisterMode
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>

      <p className={styles.switchMode}>
        {isRegisterMode ? 'Already have an account?' : 'New here?'}{' '}
        <button
          onClick={() => switchMode(isRegisterMode ? 'login' : 'register')}
          type='button'
        >
          {isRegisterMode ? 'Sign in' : 'Create an account'}
        </button>
      </p>
    </section>
  );
}
