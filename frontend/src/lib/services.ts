import {
    type AdminFormFieldService,
    AdminFormFieldServiceImpl,
} from "../api/services/admin-formfield.service";
import {
    type AdminUsersService,
    AdminUsersServiceImpl,
} from "../api/services/admin-users.service";
import {
    type AlgorithmsService,
    AlgorithmsServiceImpl,
} from "../api/services/algorithms.service";
import {type AuthService, AuthServiceImpl} from "../api/services/auth.service";
import {
    type ExportService,
    ExportServiceImpl,
} from "../api/services/export.service";
import {
    type MutantsService,
    MutantsServiceImpl,
} from "../api/services/mutants.service";
import {
    type ProjectsService,
    ProjectsServiceImpl,
} from "../api/services/projects.service";
import {
    type RatingsService,
    RatingsServiceImpl,
} from "../api/services/ratings.service";
import {type UserService, UserServiceImpl} from "../api/services/user.service";

export interface Services {
    authService: AuthService;
    projectsService: ProjectsService;
    userService: UserService;
    adminUsersService: AdminUsersService;
    adminFormFieldService: AdminFormFieldService;
    exportService: ExportService;
    algorithmsService: AlgorithmsService;
    mutantsService: MutantsService;
    ratingsService: RatingsService;
}

export const services: Services = {
    authService: new AuthServiceImpl(),
    projectsService: new ProjectsServiceImpl(),
    userService: new UserServiceImpl(),
    adminUsersService: new AdminUsersServiceImpl(),
    adminFormFieldService: new AdminFormFieldServiceImpl(),
    exportService: new ExportServiceImpl(),
    algorithmsService: new AlgorithmsServiceImpl(),
    mutantsService: new MutantsServiceImpl(),
    ratingsService: new RatingsServiceImpl(),
};
