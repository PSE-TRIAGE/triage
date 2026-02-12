import {create} from "zustand";
import type {MutantOverview} from "@/api/services/mutants.service";

interface MutantStore {
    projectId: number | null;
    selectedMutant: MutantOverview | null;
    mutants: MutantOverview[];
    isLoading: boolean;
    setProjectId: (projectId: number | null) => void;
    setSelectedMutant: (mutant: MutantOverview | null) => void;
    setMutants: (mutants: MutantOverview[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    markMutantAsRated: (mutantId: number) => void;
}

export const useMutantStore = create<MutantStore>((set) => ({
    projectId: null,
    selectedMutant: null,
    mutants: [],
    isLoading: false,
    setProjectId: (projectId) => set({projectId}),
    setSelectedMutant: (mutant) => set({selectedMutant: mutant}),
    setMutants: (mutants) => set({mutants}),
    setIsLoading: (isLoading) => set({isLoading}),
    markMutantAsRated: (mutantId) =>
        set((state) => ({
            mutants: state.mutants.map((m) =>
                m.id === mutantId ? {...m, rated: true} : m,
            ),
            selectedMutant:
                state.selectedMutant?.id === mutantId
                    ? {...state.selectedMutant, rated: true}
                    : state.selectedMutant,
        })),
}));
