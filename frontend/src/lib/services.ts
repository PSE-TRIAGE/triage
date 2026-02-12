import {AuthServiceImpl, type AuthService} from "../api/services/auth.service";
import {
    ProjectsServiceImpl,
    type ProjectsService,
} from "../api/services/projects.service";
import {UserServiceImpl, type UserService} from "../api/services/user.service";
import {
    AdminUsersServiceImpl,
    type AdminUsersService,
} from "../api/services/admin-users.service";
import {
    AdminFormFieldServiceImpl,
    type AdminFormFieldService,
} from "../api/services/admin-formfield.service";
import {
    ExportServiceImpl,
    type ExportService,
} from "../api/services/export.service";
import {
    AlgorithmsServiceImpl,
    type AlgorithmsService,
} from "../api/services/algorithms.service";
import {
    MutantsServiceImpl,
    type MutantsService,
} from "../api/services/mutants.service";
import {
    RatingsServiceImpl,
    type RatingsService,
} from "../api/services/ratings.service";

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
