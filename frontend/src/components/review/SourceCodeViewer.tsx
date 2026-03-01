import {FileCode, Loader2, AlertCircle, ChevronUp, ChevronDown} from "lucide-react";
import {useMutantSourceCode} from "@/hooks/queries/useMutantQueries";
import {useMutantStore} from "@/stores/mutantStore";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useState, useMemo, useEffect} from "react";
import {useTheme} from "@/components/utils/theme-provider";
import {Highlight, themes} from "prism-react-renderer";
import Prism from "prismjs";

const INITIAL_CONTEXT = 5;
const EXPAND_BY = 10;

const darkTheme = {
    ...themes.nightOwl,
    plain: {
        ...themes.nightOwl.plain,
        backgroundColor: "transparent",
    },
};

const lightTheme = {
    ...themes.github,
    plain: {
        ...themes.github.plain,
        backgroundColor: "transparent",
    },
};

let javaLoaded = false;

export function SourceCodeViewer() {
    const selectedMutant = useMutantStore((state) => state.selectedMutant);
    const {data: sourceCode, isLoading, error} = useMutantSourceCode(selectedMutant?.id);
    const {theme} = useTheme();
    const [expandedContext, setExpandedContext] = useState({above: INITIAL_CONTEXT, below: INITIAL_CONTEXT});
    const [isJavaLoaded, setIsJavaLoaded] = useState(javaLoaded);

    useEffect(() => {
        if (!javaLoaded) {
            import("prismjs/components/prism-java").then(() => {
                javaLoaded = true;
                setIsJavaLoaded(true);
            });
        }
    }, []);

    const prismTheme = useMemo(() => (theme === "dark" ? darkTheme : lightTheme), [theme]);

    if (!selectedMutant) {
        return null;
    }

    if (isLoading || !isJavaLoaded) {
        return (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading source code...</span>
            </div>
        );
    }

    if (error || !sourceCode?.found) {
        return (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">Source code not available</span>
            </div>
        );
    }

    const content = sourceCode.content ?? "";
    const lineNumber = selectedMutant.lineNumber;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/50">
                <FileCode className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono truncate text-muted-foreground">
                    {sourceCode.fullyQualifiedName}
                </span>
            </div>
            <ScrollArea className="flex-1">
                <Highlight prism={Prism} theme={prismTheme} code={content} language="java">
                    {({tokens, getLineProps, getTokenProps}) => {
                        const totalLines = tokens.length;
                        const startLine = Math.max(1, lineNumber - expandedContext.above);
                        const endLine = Math.min(totalLines, lineNumber + expandedContext.below);
                        const visibleTokens = tokens.slice(startLine - 1, endLine);

                        const hasHiddenLinesAbove = startLine > 1;
                        const hasHiddenLinesBelow = endLine < totalLines;
                        const hiddenLinesAbove = startLine - 1;
                        const hiddenLinesBelow = totalLines - endLine;

                        const showAllAbove = () => {
                            setExpandedContext((prev) => ({...prev, above: lineNumber - 1}));
                        };

                        const showAllBelow = () => {
                            setExpandedContext((prev) => ({...prev, below: totalLines - lineNumber}));
                        };

                        const expandAbove = () => {
                            setExpandedContext((prev) => ({
                                ...prev,
                                above: Math.min(prev.above + EXPAND_BY, lineNumber - 1),
                            }));
                        };

                        const expandBelow = () => {
                            setExpandedContext((prev) => ({
                                ...prev,
                                below: Math.min(prev.below + EXPAND_BY, totalLines - lineNumber),
                            }));
                        };

                        return (
                            <div className="font-mono text-sm">
                                {hasHiddenLinesAbove && (
                                    <ExpandButton
                                        onClick={expandAbove}
                                        onDoubleClick={showAllAbove}
                                        hiddenCount={hiddenLinesAbove}
                                        direction="up"
                                    />
                                )}

                                {visibleTokens.map((line, idx) => {
                                    const currentLineNum = startLine + idx;
                                    const isMutationLine = currentLineNum === lineNumber;

                                    return (
                                        <div
                                            key={currentLineNum}
                                            {...getLineProps({line})}
                                            className={`flex ${
                                                isMutationLine
                                                    ? "bg-destructive/20 border-l-2 border-destructive"
                                                    : ""
                                            }`}
                                        >
                                            <span className="select-none text-right px-3 py-0.5 text-muted-foreground/50 w-12 shrink-0">
                                                {currentLineNum}
                                            </span>
                                            <pre className="px-3 py-0.5 whitespace-pre overflow-x-auto flex-1">
                                                {line.map((token, tokenIdx) => (
                                                    // biome-ignore lint/suspicious/noArrayIndexKey: tokens are static and have no stable IDs
                                                    <span key={tokenIdx} {...getTokenProps({token})} />
                                                ))}
                                            </pre>
                                        </div>
                                    );
                                })}

                                {hasHiddenLinesBelow && (
                                    <ExpandButton
                                        onClick={expandBelow}
                                        onDoubleClick={showAllBelow}
                                        hiddenCount={hiddenLinesBelow}
                                        direction="down"
                                    />
                                )}
                            </div>
                        );
                    }}
                </Highlight>
            </ScrollArea>
        </div>
    );
}

function ExpandButton({
    onClick,
    onDoubleClick,
    hiddenCount,
    direction,
}: {
    onClick: () => void;
    onDoubleClick: () => void;
    hiddenCount: number;
    direction: "up" | "down";
}) {
    const Icon = direction === "up" ? ChevronUp : ChevronDown;

    return (
        <button
            type="button"
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
            title={`Click: Show ${EXPAND_BY} more lines | Double-click: Show all ${hiddenCount} lines`}
        >
            <Icon className="w-3.5 h-3.5" />
            <span>
                {hiddenCount} line{hiddenCount !== 1 ? "s" : ""} hidden
            </span>
        </button>
    );
}
