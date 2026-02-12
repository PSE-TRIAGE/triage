// import {useState} from "react";
// import {useForm} from "react-hook-form";
// import {toast} from "sonner";
// import {FileInputGroup} from "../form/FileInputGroup";
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
// } from "../ui/dialog";
// import {LoadingButton} from "../ui/LoadingButton";
// import {Button} from "../ui/button";
//
// interface UploadedFileValues {
//     sourceCode: FileList;
//     pitReport: FileList;
// }
//
// type FieldName = keyof UploadedFileValues;
//
// export interface FileConfig {
//     name: FieldName;
//     label: string;
//     accept: string;
//     description: string;
//     validation: (files: FileList) => true | string;
//     icon: React.ReactNode;
// }
//
// function UploadForm({formFieldsConfig}: {formFieldsConfig: FileConfig[]}) {
//     const [isLoading, setIsLoading] = useState(false);
//     const [pendingFile, setPendingFile] = useState<{
//         name: FieldName;
//         file: File;
//     } | null>(null);
//
//     const {
//         register,
//         formState: {errors, isSubmitting},
//     } = useForm<UploadedFileValues>();
//
//     const onConfirmUpload = async () => {
//         if (!pendingFile) return;
//
//         try {
//             setIsLoading(true);
//
//             // Hier findet der tatsächliche Upload statt
//             // Wir nutzen pendingFile.file direkt, anstatt das ganze Formular zu submitten
//             await new Promise((resolve) => setTimeout(resolve, 1500));
//
//             toast.success(`${pendingFile.file.name} successfully uploaded!`);
//             // Warte kurz, damit der Toast sichtbar wird, dann reload
//             setTimeout(() => {
//                 location.reload();
//             }, 3000);
//         } catch (error) {
//             console.error(error);
//             toast.error("Upload failed, please try again");
//         } finally {
//             setIsLoading(false);
//             setPendingFile(null);
//         }
//     };
//
//     const activeConfig = pendingFile
//         ? formFieldsConfig.find((c) => c.name === pendingFile.name)
//         : null;
//
//     return (
//         <div className="space-y-6 py-4">
//             <form className="space-y-6">
//                 <div className="grid gap-6">
//                     {formFieldsConfig.map((field) => (
//                         <FileInputGroup
//                             key={field.name}
//                             label={field.label}
//                             accept={field.accept}
//                             error={errors[field.name]?.message as string}
//                             disabled={isSubmitting}
//                             // Wir nutzen register manuell, um onChange abzufangen
//                             {...register(field.name, {
//                                 validate: field.validation,
//                                 onChange: (e) => {
//                                     const file = e.target.files?.[0];
//                                     // Trigger Dialog bevor RHF den Wert final übernimmt (oder wir setzen ihn und fragen dann)
//                                     // Hier: Wir speichern es im State für den Dialog.
//                                     setPendingFile({
//                                         name: field.name,
//                                         file,
//                                     });
//                                 },
//                             })}
//                         />
//                     ))}
//                 </div>
//             </form>
//
//             {/* -- Der Bestätigungs-Dialog -- */}
//             <Dialog
//                 open={!!pendingFile}
//                 onOpenChange={(open) => !open && location.reload()}
//             >
//                 <DialogContent className="sm:max-w-[425px]">
//                     <DialogHeader>
//                         <DialogTitle>Confirm Selection</DialogTitle>
//                         <DialogDescription>
//                             {activeConfig?.description}
//                         </DialogDescription>
//                     </DialogHeader>
//
//                     <div className="flex flex-col items-center justify-center py-6 text-center">
//                         {activeConfig?.icon}
//                         <p className="font-medium text-lg">
//                             {pendingFile?.file.name}
//                         </p>
//                         <p className="text-sm text-muted-foreground">
//                             {(pendingFile?.file.size || 0) / 1024 < 1000
//                                 ? `${((pendingFile?.file.size || 0) / 1024).toFixed(1)} KB`
//                                 : `${((pendingFile?.file.size || 0) / (1024 * 1024)).toFixed(2)} MB`}
//                         </p>
//                     </div>
//
//                     <DialogFooter className="gap-2">
//                         <Button
//                             variant="outline"
//                             onClick={() => location.reload()}
//                             type="button"
//                         >
//                             Cancel
//                         </Button>
//                         <LoadingButton
//                             type="button"
//                             onClick={() => onConfirmUpload()}
//                             loadingText="Uploading..."
//                             loading={isLoading}
//                             disabled={isLoading}
//                             className="bg-primary hover:bg-primary/70"
//                         >
//                             Confirm Upload
//                         </LoadingButton>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// }
