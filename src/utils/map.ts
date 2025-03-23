import { Program, Literal, Property } from "acorn";
import { fullAncestor } from "acorn-walk";

/**
 * Extracts a mapping of module IDs to template strings.
 *
 * For each literal string in the AST that starts with "templates", it finds the closest
 * ancestor property whose value is a function (either arrow or function expression) and
 * uses the property key (assumed to be a number literal) as the module ID.
 *
 * @param ast The AST of the program.
 * @returns An object mapping module IDs to arrays of template strings.
 */
export function extractTemplateMap(ast: Program) {
  const templateMap: { [moduleId: number]: string[] } = {};

  // Walk through the AST with full ancestor tracking.
  fullAncestor(ast, (node: Literal, _state, ancestors, type) => {
    // Process only Literal nodes.
    if (type !== "Literal") {
      return;
    }
    // Skip non-string literals.
    if (typeof node.value !== "string") {
      return;
    }

    // Check if the literal string starts with "templates".
    if (node.value.startsWith("templates")) {
      // Look for the nearest ancestor property with a function value.
      const propertyAncestor = ancestors.find(
        (ancestor: Property): ancestor is Property =>
          ancestor.type === "Property" &&
          (ancestor.value.type === "ArrowFunctionExpression" ||
            ancestor.value.type === "FunctionExpression"),
      ) as Property | undefined;

      if (!propertyAncestor) {
        return;
      }

      // Extract the module ID from the property's key.
      const moduleId = (propertyAncestor.key as Literal).value as number;

      // Ensure a valid moduleId exists.
      if (moduleId != null) {
        if (!templateMap[moduleId]) {
          templateMap[moduleId] = [];
        }

        // Add the template string if it hasn't been added before.
        if (!templateMap[moduleId].includes(node.value)) {
          templateMap[moduleId].push(node.value);
        }
      }
    }
  });

  return templateMap;
}
