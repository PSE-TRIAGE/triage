export function formatMutatorForLineBreaks(mutator: string): string {
    return mutator.replaceAll(".", ".\u200b");
}
