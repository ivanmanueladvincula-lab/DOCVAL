/**
 * Extracts a meaningful error message from various error types
 * @param {Error|any} error - The error object
 * @returns {string} - A meaningful error message
 */
export function getErrorMessage(error) {
  if (!error) {
    return "An unknown error occurred";
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle MSSQL errors with originalError
  if (error.originalError?.message) {
    return error.originalError.message;
  }

  // Handle standard Error objects
  if (error.message) {
    return error.message;
  }

  // Handle error objects with error property
  if (error.error) {
    return typeof error.error === "string" ? error.error : String(error.error);
  }

  // Fallback
  return String(error);
}
