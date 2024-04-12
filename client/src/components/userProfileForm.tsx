import { useCallback, useState } from 'react';
import * as z from "zod";
import { useUserContext } from '@/context/AuthContext'
import { UserImage } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDropzone } from "@uploadthing/react/hooks";
import { FileWithPath } from "@uploadthing/react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useUploadThing } from "@/utils/uploadthing";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUpdateMyAccount } from '@/lib/react-query/queries/auth';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";

const ProfileUpdateValidation = z.object({
    name: z.string().min(2, { message: "Must be at least 2 characters." }),
    bio: z.string().optional(),
    email: z.string().email(),
    image: z.custom<UserImage>(),
});

const convertFileToUrl = (file: File) => URL.createObjectURL(file);

const UserProfileForm = () => {
    const { user } = useUserContext();

    const [file, setFile] = useState<FileWithPath[]>([]);
    const [fileUrl, setFileUrl] = useState<string | undefined>(user.image && user.image.url);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const { mutateAsync: updateMyAccount, isPending: isLoadingUpdate } = useUpdateMyAccount()

    const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
        const newFile = [...acceptedFiles];
        const newFileUrls = newFile.map(convertFileToUrl);

        setFile(newFile);
        setFileUrl(newFileUrls[0]);
    }, [file]);

    const { startUpload, isUploading, permittedFileInfo, } = useUploadThing("imageUploader", {
        onClientUploadComplete: (data) => { console.log(data) },
        onUploadError: (error: Error) => { console.log(error) },
        onUploadBegin: (fileName: string) => { console.log("upload started for ", fileName) },
        onUploadProgress: (progress: number) => setUploadProgress(progress),
    });

    const fileTypes = permittedFileInfo?.config ? Object.keys(permittedFileInfo?.config) : [];

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
        maxFiles: 1
    });

    const form = useForm<z.infer<typeof ProfileUpdateValidation>>({
        resolver: zodResolver(ProfileUpdateValidation),
        defaultValues: {
            name: user.name,
            bio: user.bio,
            image: user.image,
            email: user.email,
        },
    });

    const handleUpdate = async (value: z.infer<typeof ProfileUpdateValidation>) => {
        try {
            let userDetails = ({
                name: value.name,
                bio: value.bio,
                image: user.image ? user.image : undefined
            })

            // if (file.length > 0) {

            //     const UploadFileResponse = await startUpload(file)
            //     //extrach the file values from the uplaod resposne
            //     const { key, name, url } = UploadFileResponse![0]
            //     console.log(key, name, url)
            //     //create a new userDetails object with the user photo
            //     userDetails = ({
            //         name: value.name,
            //         bio: value.bio,
            //         image: { key, name, url }
            //     })
            // }

            // console.log(userDetails)
            const res = await updateMyAccount(userDetails)
            console.log(res)
            if (res && res.status === 200) {
                toast.success('Your Profile was successfully updated')
            } else {
                toast.error('Unknown Error at Profile Update')
            }
        } catch (error) {
            toast.error('Unknown Error', {
                description: `${error}`,
            })
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleUpdate)}
                className="flex flex-col gap-5 w-full mt-4 max-w-5xl mb-5"
            >
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem className="flex">
                            <FormControl>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} className="cursor-pointer" />
                                    <div className="cursor-pointer flex-center gap-4 flex flex-row items-center">
                                        <Avatar className="h-28 w-28 border-4">
                                            <AvatarImage
                                                src={fileUrl}
                                                alt={user.email}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="text-3xl font-semibold">{user.name.slice(0, 1)}</AvatarFallback>
                                        </Avatar>
                                        <p className="small-regular md:base-semibold text-dark-4 dark:text-muted-foreground">Change profile photo</p>
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Name</FormLabel>
                            <FormControl>
                                <Input type="text" className="h-10" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Bio</FormLabel>
                            <FormControl>
                                <Input type="text" className="h-10" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Email</FormLabel>
                            <FormControl>
                                <Input type="text" className="h-10" {...field} disabled />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isUploading || isLoadingUpdate}>
                    {(isUploading || isLoadingUpdate) ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5 mr-3" />
                            Uploading...
                        </>
                    ) : (
                        <>Save</>
                    )}
                </Button>

            </form>
        </Form>
    );
};

export default UserProfileForm