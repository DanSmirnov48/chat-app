import { useCallback, useState } from 'react';
import * as z from "zod";
import { useUserContext } from '@/context/AuthContext'
import { UserImage } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDropzone } from "@uploadthing/react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useUploadThing } from "@/utils/uploadthing";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const ProfileUpdateValidation = z.object({
    name: z.string().min(2, { message: "Must be at least 2 characters." }),
    bio: z.string().min(2, { message: "Must be at least 2 characters." }),
    email: z.string().email(),
    image: z.custom<UserImage>(),
});

const UserProfileForm = () => {
    const { user } = useUserContext();

    const [file, setFile] = useState<File[]>([]);
    const [fileUrl, setFileUrl] = useState<string>(user.image && user.image.url);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFile(acceptedFiles);
    }, []);

    const { startUpload, permittedFileInfo, } = useUploadThing("imageUploader", {
        onClientUploadComplete: (data) => { console.log(data) },
        onUploadError: (error: Error) => { console.log(error) },
        onUploadBegin: (fileName: string) => { console.log("upload started for ", fileName) },
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
        console.log({ value })
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

                <Button type="submit">
                    Update Profile
                </Button>

            </form>
        </Form>
    );
};

export default UserProfileForm