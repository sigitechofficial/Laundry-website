const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const digitsOnly = (s) => String(s ?? "").replace(/\D/g, "");

/** Returns a map of field -> message; empty when valid. */
export function validateMessage({ name, email, message }) {
  const errors = {};
  if (!name.trim()) errors.name = "Enter your name.";
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email address, like you@email.com.";
  if (!message.trim()) errors.message = "Tell us how we can help.";
  else if (message.trim().length < 10) errors.message = "Please add a little more detail.";
  return errors;
}

/**
 * There is no message endpoint on the backend yet, so the form opens the
 * visitor's email app addressed to support, with everything pre-filled.
 */
export function buildMailto(to, { name, email, topic, message }) {
  const subject = `${topic} - message from ${name.trim()}`;
  const body = `${message.trim()}\n\n---\nName: ${name.trim()}\nEmail: ${email.trim()}\nTopic: ${topic}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
