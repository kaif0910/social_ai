/**
 * Safely extract and parse JSON from AI response text.
 * Handles markdown code blocks, trailing text, and common issues.
 */
function safeParseJSON(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty or invalid AI response");
  }

  // Remove markdown code fences
  let clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

  // Try direct parse first
  try {
    return JSON.parse(clean.trim());
  } catch {
    // Fall through
  }

  // Extract first JSON object/array
  const jsonStart = clean.indexOf("{");
  const arrStart = clean.indexOf("[");

  let start;
  let end;

  if (jsonStart === -1 && arrStart === -1) {
    throw new Error("No JSON found in AI response");
  }

  if (jsonStart === -1) {
    start = arrStart;
    end = clean.lastIndexOf("]");
  } else if (arrStart === -1) {
    start = jsonStart;
    end = clean.lastIndexOf("}");
  } else {
    start = Math.min(jsonStart, arrStart);
    end = start === jsonStart ? clean.lastIndexOf("}") : clean.lastIndexOf("]");
  }

  if (end <= start) {
    throw new Error("Malformed JSON in AI response");
  }

  const extracted = clean.slice(start, end + 1);

  try {
    return JSON.parse(extracted);
  } catch (err) {
    // Try fixing common issues: trailing commas
    const fixed = extracted
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
    return JSON.parse(fixed);
  }
}

module.exports = safeParseJSON;
