import {createContext, useContext, type ReactNode} from "react";
import {services as defaultServices, type Services} from "../lib/services";

const ServiceContext = createContext<Services | null>(null);

interface ServiceProviderProps {
    children: ReactNode;
    services?: Partial<Services>;
}

export function ServiceProvider({children, services}: ServiceProviderProps) {
    const providedServices: Services = {
        ...defaultServices,
        ...services,
    };

    return (
        <ServiceContext.Provider value={providedServices}>
            {children}
        </ServiceContext.Provider>
    );
}

export function useServices(): Services {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error("useServices must be used within ServiceProvider");
    }
    return context;
}
