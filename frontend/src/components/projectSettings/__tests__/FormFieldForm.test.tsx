import {render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {FormFieldForm} from "../FormFieldForm";

const Wrapper = ({children}: {children: React.ReactNode}) => (
    <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>{children}</DialogContent>
    </Dialog>
);

describe("FormFieldForm", () => {
    it("renders create mode title", () => {
        render(
            <Wrapper>
                <FormFieldForm
                    mode="create"
                    onSubmit={vi.fn()}
                    onCancel={vi.fn()}
                    isPending={false}
                />
            </Wrapper>,
        );
        expect(screen.getByText("Add a new Field")).toBeInTheDocument();
    });

    it("renders edit mode title", () => {
        render(
            <Wrapper>
                <FormFieldForm
                    mode="edit"
                    initialValues={{name: "Test", fieldType: "text"}}
                    onSubmit={vi.fn()}
                    onCancel={vi.fn()}
                    isPending={false}
                />
            </Wrapper>,
        );
        expect(screen.getByText("Edit Field")).toBeInTheDocument();
    });

    it("renders name input", () => {
        render(
            <Wrapper>
                <FormFieldForm
                    mode="create"
                    onSubmit={vi.fn()}
                    onCancel={vi.fn()}
                    isPending={false}
                />
            </Wrapper>,
        );
        expect(
            screen.getByPlaceholderText("e.g., Usefulness"),
        ).toBeInTheDocument();
    });

    it("renders field type label", () => {
        render(
            <Wrapper>
                <FormFieldForm
                    mode="create"
                    onSubmit={vi.fn()}
                    onCancel={vi.fn()}
                    isPending={false}
                />
            </Wrapper>,
        );
        expect(screen.getByText("Field Type")).toBeInTheDocument();
    });

    it("renders add field submit button in create mode", () => {
        render(
            <Wrapper>
                <FormFieldForm
                    mode="create"
                    onSubmit={vi.fn()}
                    onCancel={vi.fn()}
                    isPending={false}
                />
            </Wrapper>,
        );
        expect(screen.getByText("Add Field")).toBeInTheDocument();
    });

    it("renders save changes submit button in edit mode", () => {
        render(
            <Wrapper>
                <FormFieldForm
                    mode="edit"
                    initialValues={{name: "Test", fieldType: "text"}}
                    onSubmit={vi.fn()}
                    onCancel={vi.fn()}
                    isPending={false}
                />
            </Wrapper>,
        );
        expect(screen.getByText("Save Changes")).toBeInTheDocument();
    });
});
