import { test, expect } from "@playwright/experimental-ct-react";
import { SourceCodeViewer } from "@/components/review/SourceCodeViewer";
import { makeMutant } from "../pw-test-utils";

test.describe("SourceCodeViewer", () => {
  test("renders nothing when no mutant is selected", async ({ mount }) => {
    const component = await mount(
      <SourceCodeViewer />,
      { hooksConfig: { mutantStore: { projectId: 1 } } },
    );

    // Should render an empty container
    await expect(component).toBeAttached();
  });

  test("shows loading state while fetching source", async ({ mount }) => {
    const component = await mount(
      <SourceCodeViewer />,
      { hooksConfig: { mutantStore: { projectId: 1, selectedMutant: makeMutant({ id: 1, lineNumber: 10 }) }, sourceCodeSlow: true } },
    );

    await expect(component.getByText("Loading source code...")).toBeVisible();
  });

  test("shows not available when source code not found", async ({ mount }) => {
    const component = await mount(
      <SourceCodeViewer />,
      { hooksConfig: { mutantStore: { projectId: 1, selectedMutant: makeMutant({ id: 1, lineNumber: 10 }) }, sourceCodeNotFound: true } },
    );

    await expect(component.getByText("Source code not available")).toBeVisible();
  });

  test("renders source code with highlighted line", async ({ mount }) => {
    const component = await mount(
      <SourceCodeViewer />,
      { hooksConfig: { mutantStore: { projectId: 1, selectedMutant: makeMutant({ id: 1, lineNumber: 3 }) }, sourceCode: { content: "public class Foo {\n    public int bar() {\n        return x > 0 ? x : -x;\n    }\n}", fullyQualifiedName: "com.example.Foo" } } },
    );

    await expect(component.getByText("com.example.Foo")).toBeVisible();
  });
});
