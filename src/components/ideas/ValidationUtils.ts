
export const validateIdeaData = (idea: any): boolean => {
  console.log("ValidationUtils: Validating idea data:", idea);
  
  if (!idea) {
    console.error("ValidationUtils: Idea is null or undefined");
    return false;
  }

  if (!idea.id || typeof idea.id !== 'string') {
    console.error("ValidationUtils: Invalid idea ID:", idea.id);
    return false;
  }

  if (!idea.title || typeof idea.title !== 'string' || idea.title.trim().length === 0) {
    console.error("ValidationUtils: Invalid idea title:", idea.title);
    return false;
  }

  if (!idea.description || typeof idea.description !== 'string' || idea.description.trim().length === 0) {
    console.error("ValidationUtils: Invalid idea description:", idea.description);
    return false;
  }

  if (!idea.created_at) {
    console.error("ValidationUtils: Invalid created_at:", idea.created_at);
    return false;
  }

  if (typeof idea.is_favorite !== 'boolean') {
    console.error("ValidationUtils: Invalid is_favorite:", idea.is_favorite);
    return false;
  }

  console.log("ValidationUtils: Idea data is valid");
  return true;
};

export const validateAnalysisData = (analysis: any): boolean => {
  console.log("ValidationUtils: Validating analysis data:", analysis);
  
  if (!analysis) {
    console.log("ValidationUtils: No analysis data provided (this is okay)");
    return true; // Analysis is optional
  }

  if (analysis.score !== null && analysis.score !== undefined) {
    if (typeof analysis.score !== 'number' || analysis.score < 0 || analysis.score > 100) {
      console.error("ValidationUtils: Invalid analysis score:", analysis.score);
      return false;
    }
  }

  if (analysis.status && typeof analysis.status !== 'string') {
    console.error("ValidationUtils: Invalid analysis status:", analysis.status);
    return false;
  }

  console.log("ValidationUtils: Analysis data is valid");
  return true;
};

export const sanitizeIdeaInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    console.warn("ValidationUtils: Invalid input for sanitization:", input);
    return '';
  }

  // Remove potentially harmful characters and trim whitespace
  const sanitized = input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 5000); // Limit length

  console.log("ValidationUtils: Input sanitized, original length:", input.length, "sanitized length:", sanitized.length);
  return sanitized;
};

export const validateUserPermissions = (userId: string, ideaUserId: string): boolean => {
  console.log("ValidationUtils: Validating user permissions - current user:", userId, "idea owner:", ideaUserId);
  
  if (!userId || !ideaUserId) {
    console.error("ValidationUtils: Missing user IDs for permission check");
    return false;
  }

  const hasPermission = userId === ideaUserId;
  console.log("ValidationUtils: User has permission:", hasPermission);
  return hasPermission;
};

export const logUserAction = (action: string, details: any = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`ValidationUtils: User action logged - ${action} at ${timestamp}`, details);
  
  // In a production environment, this could send logs to an external service
  // For now, we're just using console.log for debugging
};
